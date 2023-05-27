import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {ParameterDataType, ParameterTier, StringParameter} from "aws-cdk-lib/aws-ssm";
import {IDistribution} from "aws-cdk-lib/aws-cloudfront";

interface SsmStackProps extends NestedStackProps {
  loginURL: string;
  userPoolDomain: string;
  cdn: IDistribution;
  clientId: string;
  userPoolId: string;
  envName: string;
  appName: string;
  scope: Construct;
}

export class SsmStack extends NestedStack {

  constructor(scope: Construct, id: string, props: SsmStackProps) {
    super(scope, id, props);

    const {
      envName,
      appName
    } = props;

    new StringParameter(
      props.scope,
      "user-pool-id",
      {
        description: "ID of Cognito user pool.",
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
        parameterName: `/${envName}/${appName}/cognito/user-pool-id`,
        stringValue: props.userPoolId
      }
    );

    new StringParameter(
      props.scope,
      "client-id",
      {
        description: "Cognito user pool client ID.",
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
        parameterName: `/${envName}/${appName}/cognito/client-id`,
        stringValue: props.clientId
      }
    );

    new StringParameter(
      props.scope,
      "login-url",
      {
        description: "Login URL of Cognito hosted UI.",
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
        parameterName: `/${envName}/${appName}/cognito/login-url`,
        stringValue: props.loginURL
      }
    );

    new StringParameter(
      props.scope,
      "user-pool-domain-name",
      {
        description: "User pool domain of the Cognito user pool",
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
        parameterName: `/${envName}/${appName}/cognito/user-pool/domain`,
        stringValue: `https://${props.userPoolDomain}.auth.us-east-1.amazoncognito.com`
      }
    );

    new StringParameter(
      props.scope,
      "user-pool-client-redirect-uri",
      {
        description: "User pool client redirect URI",
        dataType: ParameterDataType.TEXT,
        tier: ParameterTier.STANDARD,
        parameterName: `/${envName}/${appName}/cognito/user-pool/client/redirect-uri`,
        stringValue: `https://${props.cdn.distributionDomainName}/callback`
      }
    );
  }
}