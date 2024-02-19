import {
  CfnOutput,
  RemovalPolicy,
  Stack,
  StackProps,
  aws_s3,
  aws_s3_deployment,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface SudokuStackProps extends StackProps {
  bucketName: string
}

export class SudokuStack extends Stack {
  constructor(scope: Construct, id: string, props: SudokuStackProps) {
    super(scope, id, props);

    const bucket = new aws_s3.Bucket(this, 'WebAppBucket', {
      bucketName: props.bucketName,
      publicReadAccess: true,
      blockPublicAccess: new aws_s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
    });

    const deployment = new aws_s3_deployment.BucketDeployment(this, 'WebAppDeployment', {
      destinationBucket: bucket,
      sources: [
        aws_s3_deployment.Source.asset('../app/sudoku/build/')
      ],
    });

    new CfnOutput(this, 'WebAppUrl', {
      value: deployment.deployedBucket.bucketWebsiteUrl
    });
  }
}
