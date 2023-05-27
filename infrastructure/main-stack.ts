import {StackProps, Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {S3Stack} from "./nested-stacks/s3-stack";
import {LambdaStack} from "./nested-stacks/lambda-stack";
import {CloudfrontStack} from "./nested-stacks/cloudfront-stack";
import {CognitoStack} from "./nested-stacks/cognito-stack";
import {SsmStack} from "./nested-stacks/ssm-stack";
import {IamStack} from "./nested-stacks/iam-stack";
import {SecretStack} from "./nested-stacks/secret-stack";

export interface MainStackProps extends StackProps {
  appName: string;
  envName: string;
}

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props: MainStackProps) {
    super(scope, id, props);

    const {
      envName,
      appName
    } = props;

    const s3stack = new S3Stack(
      this,
      "s3-stack",
      {
      envName,
      appName,
      scope: this,
      description: "Deploys an S3 bucket in which you store your static website content."
    }
    );

    const iamStack = new IamStack(
      this,
      "iam-stack",
      {
      envName,
      appName,
      scope: this,
      description: "Deploys IAM policies and roles required for resources."
    }
    );

    const lambdaStack = new LambdaStack(
      this,
      "lambda-stack",
      {
      envName,
      appName,
      role: iamStack.getEdgeLambdaRole(),
      scope: this,
      description: "Deploys Lambda@Edge functions they implement authentication."
    }
    );

    const cloudFrontStack = new CloudfrontStack(
      this,
      "cloudfront-stack",
      {
      defaultHandler: lambdaStack.getDefaultHandler(),
      callbackHandler: lambdaStack.getCallbackHandler(),
      bucket: s3stack.getBucket(),
      scope: this,
      description: "Configures a CloudFront distribution in front of the S3 bucket to cache and authenticate requests."
    }
    );

    const cognitoStack = new CognitoStack(
      this,
      "cognito-stack",
      {
      envName,
      appName,
      cdn: cloudFrontStack.getCdn(),
      scope: this,
      description: "Deploys a user pool in Cognito in which authenticated user identities are going to be stored."
    }
    );

    new SecretStack(
      this,
      "secret-stack",
      {
        envName,
        appName,
        scope: this,
        userPoolClient: cognitoStack.getUserPoolClient(),
        description: "Deploys secret credentials to AWS Secrets Manager."
      }
    );

    new SsmStack(
      this,
      "ssm-stack",
      {
      envName,
      appName,
      userPoolId: cognitoStack.getUserPoolId(),
      clientId: cognitoStack.getClientId(),
      loginURL: cognitoStack.getLoginURL(),
      userPoolDomain: cognitoStack.getUserPoolDomain(),
      scope: this,
      cdn: cloudFrontStack.getCdn(),
      description: "Deploys required parameters to SSM Parameter Store."
    }
    );
  }
}
