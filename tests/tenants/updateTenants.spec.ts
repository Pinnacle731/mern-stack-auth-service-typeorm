import { DataSource } from 'typeorm';
import request from 'supertest';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';
import { AppDataSource } from '../../src/database/data-source';
import { Tenant } from '../../src/database/entities/Tenant';
import { createTenant } from '../utils';

describe('update a tenant in the database', () => {
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
  describe('update /tenants/:id', () => {
    it('should update a tenant', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const updatedData = {
        name: 'Test tenant 1',
        address: 'Test address 1',
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
