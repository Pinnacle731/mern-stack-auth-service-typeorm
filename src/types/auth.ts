import { Roles } from './index';
import { Request } from 'express';
import { IGetAllTenantsDto } from './tenantsType';
/** register */
export interface UserData {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  tenantId?: number;
  role: Roles;
}

export interface userCreateType extends UserData {
  id: number;
}

export interface registerUserRequest extends Request {
  body: UserData;
}

export interface registerDataType {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles;
  password: string;
  tenant: {
    id: number;
    name: string;
    address: string;
  };
}

export interface registerUserDtoType {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  role: Roles;
  tenantId?: number;
}

export interface registerResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    registerUserDto: registerUserDtoType;
  };
  error: boolean;
}

/** login */
export interface loginUserType {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles;
  password: string;
}

export interface loginUserRequest extends Request {
  body: loginUserType;
}

export interface loginDtoType {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  role: string;
}

export interface loginResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    loginUserDto: loginDtoType;
  };
  error: boolean;
}

/** self */
export interface selfDataType {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles;
  password: string;
  tenant: IGetAllTenantsDto | null;
}

export interface selfDtoType {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  role: string;
  tenant: IGetAllTenantsDto | null;
}

export interface selfResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    selfDto: selfDtoType;
  };
  error: boolean;
}

// refresh token

export interface refreshTokenType {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles;
  password: string;
}

export interface refreshTokenDtoType {
  id: number;
  userName: string;
}

export interface refreshTokenResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    refreshTokenDto: refreshTokenDtoType;
  };
  error: boolean;
}

// logout user

export interface logoutType {
  id: number;
  role: Roles;
}

export interface logoutDtoType {
  id: number;
  role: Roles;
}

export interface logoutResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    logoutDto: logoutDtoType;
  };
  error: boolean;
}

//create user
export interface createUserRequest extends Request {
  body: UserData;
}

// update user
export interface LimitedUserData {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles;
  tenantId: number;
}

export interface updateUserRequest extends Request {
  body: LimitedUserData;
}

export interface updateUserType {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  tenantId: number;
}

export interface updateUserDtoType {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  role: Roles;
  tenantId: number;
}

export interface updateUserResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    updateUserDto: updateUserDtoType;
  };
  error: boolean;
}

// get all users

export interface UserQueryParams {
  perPage: number;
  currentPage: number;
  q: string;
  role: string;
}

export interface getAllUsersDtoType {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  tenant: IGetAllTenantsDto | null;
}

export interface getAllUsersResObject {
  code: number;
  status: string;
  message: string;
  data: {
    getAllUsersDto: getAllUsersDtoType[];
  };
  error: boolean;
  total: number;
  currentPage: number;
  perPage: number;
}

// get user by id
export interface getUserByIdResObject {
  code: number;
  status: string;
  message: string;
  data: {
    getUserByIdDto: getAllUsersDtoType;
  };
  error: boolean;
}

// delete user
export interface deleteUserResObject {
  code: number;
  status: string;
  message: string;
  data: {
    deleteuserDto: getAllUsersDtoType;
  };
  error: boolean;
}
