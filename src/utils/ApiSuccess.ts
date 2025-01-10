import { Response } from 'express';
import {
  deleteUserResObject,
  getAllUsersResObject,
  getUserByIdResObject,
  loginResObjectType,
  logoutResObjectType,
  refreshTokenResObjectType,
  registerResObjectType,
  selfResObjectType,
  updateUserResObjectType,
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
    | registerResObjectType
    | loginResObjectType
    | selfResObjectType
    | refreshTokenResObjectType
    | logoutResObjectType
    | ITenantCreateResObject
    | ITenantGetAllResObject
    | ITenantGetByIdResObject
    | ITenantDeleteResObject
    | ITenantUpdateResObject
    | updateUserResObjectType
    | getAllUsersResObject
    | deleteUserResObject
    | getUserByIdResObject,
): void => {
  res.status(responseObject.code).json({
    status: responseObject.code,
    type: responseObject.status,
    message: responseObject.message,
    data: responseObject.data,
    error: responseObject.error,
  });
};
