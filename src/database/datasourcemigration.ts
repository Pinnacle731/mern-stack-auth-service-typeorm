import { DataSource } from 'typeorm';
import { configEnv } from '../config/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configEnv.dbHost,
  port: Number(configEnv.dbPort),
  username: configEnv.dbUsername,
  password: configEnv.dbPassword,
  database: configEnv.dbDatabase,
  synchronize: true,
  logging: false,
  entities: ['dist/src/database/entities/*.{ts,js}'],
  migrations: ['dist/src/database/migrations/*.{ts,js}'],
  ssl: {
    rejectUnauthorized: false,
  },
});
