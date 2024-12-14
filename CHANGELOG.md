## 2024-12-14

### Added
- Initialized AWS OpenSearch Serverless infrastructure using AWS CDK v2
- Created `AwsOpensearchServerlessStackProps` interface for comprehensive stack configuration
- Added utility functions for environment variable checking and VPC subnet type parsing
- Implemented OpenSearch domain configuration with enhanced security settings

### Changed
- Updated environment type definitions to include new VPC-related configuration variables
- Added `.env.example` template with new configuration placeholders

### Improved
- Enhanced type safety for infrastructure configuration
- Implemented flexible VPC and subnet configuration
- Added robust security settings for OpenSearch domain, including KMS encryption and HTTPS enforcement