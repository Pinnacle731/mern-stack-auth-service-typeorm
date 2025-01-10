import { Request } from 'express';

export enum Roles {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

export type AuthCookies = {
  accessToken: string;
  refreshToken: string;
};

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    id?: string;
    role: string;
    tenant: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface IRefreshTokenPayload {
  id: string;
}
