import createHttpError from 'http-errors';
import logger from '../config/logger';
import { AppDataSource } from './data-source';

export const startApp = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    // await dataSource.runMigrations();
    logger.info('✅ Database connected successfully!');
  } catch (error) {
    logger.error(`❌ Database connection failed: ${error}`);
    throw createHttpError(500, '❌ Database connection failed');
  }
};
