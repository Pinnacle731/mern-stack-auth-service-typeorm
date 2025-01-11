import { DataSource } from 'typeorm';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { AppDataSource } from '../../src/database/data-source';
import { createTenant, createUser } from '../utils';
import { Tenant } from '../../src/database/entities/Tenant';
import { User } from '../../src/database/entities/User';
import app from '../../src/app';
import { Roles } from '../../src/types';

describe('update a user in the database', () => {
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
  describe('UPDATE users/:id', () => {
    it('should update a user in the database', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const user = await createUser(connection.getRepository(User), tenant);

      const adminToken = jwks.token({
        sub: String(user.id),
        role: user.role,
      });

      // Register user
      const updateData = {
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnMupdate@example.com',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie
      const response = await request(app)
        .patch(`${baseUrl}/${user.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(updateData);

      // Check response
      expect(response.statusCode).toBe(200);

      // Verify updated user in database
      const userRepository = connection.getRepository(User);
      const updatedUser = await userRepository.findOne({
        where: { id: user.id },
      });

      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.email).toBe(updateData.email);
      expect(updatedUser?.firstName).toBe(updateData.firstName);
      expect(updatedUser?.role).toBe(updateData.role);
    });

    it('should not update a user if not authorized', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userRepository = connection.getRepository(User);
      const user = await userRepository.save({
        tenant: { id: tenant.id },
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnM@example.com',
        password: 'Parth@123',
        role: Roles.ADMIN,
      });

      const adminToken = jwks.token({
        sub: String(user.id),
        role: Roles.ADMIN,
      });

      // Register user
      const updateData = {
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnMupdate@example.com',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie
      const response = await request(app)
        .patch(`/pizza-app/auth-service/api/v1/users/${user.id}`)
        .set('Cookie', [`refreshToken =${adminToken}`])
        .send(updateData);

      // Check response
      expect(response.statusCode).toBe(401);
    });

    it('should not update a user if not admin', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const userRepository = connection.getRepository(User);
      const user = await userRepository.save({
        tenant: { id: tenant.id },
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnM@example.com',
        password: 'Parth@123',
        role: Roles.CUSTOMER,
      });

      const adminToken = jwks.token({
        sub: String(user.id),
        role: user.role,
      });

      // Register user
      const updateData = {
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnMupdate@example.com',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie
      const response = await request(app)
        .patch(`/pizza-app/auth-service/api/v1/users/${user.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(updateData);

      // Check response
      expect(response.statusCode).toBe(403);
    });
  });
});
