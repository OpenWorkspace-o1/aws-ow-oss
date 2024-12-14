import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
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

    const kmsKey = new kms.Key(this, `${props.resourcePrefix}-OS-KMS-Key`, {
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enabled: true,
      keyUsage: kms.KeyUsage.ENCRYPT_DECRYPT,
      keySpec: kms.KeySpec.SYMMETRIC_DEFAULT,
    });

    const opensearchDomain = new opensearch.Domain(this, `${props.resourcePrefix}-OpenSearchDomain`, {
      vpc: vpc,
      vpcSubnets: [vpcSubnetSelection],
      version: opensearch.EngineVersion.OPENSEARCH_2_17,
      enableAutoSoftwareUpdate: true,
      enableVersionUpgrade: true,
      encryptionAtRest: {
        kmsKey: kmsKey,
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
    });

    // export opensearchDomain domain
    new cdk.CfnOutput(this, `${props.resourcePrefix}-OpenSearchDomain-Output`, {
      value: opensearchDomain.domainEndpoint,
      exportName: `${props.resourcePrefix}-OpenSearchDomain-Endpoint`,
      description: 'OpenSearch Domain Endpoint',
    });
  }
}
