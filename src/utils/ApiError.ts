import { Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from '../config/logger';

export const ApiErrorHandler = (
  error: HttpError,
  res: Response,
  req: Request,
): void => {
  logger.error(error.message);
  const statusCode = error.statusCode || error.status || 500;
  res.status(statusCode).json({
    error: [
      {
        // code: error.code || 'INTERNAL_SERVER_ERROR',
        status: error.status || error.statusCode || 500,
        type: error.name,
        message: error.message || 'Internal Server Error',
        path: req.url,
        // location: '',
      },
    ],
  });
};
