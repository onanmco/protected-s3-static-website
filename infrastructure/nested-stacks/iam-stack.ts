import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Effect, IRole, ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";

interface IamStackProps extends NestedStackProps {
  appName: string;
  envName: string;
  scope: Construct;
}

export class IamStack extends NestedStack {

  private edgeLambdaRole: IRole;

  public getEdgeLambdaRole() {
    return this.edgeLambdaRole;
  }

  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);

    const ssmGetParameterPolicy = new ManagedPolicy(
      props.scope,
      "ssm-get-parameter-policy",
      {
        managedPolicyName: `${props.envName}-${props.appName}-ssm-get-parameter-policy`,
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
              "ssm:GetParameter"
            ],
            resources: [
              "*"
            ]
          })
        ]
      }
    );

    const cloudWatchLogsPolicy = new ManagedPolicy(
      props.scope,
      "cw-logs-policy",
      {
        managedPolicyName: `${props.envName}-${props.appName}-cw-logs-policy`,
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents"
            ],
            resources: [
              `arn:${this.partition}:logs:*:*:*`
            ]
          })
        ]
      }
    );

    const secretsManagerPolicy = new ManagedPolicy(
      props.scope,
      "secrets-manager-policy",
      {
        managedPolicyName: `${props.envName}-${props.appName}-secrets-manager-policy`,
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
              "secretsmanager:GetSecretValue",
            ],
            resources: [
              `arn:${this.partition}:secretsmanager:${this.region}:${this.account}:secret:${props.envName}/${props.appName}*`
            ]
          })
        ]
      }
    );

    this.edgeLambdaRole = new Role(
      props.scope,
      "edge-lambda-role",
      {
        roleName: `${props.envName}-${props.appName}-edge-lambda-role`,
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          cloudWatchLogsPolicy,
          ssmGetParameterPolicy,
          secretsManagerPolicy
        ]
      }
    );

    this.edgeLambdaRole.grantAssumeRole(
      new ServicePrincipal("edgelambda.amazonaws.com")
    );
  }
}