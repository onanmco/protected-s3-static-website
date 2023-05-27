import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {IDistribution} from "aws-cdk-lib/aws-cloudfront";
import {
  AccountRecovery,
  CfnUserPoolGroup,
  IUserPoolClient,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
  UserPoolEmail
} from "aws-cdk-lib/aws-cognito";

interface CognitoStackProps extends NestedStackProps {
  envName: string;
  appName: string;
  cdn: IDistribution;
  scope: Construct;
}

export class CognitoStack extends NestedStack {

  private readonly userPoolId: string;
  private readonly clientId: string;
  private readonly loginURL: string;
  private readonly userPoolDomain: string;
  private readonly userPoolClient: IUserPoolClient;

  public getUserPoolId() {
    return this.userPoolId;
  }

  public getClientId() {
    return this.clientId;
  }

  public getLoginURL() {
    return this.loginURL;
  }

  public getUserPoolDomain() {
    return this.userPoolDomain;
  }

  public getUserPoolClient() {
    return this.userPoolClient;
  }

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    const {
      envName,
      appName
    } = props;

    const userPool = new UserPool(
      props.scope,
      "user-pool",
      {
        userPoolName: `${envName}-${appName}-user-pool`,
        accountRecovery: AccountRecovery.EMAIL_ONLY,
        email: UserPoolEmail.withCognito(),
        signInAliases: {
          email: true,
          username: false,
          phone: false,
          preferredUsername: false
        }
      }
    );

    this.userPoolId = userPool.userPoolId;

    new CfnUserPoolGroup(
      props.scope,
      "default-group",
      {
        userPoolId: userPool.userPoolId,
        groupName: "default-group"
      }
    );

    this.userPoolClient = new UserPoolClient(
      props.scope,
      "user-pool-client",
      {
        userPool: userPool,
        preventUserExistenceErrors: true,
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
            implicitCodeGrant: false,
            clientCredentials: false
          },
          callbackUrls: [
            `https://${props.cdn.distributionDomainName}/callback`
          ]
        },
        supportedIdentityProviders: [
          UserPoolClientIdentityProvider.COGNITO
        ],
        generateSecret: true
      }
    );

    this.clientId = this.userPoolClient.userPoolClientId;

    const userPoolDomain = new UserPoolDomain(
      props.scope,
      "user-pool-domain",
      {
        userPool,
        cognitoDomain: {
          domainPrefix: `${envName}-${appName}-user-pool`
        }
      }
    );

    this.userPoolDomain = userPoolDomain.domainName;

    this.loginURL = userPoolDomain.signInUrl(
      this.userPoolClient as UserPoolClient,
      {
        signInPath: "/login",
        redirectUri: `https://${props.cdn.distributionDomainName}/callback`
      }
    );
  }
}