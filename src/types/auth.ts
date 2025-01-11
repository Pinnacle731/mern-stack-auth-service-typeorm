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

export interface UserCreateType extends UserData {
  id: number;
}

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface RegisterDataType {
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

export interface RegisterUserDtoType {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  role: Roles;
  tenantId?: number;
}

export interface RegisterResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    registerUserDto: RegisterUserDtoType;
  };
  error: boolean;
}

/** login */
export interface LoginUserType {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles;
  password: string;
}

export interface LoginUserRequest extends Request {
  body: LoginUserType;
}

export interface LoginDtoType {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  role: string;
}

export interface LoginResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    loginUserDto: LoginDtoType;
  };
  error: boolean;
}

/** self */
export interface SelfDataType {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles;
  password: string;
  tenant: IGetAllTenantsDto | null;
}

export interface SelfDtoType {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  role: string;
  tenant: IGetAllTenantsDto | null;
}

export interface SelfResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    selfDto: SelfDtoType;
  };
  error: boolean;
}

// refresh token
export interface RefreshTokenType {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles;
  password: string;
}

export interface RefreshTokenDtoType {
  id: number;
  userName: string;
}

export interface RefreshTokenResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    refreshTokenDto: RefreshTokenDtoType;
  };
  error: boolean;
}

// logout user
export interface LogoutType {
  id: number;
  role: Roles;
}

export interface LogoutDtoType {
  id: number;
  role: Roles;
}

export interface LogoutResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    logoutDto: LogoutDtoType;
  };
  error: boolean;
}

// create user
export interface CreateUserRequest extends Request {
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

export interface UpdateUserRequest extends Request {
  body: LimitedUserData;
}

export interface UpdateUserType {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  tenantId: number;
}

export interface UpdateUserDtoType {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  role: Roles;
  tenantId: number;
}

export interface UpdateUserResObjectType {
  code: number;
  status: string;
  message: string;
  data: {
    updateUserDto: UpdateUserDtoType;
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

export interface GetAllUsersDtoType {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  tenant: IGetAllTenantsDto | null;
}

export interface GetAllUsersResObject {
  code: number;
  status: string;
  message: string;
  data: {
    getAllUsersDto: GetAllUsersDtoType[];
  };
  error: boolean;
  total: number;
  currentPage: number;
  perPage: number;
}

// get user by id
export interface GetUserByIdResObject {
  code: number;
  status: string;
  message: string;
  data: {
    getUserByIdDto: GetAllUsersDtoType;
  };
  error: boolean;
}

// delete user
export interface DeleteUserResObject {
  code: number;
  status: string;
  message: string;
  data: {
    deleteUserDto: GetAllUsersDtoType;
  };
  error: boolean;
}
