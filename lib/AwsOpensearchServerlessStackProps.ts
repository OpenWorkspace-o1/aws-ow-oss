import { StackProps } from "aws-cdk-lib"

export interface AwsOpensearchServerlessBaseStackProps {
    /**
     * Prefix used for naming AWS resources
     * Example: "myapp-prod"
     */
    readonly resourcePrefix: string;

    /**
     * AWS region where resources will be deployed
     * Example: "us-east-1"
     */
    readonly deployRegion: string | undefined;

    /**
     * Full environment name where the stack is being deployed
     * Example: "production"
     */
    readonly deployEnvironment: string;

    /**
     * Shortened version of the environment name
     * Example: "prd", "dev",...
     */
    readonly shortDeployEnvironment: string;

    /**
     * Name of the application
     * Example: "myapp"
     */
    readonly appName: string;

    /**
     * Owner or team responsible for the resources
     * Example: "platform-team"
     */
    readonly owner: string;
}

export interface AwsOpensearchServerlessStackProps extends StackProps, AwsOpensearchServerlessBaseStackProps {
    /**
     * Type of VPC subnet to use (PUBLIC, PRIVATE, or ISOLATED)
     * Example: "PRIVATE"
     */
    readonly vpcSubnetType: string;

    /**
     * ID of the VPC where ElastiCache will be deployed
     * Example: "vpc-1234567890abcdef0"
     */
    readonly vpcId: string;

    /**
     * IDs of the private subnets
     * Example: ["subnet-1234567890abcdef0", "subnet-1234567890abcdef1"]
     */
    readonly vpcPrivateSubnetIds: string[];

    /**
     * Availability zones of the private subnets
     * Example: ["us-east-1a", "us-east-1b"]
     */
    readonly vpcPrivateSubnetAzs: string[];

    /**
     * Route table IDs of the private subnets
     * Example: ["rtb-1234567890abcdef0", "rtb-1234567890abcdef1"]
     */
    readonly vpcPrivateSubnetRouteTableIds: string[];

    /**
     * Username for the OpenSearch domain
     * Example: "admin"
     */
    readonly opensearchUserName: string;

    /**
     * Password for the OpenSearch domain
     * Example: "admin"
     */
    readonly opensearchUserPassword: string;
}
