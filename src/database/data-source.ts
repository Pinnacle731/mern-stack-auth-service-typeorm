import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { configEnv } from '../config/config';
import { getFileFromS3 } from '../services/s3Service';
import logger from '../config/logger';
import createHttpError from 'http-errors';
import { NODE_ENV_VAL } from '../constants';

export const AppDataSource = async (): Promise<DataSource | undefined> => {
  logger.info('database app datasource calling');

  try {
    // Load the SSL certificate synchronously
    const rdsSSL = await getFileFromS3(
      configEnv.awsS3BucketName,
      'auth-service/global-bundle.pem',
    );
    // Create the DataSource instance
    const dataSource = new DataSource({
      type: 'postgres',
      host: configEnv.dbHost,
      port: Number(configEnv.dbPort),
      username: configEnv.dbUsername,
      password: configEnv.dbPassword,
      database: configEnv.dbDatabase,
      synchronize: false,
      logging: false,
      entities:
        configEnv.nodeEnv === 'prod'
          ? ['dist/database/entities/*.{ts,js}']
          : ['src/database/entities/*.{ts,js}'],
      migrations:
        configEnv.nodeEnv === 'prod'
          ? ['dist/database/migrations/*.{ts,js}']
          : ['src/database/migrations/*.{ts,js}'],
      ssl:
        configEnv.nodeEnv === NODE_ENV_VAL.TEST
          ? {
              ca: configEnv.rdsSSL.replace(/\\n/g, '\n'),
              rejectUnauthorized: false,
            }
          : {
              ca: rdsSSL,
              rejectUnauthorized: true,
            },
    });

    return dataSource;
    /* sonarqube-ignore-start */
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error setting up data source:', error.message);
    } else {
      throw createHttpError(500, 'Error setting up data source');
    }
  }
  /* sonarqube-ignore-end */
};
