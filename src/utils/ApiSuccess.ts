import { Response } from 'express';
import {
  DeleteUserResObject,
  GetAllUsersResObject,
  GetUserByIdResObject,
  LoginResObjectType,
  LogoutResObjectType,
  RefreshTokenResObjectType,
  RegisterResObjectType,
  SelfResObjectType,
  UpdateUserResObjectType,
} from '../types/auth';
import {
  ITenantDeleteResObject,
  ITenantGetAllResObject,
  ITenantGetByIdResObject,
  ITenantCreateResObject,
  ITenantUpdateResObject,
} from '../types/tenantsType';

export const ApiSuccessHandler = (
  res: Response,
  responseObject:
    | RegisterResObjectType
    | LoginResObjectType
    | SelfResObjectType
    | RefreshTokenResObjectType
    | LogoutResObjectType
    | ITenantCreateResObject
    | ITenantGetAllResObject
    | ITenantGetByIdResObject
    | ITenantDeleteResObject
    | ITenantUpdateResObject
    | UpdateUserResObjectType
    | GetAllUsersResObject
    | DeleteUserResObject
    | GetUserByIdResObject,
): void => {
  res.status(responseObject.code).json({
    status: responseObject.code,
    type: responseObject.status,
    message: responseObject.message,
    data: responseObject.data,
    error: responseObject.error,
  });
};
