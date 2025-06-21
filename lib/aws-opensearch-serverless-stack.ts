import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import { Construct } from 'constructs';
import { AwsOpensearchServerlessStackProps } from './AwsOpensearchServerlessStackProps';
import { parseVpcSubnetType } from '../utils/vpc-type-parser';
import { SubnetSelection } from 'aws-cdk-lib/aws-ec2';
import { SecretValue } from 'aws-cdk-lib';

export class AwsOpensearchServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsOpensearchServerlessStackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, `${props.resourcePrefix}-VPC-Imported`, {
      vpcId: props.vpcId,
    });
    const vpcSubnetType = parseVpcSubnetType(props.vpcSubnetType);

    // define subnetAttributes as an array of Record<string, string> with subnetId comes from props.vpcPrivateSubnetIds and availabilityZone comes from props.vpcPrivateSubnetAzs
    const subnetAttributes: Record<string, string>[] = props.vpcPrivateSubnetIds.map((subnetId, index) => {
      return {
        subnetId: subnetId,
        availabilityZone: props.vpcPrivateSubnetAzs[index],
        routeTableId: props.vpcPrivateSubnetRouteTableIds[index],
        type: vpcSubnetType,
      };
    });
    console.log('subnetAttributes:', JSON.stringify(subnetAttributes));

    // retrieve subnets from vpc
    const vpcPrivateISubnets: cdk.aws_ec2.ISubnet[] = subnetAttributes.map((subnetAttribute) => {
      return ec2.Subnet.fromSubnetAttributes(this, subnetAttribute.subnetId, {
        subnetId: subnetAttribute.subnetId,
        availabilityZone: subnetAttribute.availabilityZone,
        routeTableId: subnetAttribute.routeTableId,
      });
    });
    const vpcSubnetSelection: SubnetSelection = vpc.selectSubnets({
      subnets: vpcPrivateISubnets,
      availabilityZones: props.vpcPrivateSubnetAzs,
    });

    const ossKmsKey = new kms.Key(this, `${props.resourcePrefix}-OSS-KMS-Key`, {
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enabled: true,
      keyUsage: kms.KeyUsage.ENCRYPT_DECRYPT,
      keySpec: kms.KeySpec.SYMMETRIC_DEFAULT,
    });

    const openSearchSecGrp = new ec2.SecurityGroup(this, `${props.resourcePrefix}-OpenSearch-Security-Group`, {
      vpc,
      allowAllOutbound: false,
      description: `${props.resourcePrefix}-OpenSearch-Security-Group`,
    });
    openSearchSecGrp.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const opensearchDomain = new opensearch.Domain(this, `${props.resourcePrefix}-OpenSearchDomain`, {
      vpc: vpc,
      securityGroups: [openSearchSecGrp],
      vpcSubnets: [vpcSubnetSelection],
      version: opensearch.EngineVersion.OPENSEARCH_2_17,
      enableAutoSoftwareUpdate: true,
      enableVersionUpgrade: true,
      encryptionAtRest: {
        kmsKey: ossKmsKey,
        enabled: true,
      },
      nodeToNodeEncryption: true,
      enforceHttps: true,
      fineGrainedAccessControl: {
        masterUserName: props.opensearchUserName,
        masterUserPassword: SecretValue.unsafePlainText(props.opensearchUserPassword),
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      ebs: {
        enabled: true,
        volumeSize: 10,
        volumeType: ec2.EbsDeviceVolumeType.GENERAL_PURPOSE_SSD_GP3,
      },
      zoneAwareness: {
        enabled: true,
        availabilityZoneCount: 3,
      },
      useUnsignedBasicAuth: false,
      capacity: {
        // 3 master nodes
        masterNodes: 3,
        masterNodeInstanceType: 'C7g.large.search',
        // 3 data nodes
        dataNodes: 3,
        dataNodeInstanceType: 'C7g.large.search',
        multiAzWithStandbyEnabled: false,
        // read more at https://docs.aws.amazon.com/opensearch-service/latest/developerguide/supported-instance-types.html
      },
      logging: {
        slowSearchLogEnabled: true,
        slowIndexLogEnabled: true,
        appLogEnabled: true,
        slowSearchLogGroup: new logs.LogGroup(this, `${props.resourcePrefix}-OS-SlowSearchLogs`, {
          retention: logs.RetentionDays.ONE_MONTH,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
        slowIndexLogGroup: new logs.LogGroup(this, `${props.resourcePrefix}-OS-SlowIndexLogs`, {
          retention: logs.RetentionDays.ONE_MONTH,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
        appLogGroup: new logs.LogGroup(this, `${props.resourcePrefix}-OS-AppLogs`, {
          retention: logs.RetentionDays.ONE_MONTH,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      },
    });

    // export opensearchDomain domain endpoint
    new cdk.CfnOutput(this, `${props.resourcePrefix}-OpenSearchDomain-Endpoint-Output`, {
      value: `https://${opensearchDomain.domainEndpoint}`,
      exportName: `${props.resourcePrefix}-OpenSearchDomain-Endpoint`,
      description: 'OpenSearch Domain Endpoint',
    });

    // export opensearchDomain domain name
    new cdk.CfnOutput(this, `${props.resourcePrefix}-OpenSearchDomain-Name-Output`, {
      value: opensearchDomain.domainName,
      exportName: `${props.resourcePrefix}-OpenSearchDomain-Name`,
      description: 'OpenSearch Domain Name',
    });

    // export kmsKey key id
    new cdk.CfnOutput(this, `${props.resourcePrefix}-OpenSearch-KMS-Key-Id-Output`, {
      value: ossKmsKey.keyId,
      exportName: `${props.resourcePrefix}-OpenSearch-KMS-Key-Id`,
      description: 'OpenSearch KMS Key Id',
    });

    // export kmsKey key arn
    new cdk.CfnOutput(this, `${props.resourcePrefix}-OpenSearch-KMS-Key-Arn-Output`, {
      value: ossKmsKey.keyArn,
      exportName: `${props.resourcePrefix}-OpenSearch-KMS-Key-Arn`,
      description: 'OpenSearch KMS Key Arn',
    });
  }
}
