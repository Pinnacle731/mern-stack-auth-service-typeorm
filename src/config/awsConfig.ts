import { S3Client } from '@aws-sdk/client-s3';
import { configEnv } from './config';

export const s3Client = new S3Client({
  region: configEnv.awsRegion,
  credentials: {
    accessKeyId: configEnv.awsAccessKeyId,
    secretAccessKey: configEnv.awsSecretAccessKey,
  },
});
