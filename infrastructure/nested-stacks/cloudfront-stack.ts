import * as cdk from "aws-cdk-lib";
import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {IBucket} from "aws-cdk-lib/aws-s3";
import {
  Distribution,
  IDistribution,
  LambdaEdgeEventType,
  OriginAccessIdentity,
  ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import {HttpOrigin, S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";

interface CloudfrontStackProps extends NestedStackProps {
  bucket: IBucket;
  defaultHandler: cdk.aws_cloudfront.experimental.EdgeFunction;
  callbackHandler: cdk.aws_cloudfront.experimental.EdgeFunction;
  scope: Construct;
}

export class CloudfrontStack extends NestedStack {

  private readonly cdn: IDistribution;

  public getCdn() {
    return this.cdn;
  }

  constructor(scope: Construct, id: string, props: CloudfrontStackProps) {
    super(scope, id, props);

    const originAccessIdentity = new OriginAccessIdentity(this, "origin-access-identity");
    props.bucket.grantRead(originAccessIdentity);

    this.cdn = new Distribution(
      props.scope,
      "cdn",
      {
        enabled: true,
        defaultRootObject: "index.html",
        defaultBehavior: {
          origin: new S3Origin(props.bucket, {
            originAccessIdentity: originAccessIdentity
          }),
          edgeLambdas: [
            {
              eventType: LambdaEdgeEventType.VIEWER_REQUEST,
              functionVersion: props.defaultHandler.currentVersion
            }
          ],
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        },
        additionalBehaviors: {
          "/callback": {
            origin: new HttpOrigin("example.local"),
            edgeLambdas: [
              {
                eventType: LambdaEdgeEventType.VIEWER_REQUEST,
                functionVersion: props.callbackHandler.currentVersion
              }
            ]
          }
        }
      }
    );
  }

}