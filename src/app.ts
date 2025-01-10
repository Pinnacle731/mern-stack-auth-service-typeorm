import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import authRouter from './routes/authRouter';
import tenantRouter from './routes/tenantRouter';
import userRouter from './routes/userRouter';
import path from 'path';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { configEnv } from './config/config';

dotenv.config({
  path: path.join(__dirname, `../../.env.${configEnv.nodeEnv || 'dev'}`),
});

const app = express();

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

app.get(`${configEnv.baseUrl}/`, async (req: Request, res: Response) => {
  //   const error = createHttpError(401, 'you can not access this route');
  //   next(error);
  res.send('Welcome to the API!!!');
});

app.use(`${configEnv.baseUrl}/auth`, authRouter);
app.use(`${configEnv.baseUrl}/tenants`, tenantRouter);
app.use(`${configEnv.baseUrl}/users`, userRouter);

// global error handler
app.use(globalErrorHandler);

export default app;
