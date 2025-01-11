import { DataSource } from 'typeorm';
import request from 'supertest';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';
import { AppDataSource } from '../../src/database/data-source';
import { Tenant } from '../../src/database/entities/Tenant';
import { createTenant } from '../utils';

describe('get tenants from database', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  const baseUrl = '/pizza-app/auth-service/api/v1/tenants';

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock('http://localhost:5501');
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
});
