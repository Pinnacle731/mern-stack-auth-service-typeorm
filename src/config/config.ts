import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV || 'dev'}`),
});

interface Config {
  port: number;
  nodeEnv: string;
  baseUrl: string;
  hostname: string;

  // PostgreSQL config
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbDatabase: string;

  // JWT and Refresh token config
  refreshTokenSecret: string;
  jwtSecret: string;
  refreshTokenIssuer: string;
  accessTokenIssuer: string;
  refreshTokenExpiresIn: string;
  accessTokenExpiresIn: string;
  jwksUri: string;
  privatekey: string;

  databaseUrl: string;
}

export const configEnv: Config = {
  port: parseInt(process.env.PORT || '5501', 10),
  nodeEnv: process.env.NODE_ENV || 'dev',
  baseUrl: process.env.BASE_URL || '/pizza-app/auth-service/api/v1',
  hostname: process.env.HOSTNAME || 'localhost',

  // PostgreSQL config
  dbHost: process.env.DB_HOST || '127.0.0.1',
  dbPort: parseInt(process.env.DB_PORT || '5432', 10),
  dbUsername: process.env.DB_USERNAME || 'postgres',
  dbPassword: process.env.DB_PASSWORD || 'Bootstrap',
  dbDatabase: process.env.DB_DATABASE || 'auth_service_typeorm_dev',

  // JWT and Refresh token config
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET ||
    'ndalndlandnlanldnalndanalndansdnandkbskabkb',
  jwtSecret: process.env.JWT_SECRET || 'damdlamslmdlasmlmsalmdlmaslmdlasm',
  refreshTokenIssuer: process.env.REFRESH_TOKEN_ISSUER || 'Auth-service',
  accessTokenIssuer: process.env.ACCESS_TOKEN_ISSUER || 'Auth-service',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '1y',
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
  jwksUri:
    process.env.JWKS_URI || 'http://localhost:5501/.well-known/jwks.json',
  privatekey: process.env.PRIVATE_KEY || '',
  databaseUrl: process.env.DB_DATABASE_URL || '',
};
