import {
  IDeleteTenantDto,
  IGetAllTenantsDto,
  ITenantCreateDto,
  IUpdateTenantDto,
} from '../types/tenantsType';

export const tenantCreateDto = (
  tenant: ITenantCreateDto,
): { tenantCreateDto: ITenantCreateDto } => {
  return {
    tenantCreateDto: {
      id: tenant.id,
      name: tenant.name,
      address: tenant.address,
    },
  };
};

export const tenantGetAllDto = (
  tenant: IGetAllTenantsDto[],
): { tenantGetAllDto: IGetAllTenantsDto[] } => {
  return {
    tenantGetAllDto: tenant,
  };
};

export const tenantGetByIdDto = (
  tenant: IGetAllTenantsDto,
): { tenantGetByIdDto: IGetAllTenantsDto } => {
  return {
    tenantGetByIdDto: {
      id: tenant.id,
      name: tenant.name,
      address: tenant.address,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
  };
};

export const tenantUpdateDto = (
  tenant: IUpdateTenantDto,
): { tenantUpdateDto: IUpdateTenantDto } => {
  return {
    tenantUpdateDto: {
      id: tenant.id,
      name: tenant.name,
      address: tenant.address,
    },
  };
};

export const tenantDeleteDto = (
  tenant: IDeleteTenantDto,
): { tenantDeleteDto: IDeleteTenantDto } => {
  return {
    tenantDeleteDto: {
      id: tenant.id,
      name: tenant.name,
      address: tenant.address,
    },
  };
};
