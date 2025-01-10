import createHttpError from 'http-errors';
import { AppDataSource } from '../database/data-source';
import { Tenant } from '../database/entities/Tenant';
import {
  ICreateTenants,
  IGetAllTenantsDto,
  ITenantCreateDto,
  TenantQueryParams,
} from '../types/tenantsType';
import logger from '../config/logger';

export const TenantCreateService = async (
  tenantData: ICreateTenants,
): Promise<ITenantCreateDto | undefined> => {
  const tenantRepository = AppDataSource.getRepository(Tenant);
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
  const tenantRepository = AppDataSource.getRepository(Tenant);

  try {
    // const tenants = await tenantRepository.find();
    // if (!tenants) {
    //   const customError = createHttpError(
    //     500,
    //     'failed to fetch the tenants data from the database',
    //   );
    //   throw customError;
    // }
    // return tenants;

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
    const tenantRepository = AppDataSource.getRepository(Tenant);
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
    const tenantRepository = AppDataSource.getRepository(Tenant);
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
    await AppDataSource.getRepository(Tenant).update(id, tenantData);
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
