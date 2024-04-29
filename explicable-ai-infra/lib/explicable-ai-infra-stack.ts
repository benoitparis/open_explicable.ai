import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ses from 'aws-cdk-lib/aws-ses';
import {Construct} from 'constructs';

export class ExplicableAiInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Resources
    const s3BucketExplicableaiServe = new s3.CfnBucket(this, 'S3Bucket-explicableai-serve', {
      publicAccessBlockConfiguration: {
        restrictPublicBuckets: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        blockPublicAcls: false,
      },
      bucketName: 'explicable.ai',
      ownershipControls: {
        rules: [
          {
            objectOwnership: 'BucketOwnerPreferred',
          },
        ],
      },
      bucketEncryption: {
        serverSideEncryptionConfiguration: [
          {
            bucketKeyEnabled: false,
            serverSideEncryptionByDefault: {
              sseAlgorithm: 'AES256',
            },
          },
        ],
      },
      websiteConfiguration: {
        indexDocument: 'index.html',
        errorDocument: '404.html',
      },
      versioningConfiguration: {
        status: 'Enabled',
      },
      tags: [
        {
          value: 'hosting',
          key: 'explainable.ai',
        },
      ],
    });
    s3BucketExplicableaiServe.cfnOptions.deletionPolicy = cdk.CfnDeletionPolicy.RETAIN;

    const s3BucketWwwexplicableaiRedirect = new s3.CfnBucket(this, 'S3Bucket-wwwexplicableai-redirect', {
      websiteConfiguration: {
        redirectAllRequestsTo: {
          hostName: 'explicable.ai',
        },
      },
      publicAccessBlockConfiguration: {
        restrictPublicBuckets: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        blockPublicAcls: false,
      },
      bucketName: 'www.explicable.ai',
      versioningConfiguration: {
        status: 'Enabled',
      },
      ownershipControls: {
        rules: [
          {
            objectOwnership: 'BucketOwnerPreferred',
          },
        ],
      },
      bucketEncryption: {
        serverSideEncryptionConfiguration: [
          {
            bucketKeyEnabled: false,
            serverSideEncryptionByDefault: {
              sseAlgorithm: 'AES256',
            },
          },
        ],
      },
    });
    s3BucketWwwexplicableaiRedirect.cfnOptions.deletionPolicy = cdk.CfnDeletionPolicy.RETAIN;

    const sesEmailIdentityContactExplicableAi = new ses.CfnEmailIdentity(this, 'SESEmailIdentitycontactexplicableai', {
      dkimAttributes: {
        signingEnabled: false,
      },
      feedbackAttributes: {
        emailForwardingEnabled: true,
      },
      emailIdentity: 'contact@explicable.ai',
      dkimSigningAttributes: {
        nextSigningKeyLength: 'RSA_1024_BIT',
      },
      mailFromAttributes: {
        behaviorOnMxFailure: 'USE_DEFAULT_VALUE',
      },
    });
    sesEmailIdentityContactExplicableAi.cfnOptions.deletionPolicy = cdk.CfnDeletionPolicy.RETAIN;

  }
}
