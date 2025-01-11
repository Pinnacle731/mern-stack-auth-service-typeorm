/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../../src/database/entities/Tenant';
import logger from '../../src/config/logger';
import { User } from '../../src/database/entities/User';
import { Roles } from '../../src/types';

export const truncateTable = async (connection: DataSource): Promise<void> => {
  const entities = connection.entityMetadatas;

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.clear(); //all table clear
  }
};

export const isJwt = (token: string | null): boolean => {
  if (token === null) {
    return false;
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    parts.forEach((part) => {
      Buffer.from(part, 'base64').toString('utf-8');
    });
    return true;
  } catch (error) {
    logger.error('Invalid token', { error });
    return false;
  }
};

export const createTenant = async (repository: Repository<Tenant>) => {
  const tenant = await repository.save({
    name: 'Test tenant',
    address: 'Test address',
  });
  return tenant;
};

export const createUser = async (
  repository: Repository<User>,
  tenant: Tenant,
) => {
  const user = await repository.save({
    tenant: { id: tenant.id },
    userName: 'parth731',
    firstName: 'Parth',
    lastName: 'Dangroshiya',
    email: 'BxPnM@example.com',
    password: 'Parth@123',
    role: Roles.ADMIN,
  });
  return user;
};
