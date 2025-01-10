import { NextFunction, Response } from 'express';
import {
  loginResObjectType,
  loginUserRequest,
  logoutResObjectType,
  logoutType,
  refreshTokenResObjectType,
  registerDataType,
  registerResObjectType,
  registerUserRequest,
  selfResObjectType,
} from '../types/auth';
import {
  CreateUserService,
  findByEmailWithPasswordService,
  findByIdService,
} from '../services/userService';
import logger from '../config/logger';
import { JwtPayload } from 'jsonwebtoken';
import {
  deleteRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  persistRefreshToken,
} from '../services/tokenService';
import createHttpError from 'http-errors';
import { comparePassword } from '../services/CredentialService';
import { setResponseCookies } from '../utils/auth.utils';
import { ApiSuccessHandler } from '../utils/ApiSuccess';
import {
  loginUserDto,
  logoutDto,
  refreshTokenDto,
  registerUserDto,
  selfUserDto,
} from '../Dto/UserDto';
import { AuthRequest, Roles } from '../types';
import { validationResult } from 'express-validator';

export const registerUser = async (
  req: registerUserRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Validation

  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ errors: result.array() });
    return;
  }
  const { firstName, lastName, email, password, userName } = req.body;
  logger.debug('New request to register a user', {
    userName,
    firstName,
    lastName,
    email,
    password: '******',
  });
  try {
    const user = await CreateUserService({
      userName,
      firstName,
      lastName,
      email,
      password,
      role: Roles.CUSTOMER,
    });

    logger.info('User has been registered', { id: user.id });

    const payload: JwtPayload = {
      sub: String(user?.id),
      role: user.role,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      tenant: user.tenant ? String(user.tenant.id) : '',
    };

    const accessToken = generateAccessToken(payload);

    //persist refresh token
    const newRefreshToken = await persistRefreshToken(user);

    const refreshToken = generateRefreshToken({
      ...payload,
      id: String(newRefreshToken.id),
    });

    setResponseCookies(res, accessToken, refreshToken);

    logger.info('token has been created');

    const resObj: registerDataType = {
      ...user,
      role: user.role as Roles,
      password: '',
    };

    const registerResObject: registerResObjectType = {
      code: 201,
      status: 'success',
      message: 'user created!!',
      data: registerUserDto(resObj),
      error: false,
    };

    ApiSuccessHandler(res, registerResObject);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: loginUserRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ errors: result.array() });
    return;
  }
  const { email, password, userName } = req.body;
  logger.debug('New request to login a user', {
    userName,
    email,
    password: '******',
  });

  try {
    //check if Username is exists
    //check if email is exists
    const existUser = await findByEmailWithPasswordService(email, userName);

    //compare password
    const isPasswordMatch = await comparePassword(
      password,
      existUser?.password,
    );
    if (!isPasswordMatch)
      throw createHttpError(
        400,
        'Username or Email or Password does not match!',
      );

    //generate token
    const payload: JwtPayload = {
      sub: String(existUser?.id),
      role: existUser?.role,
      userName: existUser.userName,
      firstName: existUser.firstName,
      lastName: existUser.lastName,
      email: existUser.email,
      tenant: existUser.tenant ? String(existUser.tenant.id) : '',
    };

    const accessToken = generateAccessToken(payload);

    //persist refresh token
    const newRefreshToken = await persistRefreshToken(existUser);

    const refreshToken = generateRefreshToken({
      ...payload,
      id: String(newRefreshToken.id),
    });

    setResponseCookies(res, accessToken, refreshToken);

    logger.info('user has been logged in', { id: existUser?.id });

    const resObj = {
      ...existUser,
      password: '',
    };

    const loginResObject: loginResObjectType = {
      code: 200,
      status: 'success',
      message: 'user logged in successfully!!!',
      data: loginUserDto(resObj),
      error: false,
    };

    ApiSuccessHandler(res, loginResObject);
  } catch (error) {
    next(error);
  }
};

export const self = async (req: AuthRequest, res: Response): Promise<void> => {
  //req.auth.id
  const user = await findByIdService(Number(req.auth.sub));
  // res.status(200).json({ ...user, password: undefined });
  const selfResObject: selfResObjectType = {
    code: 200,
    status: 'success',
    message: 'fetch user data successfully',
    data: selfUserDto(user!),
    error: false,
  };

  ApiSuccessHandler(res, selfResObject);
};

export const refresh = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    /**
    {
      sub: '3',
      role: 'customer',
      id: '7',
      iat: 1734851865,
      exp: 1766409465,
      iss: 'Auth-service',
      jti: '7'
    }
    console.log((req as unknown as AuthRequest).auth);
    */

    //generate token
    const payload: JwtPayload = {
      sub: req.auth.sub,
      role: req.auth.role,
    };
    const accessToken = generateAccessToken(payload);

    const existUserName = await findByIdService(Number(req.auth.sub));
    if (!existUserName) {
      const error = createHttpError(
        '400',
        'User with the token could not field',
      );
      next(error);
      return;
    }

    //new persist refresh token generate
    const newRefreshToken = await persistRefreshToken(existUserName);

    logger.info('generate new refresh token');

    //delete old persist refresh token
    await deleteRefreshToken(Number(req.auth.id));

    logger.info('delete old refresh token', { id: req.auth.id });

    const refreshToken = generateRefreshToken({
      ...payload,
      id: String(newRefreshToken.id),
    });

    setResponseCookies(res, accessToken, refreshToken);

    // res.status(200).json({
    //   message: 'refresh token and access token generated successfully',
    //   data: { id: existUserName.id, userName: existUserName.userName },
    //   error: false,
    // });

    const refreshTokenResObject: refreshTokenResObjectType = {
      code: 200,
      status: 'success',
      message: 'refresh token and access token generated successfully',
      data: refreshTokenDto(existUserName),
      error: false,
    };

    ApiSuccessHandler(res, refreshTokenResObject);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteRefreshToken(Number(req.auth.id));

    logger.info('Refresh Token has been deleted', { id: req.auth.id });
    logger.info('User has been logout', { id: req.auth.sub });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    // res.status(200).json({
    //   message: 'loggout successfully',
    //   data: null,
    //   error: false,
    // });

    const resObj: logoutType = {
      id: Number(req.auth.id),
      role: req.auth.role as Roles,
    };

    const logoutResObject: logoutResObjectType = {
      code: 200,
      status: 'success',
      message: 'loggout successfully!!!',
      data: logoutDto(resObj),
      error: false,
    };

    ApiSuccessHandler(res, logoutResObject);
  } catch (error) {
    next(error);
  }
};
