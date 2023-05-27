import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {IUserPoolClient} from "aws-cdk-lib/aws-cognito";
import {CfnSecret} from "aws-cdk-lib/aws-secretsmanager";
import {CognitoUserPoolClientSecrets} from "../../common/types";

interface SecretStackProps extends NestedStackProps {
  appName: string;
  envName: string;
  userPoolClient: IUserPoolClient;
  scope: Construct;
}

export class SecretStack extends NestedStack {

  constructor(scope: Construct, id: string, props: SecretStackProps) {
    super(scope, id, props);

    new CfnSecret(
      props.scope,
      "secret",
      {
        description: `${props.envName}-${props.appName} Cognito user pool client secrets`,
        name: `${props.envName}/${props.appName}/cognito/user-pool/client`,
        secretString: JSON.stringify(
          {
            clientId: props.userPoolClient.userPoolClientId,
            clientSecret: props.userPoolClient
              .userPoolClientSecret
              .unsafeUnwrap()
          } as CognitoUserPoolClientSecrets
        )
      }
    );
  }
}