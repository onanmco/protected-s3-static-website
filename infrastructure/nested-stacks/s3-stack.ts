import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  IBucket,
  ObjectOwnership
} from "aws-cdk-lib/aws-s3";
import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";

interface S3StackProps extends NestedStackProps {
  appName: string;
  envName: string;
  scope: Construct;
}

export class S3Stack extends NestedStack {

  private readonly bucket: IBucket;

  public getBucket() {
    return this.bucket;
  }

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    const {
      envName,
      appName
    } = props;

    this.bucket = new Bucket(
      props.scope,
      "bucket",
      {
        bucketName: `${envName}-${appName}-resources`,
        accessControl: BucketAccessControl.PRIVATE,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        publicReadAccess: false,
        objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
        encryption: BucketEncryption.S3_MANAGED
      }
    );

    new BucketDeployment(
      props.scope,
      "bucket-deployment",
      {
        destinationBucket: this.bucket,
        sources: [
          Source.asset(path.resolve(__dirname, "../../src/assets/dist"))
        ]
      }
    );
  }
}