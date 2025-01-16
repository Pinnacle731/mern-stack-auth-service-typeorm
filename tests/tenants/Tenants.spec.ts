import { DataSource } from 'typeorm';
import request from 'supertest';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';
import { Tenant } from '../../src/database/entities/Tenant';
import { createTenant } from '../utils';
import { AppDataSourceInitialize } from '../../src/utils/common';

describe('create tenants in the database', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  const baseUrl = '/pizza-app/auth-service/api/v1/tenants';

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501');
    // sonarqube-ignore-line
    // connection = await AppDataSource.initialize();
    connection = await AppDataSourceInitialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    jwks.start();

    adminToken = jwks.token({
      sub: '1',
      role: Roles.ADMIN,
    });
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(() => {
    jwks.stop();
  });

  describe('POST /tenants', () => {
    it('should return a 201 status code', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };
      const response = await request(app)
        .post(baseUrl)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      expect(response.statusCode).toBe(201);
    });

    it('should create a tenant in the database', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };

      await request(app)
        .post(baseUrl)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
      expect(tenants[0].address).toBe(tenantData.address);
    });

    it('should return 401 if user is not autheticated', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };

      const response = await request(app).post(baseUrl).send(tenantData);
      expect(response.statusCode).toBe(401);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(0);
    });

    it('should return 403 if user is not an admin', async () => {
      const managerToken = jwks.token({
        sub: '1',
        role: Roles.MANAGER,
      });

      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };

      const response = await request(app)
        .post(baseUrl)
        .set('Cookie', [`accessToken=${managerToken}`])
        .send(tenantData);
      expect(response.statusCode).toBe(403);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(0);
    });
  });

  describe('DELETE /tenants/:id', () => {
    it('should delete a tenant', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const response = await request(app)
        .delete(`${baseUrl}/${tenant.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.data.tenantDeleteDto.name).toBe(tenant.name);
    });
  });

  describe('GET /tenants/', () => {
    it('should fetch all tenants', async () => {
      await createTenant(connection.getRepository(Tenant));

      const response = await request(app)
        .get(`${baseUrl}`)
        .set('Cookie', [`accessToken=${adminToken}`]);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.tenantGetAllDto[0]).toHaveProperty('id');
    });
  });

  describe('GET /tenants/:id', () => {
    it('should return 200 and the tenant data for a valid ID', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const response = await request(app)
        .get(`${baseUrl}/${tenant.id}`)
        .set('Cookie', [`accessToken=${adminToken}`]);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.tenantGetByIdDto.name).toBe(tenant.name);
      expect(response.body.data.tenantGetByIdDto.address).toBe(tenant.address);
    });
  });

  describe('update /tenants/:id', () => {
    it('should update a tenant', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const updatedData = {
        name: 'Test tenant',
        address: 'Test address',
      };

      const response = await request(app)
        .patch(`${baseUrl}/${tenant.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(updatedData);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.tenantUpdateDto.name).toBe(updatedData.name);

      const tenantRepository = connection.getRepository(Tenant);
      const updatedTenant = await tenantRepository.findOneBy({
        id: tenant.id,
      });
      expect(updatedTenant?.name).toBe(updatedData.name);
    });
  });
});
