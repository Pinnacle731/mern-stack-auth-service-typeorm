import createHttpError from 'http-errors';
import { User } from '../database/entities/User';
import bcrypt from 'bcryptjs';
import { saltRounds } from '../constants';
import {
  LimitedUserData,
  RegisterDataType,
  UserData,
  UserQueryParams,
} from '../types/auth';
import { Brackets } from 'typeorm';
import { getUserRepository } from '../utils/common';

export const CreateUserService = async ({
  userName,
  firstName,
  lastName,
  email,
  password,
  tenantId,
  role,
}: UserData): Promise<RegisterDataType> => {
  // sonarqube-ignore-line
  // const userRepository = AppDataSource.getRepository(User);
  const userRepository = await getUserRepository();

  // userName unique
  const uniqueUserName = await userRepository.findOne({
    where: { userName: userName },
  });
  if (uniqueUserName) {
    const error = createHttpError(400, 'Username is already exists!');
    throw error;
  }

  //email unique
  const uniqueEmail = await userRepository.findOne({ where: { email: email } });
  if (uniqueEmail) {
    const error = createHttpError(400, 'Email is already exists!');
    throw error;
  }

  //hash password
  const hashPassword = await bcrypt.hash(password, saltRounds);
  try {
    const user = await userRepository.save({
      userName,
      firstName,
      lastName,
      email,
      password: hashPassword,
      role,
      tenant: tenantId ? { id: tenantId } : undefined,
    });
    return user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    const customError = createHttpError(
      500,
      'failed to store the data in the database',
    );
    throw customError;
  }
};

export const findByEmailWithPasswordService = async (
  email: string,
  userName: string,
): Promise<User> => {
  // sonarqube-ignore-line
  // const userRepository = AppDataSource.getRepository(User);
  const userRepository = await getUserRepository();
  const user = await userRepository.findOne({
    where: { email: email, userName: userName },
    select: [
      'id',
      'userName',
      'firstName',
      'lastName',
      'email',
      'role',
      'password',
    ],
    relations: {
      tenant: true,
    },
  });
  if (!user) {
    const error = createHttpError(404, 'user does not exist!');
    throw error;
  }
  return user;
};

export const findByIdService = async (id: number): Promise<User | null> => {
  // sonarqube-ignore-line
  // const userRepository = AppDataSource.getRepository(User);
  const userRepository = await getUserRepository();

  const user = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.tenant', 'tenant') // Include tenant relation
    .where('user.id = :id', { id }) // Match by user id
    .getOne();

  return user;
};

export const updateUserService = async (
  userId: number,
  { userName, firstName, lastName, role, email, tenantId }: LimitedUserData,
): Promise<void> => {
  try {
    // sonarqube-ignore-line
    // const userRepository = AppDataSource.getRepository(User);
    const userRepository = await getUserRepository();
    await userRepository.update(userId, {
      userName,
      firstName,
      lastName,
      role,
      email,
      tenant: tenantId ? { id: tenantId } : undefined,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw createHttpError(500, error.message);
    } else {
      throw createHttpError(
        500,
        'failed to update the user data in the database',
      );
    }
  }
};

export const getAllUsersService = async (
  validatedQuery: UserQueryParams,
): Promise<{
  users: User[];
  count: number;
}> => {
  try {
    // sonarqube-ignore-line
    // const userRepository = AppDataSource.getRepository(User);
    const userRepository = await getUserRepository();
    const queryBuilder = userRepository.createQueryBuilder('user');

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
            q: searchTerm,
          }).orWhere('user.email ILike :q', { q: searchTerm });
        }),
      );
    }
    if (validatedQuery.role) {
      queryBuilder.andWhere('user.role = :role', {
        role: validatedQuery.role,
      });
    }

    const result = await queryBuilder
      .leftJoinAndSelect('user.tenant', 'tenant')
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy('user.id', 'DESC')
      .getManyAndCount();

    const [users, count] = result;
    return { users, count };
  } catch (error) {
    if (error instanceof Error) {
      throw createHttpError(500, error.message);
    } else {
      throw createHttpError(500, 'failed to fetch the data from the database');
    }
  }
};

export const deleteByIdService = async (userId: number): Promise<void> => {
  try {
    // sonarqube-ignore-line
    // await AppDataSource.getRepository(User).delete(userId);
    const userRepository = await getUserRepository();
    await userRepository.delete(userId);
  } catch (error) {
    if (error instanceof Error) {
      throw createHttpError(500, error.message);
    } else {
      throw createHttpError(
        500,
        'failed to single fetch the data from the database',
      );
    }
  }
};
