import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AwsOpensearchServerlessStackProps } from './AwsOpensearchServerlessStackProps';

export class AwsOpensearchServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsOpensearchServerlessStackProps) {
    super(scope, id, props);
  }
}
