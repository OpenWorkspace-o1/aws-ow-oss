# AWS OpenSearch Serverless CDK Infrastructure

This project provides Infrastructure as Code (IaC) for deploying an AWS OpenSearch Serverless domain using AWS CDK v2 with TypeScript.

## Project Overview

This CDK application deploys a secure OpenSearch domain with the following features:
- VPC deployment with configurable subnet types
- KMS encryption for data at rest
- Fine-grained access control
- Multi-AZ deployment
- Enhanced security group configurations
- Comprehensive logging setup

## Features

- 🔒 Secure OpenSearch domain deployment
- 🌐 VPC integration with flexible subnet configuration
- 🔑 KMS encryption for data protection
- 📊 Configurable instance types and capacity
- 📝 Automated logging setup with CloudWatch
- 🏷️ Automated resource tagging
- 🔐 HTTPS enforcement and node-to-node encryption

## Prerequisites

- Node.js (v18 or later)
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- TypeScript knowledge
- AWS account with sufficient permissions

## Project Setup

### Clone and Install Dependencies

```bash
git clone <repository-url>
cd aws-opensearch-serverless
npm install
```

### Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure the following environment variables in `.env`:
```
APP_NAME=                     # Application name
CDK_DEPLOY_REGION=           # AWS deployment region
ENVIRONMENT=                 # development/staging/production
OWNER=                      # Project owner
VPC_ID=                     # Target VPC ID
VPC_SUBNET_TYPE=            # PRIVATE_ISOLATED/PRIVATE_WITH_EGRESS/PUBLIC
VPC_PRIVATE_SUBNET_IDS=     # Comma-separated subnet IDs
VPC_PRIVATE_SUBNET_AZS=     # Comma-separated availability zones
VPC_PRIVATE_SUBNET_ROUTE_TABLE_IDS= # Comma-separated route table IDs
OPENSEARCH_USER_NAME=       # OpenSearch admin username
OPENSEARCH_USER_PASSWORD=   # OpenSearch admin password
```

## Deployment

1. Synthesize the CloudFormation template:
```bash
npx cdk synth
```

2. Deploy the stack:
```bash
npx cdk deploy
```

## Useful Commands

* `npm run build`   - Compile TypeScript to JavaScript
* `npm run watch`   - Watch for changes and compile
* `npm run test`    - Perform Jest unit tests
* `npx cdk deploy`  - Deploy stack to AWS
* `npx cdk diff`    - Compare deployed stack with current state
* `npx cdk synth`   - Emit synthesized CloudFormation template

## Security Considerations

- All data is encrypted at rest using KMS
- HTTPS is enforced for all connections
- Node-to-node encryption is enabled
- Fine-grained access control is implemented
- VPC deployment with security groups
- Password requirements enforced for admin user

## Outputs

The stack provides the following outputs:
- OpenSearch Domain Endpoint
- OpenSearch Domain Name
- KMS Key ID
- KMS Key ARN

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
