import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/awsConfig';
import { Readable } from 'stream';
import logger from '../config/logger';
import createHttpError from 'http-errors';

export const getFileFromS3 = async (
  bucketName: string,
  key: string,
): Promise<string | undefined> => {
  try {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const response = await s3Client.send(command);

    if (!response.Body) throw new Error('Failed to retrieve file from S3');

    const readable = response.Body as Readable;
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readable.on('data', (chunk) => chunks.push(chunk));
      readable.on('end', () =>
        resolve(Buffer.concat(chunks).toString('utf-8')),
      );
      readable.on('error', (err) => reject(err));
    });
    /* sonarqube-ignore-start */
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error retrieving file from S3', error.message);
    } else {
      throw createHttpError(500, 'Error retrieving file from S3');
    }
  }
  /* sonarqube-ignore-end */
};
