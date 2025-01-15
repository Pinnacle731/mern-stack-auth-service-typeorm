import createHttpError from 'http-errors';
import logger from '../config/logger';
import { AppDataSourceInitialize } from '../utils/common';

export const startApp = async (): Promise<void> => {
  try {
    // await AppDataSource.initialize();
    await AppDataSourceInitialize();
    logger.info('✅ Database connected successfully!');
  } catch (error) {
    logger.error(`❌ Database connection failed: ${error}`);
    throw createHttpError(500, '❌ Database connection failed');
  }
};
