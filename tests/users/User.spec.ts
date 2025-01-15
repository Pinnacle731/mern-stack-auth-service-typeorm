import { DataSource } from 'typeorm';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { createTenant, createUser } from '../utils';
import { Tenant } from '../../src/database/entities/Tenant';
import { Roles } from '../../src/types/index';
import { User } from '../../src/database/entities/User';
import app from '../../src/app';
import { AppDataSourceInitialize } from '../../src/utils/common';

/***
 * 401 not authorized error :-> when pass refreshToken as cookie then error generated
 * 403 forbidden error :-> when pass role pass as customer and manager then error generated
 */

describe('create user in the database', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  const baseUrl = `/pizza-app/auth-service/api/v1/users`;
  const baseUrlRefresh = `/pizza-app/auth-service/api/v1/auth/refresh`;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501');
    // connection = await AppDataSource.initialize();
    connection = await AppDataSourceInitialize();
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

  describe('POST /users', () => {
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
    it('should create refresh token in the database', async () => {
      // Create tenant
      const tenant = await createTenant(connection.getRepository(Tenant));
      const user = await createUser(connection.getRepository(User), tenant);

      const adminToken = jwks.token({
        sub: String(user.id),
        role: Roles.ADMIN,
      });

      // Add token to cookie
      await request(app)
        .post(baseUrlRefresh)
        .set('Cookie', [`refrshToken=${adminToken}`])
        .send();

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.ADMIN);
    });
  });

  describe('GET users/:id', () => {
    it('should return 200 and the single user data for a valid ID', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const user = await createUser(connection.getRepository(User), tenant);
      const adminToken = jwks.token({
        sub: String(user.id),
        role: user.role,
      });
      const response = await request(app)
        .get(`${baseUrl}/${user.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.data.getUserByIdDto.id).toEqual(user.id);
      expect(response.body.data.getUserByIdDto.userName).toEqual(user.userName);
    });
  });

  describe('GET /users', () => {
    it('should fetch all users', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const user = await createUser(connection.getRepository(User), tenant);
      const adminToken = jwks.token({
        sub: String(user.id),
        role: user.role,
      });
      const response = await request(app)
        .get(baseUrl)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.data.getAllUsersDto[0]).toHaveProperty('id');
    });
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

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const user = await createUser(connection.getRepository(User), tenant);
      const adminToken = jwks.token({
        sub: String(user.id),
        role: user.role,
      });
      const response = await request(app)
        .delete(`${baseUrl}/${user.id}`)
        .set('Cookie', [`accessToken=${adminToken}`])
        .send();
      expect(response.statusCode).toBe(200);
      expect(response.body.data.deleteUserDto.id).toBe(user.id);
      expect(response.body.data.deleteUserDto.userName).toBe(user.userName);

      // const userRepository = connection.getRepository(User);
      // const deletedUser = await userRepository.findOneBy({ id: user.id });
      // expect(deletedUser).toBeNull();
    });
  });
});
