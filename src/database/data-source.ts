import 'reflect-metadata';
// import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { configEnv } from '../config/config';

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
    ca: configEnv.rdsSSL,
    rejectUnauthorized: true,
  },
});
