#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { checkEnvVariables, getShortEnvironmentName } from '../utils/check-environment-variable';

import { ApplyTags } from '../utils/apply-tag';
import { Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { AwsOpensearchServerlessStackProps } from '../lib/AwsOpensearchServerlessStackProps';
import { AwsOpensearchServerlessStack } from '../lib/aws-opensearch-serverless-stack';

dotenv.config(); // Load environment variables from .env file
const app = new cdk.App();

const appAspects = Aspects.of(app);

// check APP_NAME variable
checkEnvVariables('APP_NAME',
    'CDK_DEPLOY_REGION',
    'ENVIRONMENT',
    'VPC_SUBNET_TYPE',
    'VPC_PRIVATE_SUBNET_IDS',
    'OWNER',
    'VPC_ID',
    'OPENSEARCH_USER_NAME',
    'OPENSEARCH_USER_PASSWORD',
);

const { CDK_DEFAULT_ACCOUNT: account } = process.env;

const cdkRegion = process.env.CDK_DEPLOY_REGION;
const deployEnvironment = process.env.ENVIRONMENT!;
const shortDeployEnvironment = getShortEnvironmentName(deployEnvironment);
const appName = process.env.APP_NAME!;
const owner = process.env.OWNER!;

// check best practices based on AWS Solutions Security Matrix
// appAspects.add(new AwsSolutionsChecks());

appAspects.add(new ApplyTags({
    environment: deployEnvironment as 'development' | 'staging' | 'production' | 'feature',
    project: appName,
    owner: owner,
}));

const stackProps: AwsOpensearchServerlessStackProps = {
    resourcePrefix: `${appName}-${shortDeployEnvironment}`,
    env: {
        region: cdkRegion,
        account,
    },
    deployRegion: cdkRegion,
    deployEnvironment,
    shortDeployEnvironment,
    appName,
    vpcSubnetType: process.env.VPC_SUBNET_TYPE!,
    owner,
    vpcId: process.env.VPC_ID!,
    vpcPrivateSubnetIds: process.env.VPC_PRIVATE_SUBNET_IDS!.split(','),
    vpcPrivateSubnetAzs: process.env.VPC_PRIVATE_SUBNET_AZS!.split(','),
    vpcPrivateSubnetRouteTableIds: process.env.VPC_PRIVATE_SUBNET_ROUTE_TABLE_IDS!.split(','),
    opensearchUserName: process.env.OPENSEARCH_USER_NAME!,
    opensearchUserPassword: process.env.OPENSEARCH_USER_PASSWORD!,
};
new AwsOpensearchServerlessStack(app, `AwsOpensearchServerlessStack`, {
    ...stackProps,
    stackName: `${deployEnvironment}-${cdkRegion}-AwsOpensearchServerlessStack`,
    description: `AwsOpensearchServerlessStack for ${appName} in ${cdkRegion} ${deployEnvironment}.`,
});

app.synth();
