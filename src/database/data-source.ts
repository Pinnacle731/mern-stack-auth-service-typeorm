import 'reflect-metadata';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { DataSource } from 'typeorm';
import { configEnv } from '../config/config';

config({
  path: path.join(__dirname, `../../.env.${configEnv.nodeEnv || 'dev'}`),
});

export const AppDataSource = new DataSource({
  type: 'postgres', // PostgreSQL setup
  host: configEnv.dbHost,
  port: Number(configEnv.dbPort),
  username: configEnv.dbUsername,
  password: configEnv.dbPassword,
  database: configEnv.dbDatabase,
  // url: configEnv.databaseUrl,
  synchronize: false, //don't use this in production, always keep false
  logging: false,
  // entities: [User, RefreshToken],
  entities: ['src/database/entities/*.{ts,js}'], // Add all your entities here
  migrations: ['src/database/migrations/*.{ts,js}'],
  subscribers: [],
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, `../rds-ssl/global-bundle.pem`)),
    rejectUnauthorized: true,
  },
});

// export const MongoDataSource = new DataSource({
//   type: 'mongodb',
//   url: Config.DB_MONGODB_URL,
//   useUnifiedTopology: true,
//   database: Config.DB_MONGODB_DB,
//   entities: [User],
//   synchronize:
//     Config.NODE_ENV === 'test' || Config.NODE_ENV === 'dev' ? true : false, // Use only in development env
//   logging: false,
// });
