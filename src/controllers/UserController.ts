import { NextFunction, Request, Response } from 'express';
import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import {
  CreateUserService,
  deleteByIdService,
  findByIdService,
  getAllUsersService,
  updateUserService,
} from '../services/userService';
import {
  createUserRequest,
  deleteUserResObject,
  getAllUsersResObject,
  getUserByIdResObject,
  registerDataType,
  registerResObjectType,
  updateUserRequest,
  updateUserResObjectType,
  updateUserType,
  UserQueryParams,
} from '../types/auth';
import {
  deleteuserDto,
  getAllUsersDto,
  getUserByIdDto,
  registerUserDto,
  updateUserDto,
} from '../Dto/UserDto';
import { ApiSuccessHandler } from '../utils/ApiSuccess';
import logger from '../config/logger';

export const CreateUser = async (
  req: createUserRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Validation
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(createHttpError(400, result.array()[0].msg as string));
  }

  const { userName, firstName, lastName, email, password, tenantId, role } =
    req.body;
  try {
    const user = await CreateUserService({
      userName,
      firstName,
      lastName,
      email,
      password,
      tenantId,
      role,
    });

    logger.debug('creating a user in the database', req.body);

    const resObj: registerDataType = {
      ...user,
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

export const UpdateUser = async (
  req: updateUserRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Validation
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(createHttpError(400, result.array()[0].msg as string));
  }

  const { userName, firstName, lastName, email, tenantId, role } = req.body;
  const userId = req.params.id;

  if (isNaN(Number(userId))) {
    next(createHttpError(400, 'Invalid url param.'));
    return;
  }

  logger.debug('Request for updating a user', req.body);

  try {
    await updateUserService(Number(userId), {
      userName,
      firstName,
      lastName,
      role,
      email,
      tenantId,
    });

    logger.info('User has been updated', { id: userId });

    const resObj: updateUserType = {
      id: Number(userId),
      userName,
      firstName,
      lastName,
      email,
      role,
      tenantId,
    };

    const updateUserResObject: updateUserResObjectType = {
      code: 201,
      status: 'success',
      message: 'user updated!!',
      data: updateUserDto(resObj),
      error: false,
    };

    ApiSuccessHandler(res, updateUserResObject);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // const validatedQuery = matchedData(req, { onlyValidData: true });
  try {
    const validatedQuery = matchedData(req, { onlyValidData: true });
    const { users, count } = await getAllUsersService(
      validatedQuery as UserQueryParams,
    );

    if (!users) {
      const error = createHttpError(404, 'No users found');
      throw error;
    }

    const getAllUsersResObject: getAllUsersResObject = {
      code: 200,
      status: 'success',
      message: 'All users fetched successfully!!',
      data: getAllUsersDto(users),
      error: false,
      currentPage: validatedQuery.currentPage as number,
      perPage: validatedQuery.perPage as number,
      total: count,
    };

    res.status(getAllUsersResObject.code).json(getAllUsersResObject);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.params.id;

  if (isNaN(Number(userId))) {
    next(createHttpError(400, 'Invalid url param.'));
    return;
  }

  try {
    const user = await findByIdService(Number(userId));

    if (!user) {
      next(createHttpError(400, 'User does not exist.'));
      return;
    }

    logger.info('User has been fetched', { id: user.id });

    const getUserByIdResObject: getUserByIdResObject = {
      code: 200,
      status: 'success',
      message: 'User fetched successfully!!',
      data: getUserByIdDto(user),
      error: false,
    };
    ApiSuccessHandler(res, getUserByIdResObject);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.params.id;

  if (isNaN(Number(userId))) {
    next(createHttpError(400, 'Invalid url param.'));
    return;
  }

  try {
    const user = await findByIdService(Number(userId));

    if (!user) {
      next(createHttpError(400, 'User does not exist.'));
      return;
    }

    await deleteByIdService(Number(user?.id));

    logger.info('User has been fetched', { id: user.id });

    const deleteUserResObject: deleteUserResObject = {
      code: 200,
      status: 'success',
      message: 'deleted user successfully!!',
      data: deleteuserDto(user),
      error: false,
    };
    ApiSuccessHandler(res, deleteUserResObject);
  } catch (err) {
    next(err);
  }
};
