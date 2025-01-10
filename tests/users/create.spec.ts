import { DataSource } from 'typeorm';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { AppDataSource } from '../../src/database/data-source';
import { createTenant } from '../utils';
import { Tenant } from '../../src/database/entities/Tenant';
import { Roles } from '../../src/types/index';
import { User } from '../../src/database/entities/User';
import app from '../../src/app';

describe('POST /users', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  const baseUrl = `/pizza-app/auth-service/api/v1/users`;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all fields', () => {
    it('should persist the user in the database', async () => {
      // Create tenant first
      const tenant = await createTenant(connection.getRepository(Tenant));

      const adminToken = jwks.token({
        sub: '1',
        role: Roles.ADMIN,
      });

      // Register user
      const userData = {
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnM@example.com',
        password: 'Parth@123',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie
      await request(app)
        .post(baseUrl)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });
    it('should create a manager user', async () => {
      // Create tenant
      const tenant = await createTenant(connection.getRepository(Tenant));

      const adminToken = jwks.token({
        sub: '1',
        role: Roles.ADMIN,
      });

      // Register user
      const userData = {
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnM@example.com',
        password: 'Parth@123',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie
      await request(app)
        .post(baseUrl)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
    });
    it('should return 403 if non admin and manager user tries to create a user', async () => {
      // Create tenant first
      const tenant = await createTenant(connection.getRepository(Tenant));

      const nonAdminToken = jwks.token({
        sub: '1',
        role: Roles.CUSTOMER,
      });

      const userData = {
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnM@example.com',
        password: 'Parth@123',
        tenantId: tenant.id,
        role: Roles.ADMIN,
      };

      // Add token to cookie
      const response = await request(app)
        .post(baseUrl)
        .set('Cookie', [`accessToken=${nonAdminToken}`])
        .send(userData);

      expect(response.statusCode).toBe(403);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(0);
    });
  });
});
