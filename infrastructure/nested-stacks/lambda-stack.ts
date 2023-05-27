import * as cdk from "aws-cdk-lib";
import {DockerImage, NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Architecture, Code, Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import {IRole} from "aws-cdk-lib/aws-iam";

interface LambdaStackProps extends NestedStackProps {
  envName: string;
  appName: string;
  role: IRole;
  scope: Construct;
}

export class LambdaStack extends NestedStack {

  private readonly defaultHandler: cdk.aws_cloudfront.experimental.EdgeFunction;
  private readonly callbackHandler: cdk.aws_cloudfront.experimental.EdgeFunction;

  public getDefaultHandler() {
    return this.defaultHandler;
  }

  public getCallbackHandler() {
    return this.callbackHandler;
  }

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const {
      envName,
      appName
    } = props;

    this.defaultHandler = new cdk.aws_cloudfront.experimental.EdgeFunction(
      props.scope,
      "default-handler",
      {
        functionName: `${envName}-${appName}-default-handler`,
        handler: "app.lambdaHandler",
        architecture: Architecture.X86_64,
        runtime: Runtime.NODEJS_16_X,
        memorySize: 128,
        role: props.role,
        code: Code.fromAsset(
          path.join(__dirname, "../../"),
          {
            bundling: {
              command: [
                "/bin/sh",
                "-c",
                "mkdir -p /asset-input/target" +
                `&& esbuild src/function/default-handler/app.ts \
              --outfile=/asset-input/target/app.js \
              --platform=node \
              --minify \
              --bundle \
              --sourcemap ` +
                "&& cp -a /asset-input/target/. /asset-output/"
              ],
              image: DockerImage.fromBuild(path.resolve(__dirname, "../../"))
            }
          }
        )
      }
    );

    this.callbackHandler = new cdk.aws_cloudfront.experimental.EdgeFunction(
      props.scope,
      "callback-handler",
      {
        functionName: `${envName}-${appName}-callback-handler`,
        handler: "app.lambdaHandler",
        architecture: Architecture.X86_64,
        runtime: Runtime.NODEJS_16_X,
        memorySize: 128,
        role: props.role,
        code: Code.fromAsset(
          path.join(__dirname, "../../"),
          {
            bundling: {
              command: [
                "/bin/sh",
                "-c",
                "mkdir -p /asset-input/target" +
                `&& esbuild src/function/callback-handler/app.ts \
              --outfile=/asset-input/target/app.js \
              --platform=node \
              --minify \
              --bundle \
              --sourcemap ` +
                "&& cp -a /asset-input/target/. /asset-output/"
              ],
              image: DockerImage.fromBuild(path.resolve(__dirname, "../../"))
            }
          }
        )
      }
    );
  }
}
