import { NextFunction, Response, Request } from 'express';
import {
  ITenantGetAllResObject,
  ITenantGetByIdResObject,
  ITenantCreateResObject,
  tenantRequest,
  ITenantDeleteResObject,
  ITenantUpdateResObject,
  TenantQueryParams,
} from '../types/tenantsType';
import {
  TenantCreateService,
  TenantDeleteService,
  TenantGetAllService,
  TenantGetByIdService,
  TenantUpdateService,
} from '../services/tenantsService';
import {
  tenantCreateDto,
  tenantDeleteDto,
  tenantGetAllDto,
  tenantGetByIdDto,
  tenantUpdateDto,
} from '../Dto/TenantDto';
import { ApiSuccessHandler } from '../utils/ApiSuccess';
import logger from '../config/logger';
import createHttpError from 'http-errors';
import { matchedData, validationResult } from 'express-validator';

export const tenantCreate = async (
  req: tenantRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Validation
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ errors: result.array() });
    return;
  }
  const { name, address } = req.body;
  logger.debug('Request for creating a tenant', req.body);
  try {
    const tenant = await TenantCreateService({ name, address });
    logger.info('Tenant has been created', { id: tenant?.id });
    const createTenantResObject: ITenantCreateResObject = {
      code: 201,
      status: 'success',
      message: 'Tenant created!!',
      data: tenantCreateDto(tenant!),
      error: false,
    };

    ApiSuccessHandler(res, createTenantResObject);
  } catch (error) {
    next(error);
  }
};

export const getAllTenants = async (
  req: tenantRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const validatedQuery = matchedData(req, { onlyValidData: true });
  try {
    const result = await TenantGetAllService(
      validatedQuery as TenantQueryParams,
    );
    if (!result) {
      throw new Error('Failed to fetch tenants');
    }
    const { tenants, count } = result;

    logger.info('All tenant have been fetched');
    const tenantGetAllResObject: ITenantGetAllResObject = {
      code: 200,
      status: 'success',
      message: 'All tenants fetched!!',
      data: tenantGetAllDto(tenants!),
      error: false,
      currentPage: validatedQuery.currentPage as number,
      perPage: validatedQuery.perPage as number,
      total: count,
    };

    res.status(tenantGetAllResObject.code).json(tenantGetAllResObject);
  } catch (error) {
    next(error);
  }
};

export const getTenantById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      const customError = createHttpError(400, 'Invalid tenant id');
      next(customError);
    }

    const tenant = await TenantGetByIdService(Number(tenantId));

    if (!tenant) {
      const customError = createHttpError(404, 'Tenant not found');
      next(customError);
    }

    logger.info('Tenant fetched', { id: Number(tenantId) });
    const tenantGetByIdResobject: ITenantGetByIdResObject = {
      code: 200,
      status: 'success',
      message: 'Tenant fetched!!',
      data: tenantGetByIdDto(tenant!),
      error: false,
    };

    ApiSuccessHandler(res, tenantGetByIdResobject);
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ errors: result.array() });
    return;
  }

  try {
    const tenantId = req.params.id;
    const { name, address } = req.body;

    if (isNaN(Number(tenantId))) {
      const customError = createHttpError(400, 'Invalid tenant id');
      next(customError);
    }

    const tenant = await TenantGetByIdService(Number(tenantId));

    if (!tenant) {
      const customError = createHttpError(404, 'Tenant not found');
      next(customError);
    }

    await TenantUpdateService(Number(tenant?.id), {
      name,
      address,
    });

    logger.info('Tenant has been updated', {
      id: Number(tenantId),
    });

    const resObj = {
      id: Number(tenant?.id),
      name: name,
      address: address,
    };

    const tenantUpdateResObject: ITenantUpdateResObject = {
      code: 200,
      status: 'success',
      message: 'Tenant has been updated',
      data: tenantUpdateDto(resObj),
      error: false,
    };

    ApiSuccessHandler(res, tenantUpdateResObject);
  } catch (error) {
    next(error);
  }
};

export const deleteTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      const customError = createHttpError(400, 'Invalid tenant id');
      next(customError);
    }

    const tenant = await TenantGetByIdService(Number(tenantId));

    if (!tenant) {
      const customError = createHttpError(404, 'Tenant not found');
      next(customError);
    }

    await TenantDeleteService(Number(tenant?.id));

    logger.info('Tenant has been deleted', {
      id: Number(tenant?.id),
    });

    const resObj = {
      id: Number(tenant?.id),
      name: tenant?.name as string,
      address: tenant?.address as string,
    };

    const deleteTenantResObject: ITenantDeleteResObject = {
      code: 200,
      status: 'success',
      message: 'Tenant has been deleted',
      data: tenantDeleteDto(resObj),
      error: false,
    };

    ApiSuccessHandler(res, deleteTenantResObject);
  } catch (error) {
    next(error);
  }
};
