import 'reflect-metadata';
// import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { configEnv } from '../config/config';
import { getFileFromS3 } from '../services/s3Service';
import logger from '../config/logger';
import createHttpError from 'http-errors';

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
      synchronize: true,
      logging: false,
      entities: ['src/database/entities/*.{ts,js}'],
      migrations: ['src/database/migrations/*.{ts,js}'],
      ssl: {
        ca: rdsSSL,
        rejectUnauthorized: false,
      },
    });

    return dataSource;
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error setting up data source:', error.message);
    } else {
      throw createHttpError(500, 'Error setting up data source');
    }
  }
};
