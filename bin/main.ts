#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MainStack } from '../infrastructure/main-stack';

const app = new cdk.App();
const accountId = app.node.tryGetContext("CDK_AWS_ACCOUNT_ID");
const envName = app.node.tryGetContext("CDK_ENV");
const appName = app.node.tryGetContext("CDK_APP");
new MainStack(app, 'MainStack', {
  env: {
    account: accountId,
    region: "us-east-1"
  },
  tags: {
    Environment: envName,
    Application: appName
  },
  description: "CDK app deploys an S3 bucket in which you can store your static website, fronted by a CloudFront distribution implements cookie-based authentication with Cognito integration.",
  stackName: `${envName}-${appName}`,
  envName,
  appName
});