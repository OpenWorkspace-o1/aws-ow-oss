#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsOpensearchServerlessStack } from '../lib/aws-opensearch-serverless-stack';

const app = new cdk.App();
new AwsOpensearchServerlessStack(app, 'AwsOpensearchServerlessStack', {
});
