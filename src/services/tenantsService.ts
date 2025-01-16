import createHttpError from 'http-errors';
import {
  ICreateTenants,
  IGetAllTenantsDto,
  ITenantCreateDto,
  TenantQueryParams,
} from '../types/tenantsType';
import logger from '../config/logger';
import { getTenantRepository } from '../utils/common';

export const TenantCreateService = async (
  tenantData: ICreateTenants,
): Promise<ITenantCreateDto | undefined> => {
  const tenantRepository = await getTenantRepository();
  const { name, address } = tenantData;

  try {
    const tenant = await tenantRepository.save({
      name,
      address,
    });

    if (!tenant) {
      const customError = createHttpError(
        500,
        'failed to store the tenant data in the database',
      );
      throw customError;
    }

    return tenant;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      const customError = createHttpError(
        500,
        'failed to store the tenant data in the database',
      );
      throw customError;
    }
  }
};

export const TenantGetAllService = async (
  validatedQuery: TenantQueryParams,
): Promise<
  | {
      tenants: IGetAllTenantsDto[];
      count: number;
    }
  | undefined
> => {
  const tenantRepository = await getTenantRepository();

  try {
    const queryBuilder = tenantRepository.createQueryBuilder('tenant');

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where("CONCAT(tenant.name, ' ', tenant.address) ILike :q", {
        q: searchTerm,
      });
    }

    const result = await queryBuilder
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy('tenant.id', 'DESC')
      .getManyAndCount();

    const [tenants, count] = result;
    return { tenants, count };
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      const customError = createHttpError(
        500,
        'failed to fetch all tenants data from the database',
      );
      throw customError;
    }
  }
};

export const TenantGetByIdService = async (
  tenantId: number,
): Promise<IGetAllTenantsDto | undefined> => {
  try {
    // sonarqube-ignore-line
    // const tenantRepository = AppDataSource.getRepository(Tenant);
    const tenantRepository = await getTenantRepository();
    const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      const customError = createHttpError(404, 'Tenant not found');
      throw customError;
    }
    return tenant;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      const customError = createHttpError(
        500,
        'failed to fetch single tenant data from the database',
      );
      throw customError;
    }
  }
};

export const TenantDeleteService = async (tenantId: number): Promise<void> => {
  try {
    // sonarqube-ignore-line
    // const tenantRepository = AppDataSource.getRepository(Tenant);
    const tenantRepository = await getTenantRepository();
    await tenantRepository.delete(tenantId);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      const customError = createHttpError(
        500,
        'failed to delete tenants data from the database',
      );
      throw customError;
    }
  }
};

export const TenantUpdateService = async (
  id: number,
  tenantData: ICreateTenants,
): Promise<void> => {
  try {
    // sonarqube-ignore-line
    // await AppDataSource.getRepository(Tenant).update(id, tenantData);
    const tenantRepository = await getTenantRepository();
    tenantRepository.update(id, tenantData);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      const customError = createHttpError(
        500,
        'failed to update tenant data in the database',
      );
      throw customError;
    }
  }
};
