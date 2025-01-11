import createJWKSMock from 'mock-jwks';
// import jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';
import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/database/entities/User';
import { AppDataSource } from '../../src/database/data-source';
import { configEnv } from '../../src/config/config';
import { Roles } from '../../src/types';

configEnv.baseUrl = 'test-secret';
describe('GET /pizza-app/auth-service/api/v1/auth/self', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock('http://localhost:5501');
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
    await connection.close();
  });

  describe('Given all fields', () => {
    it('should return the 200 status code', async () => {
      const accessToken = jwks.token({
        sub: '5',
        role: Roles.CUSTOMER,
      });

      const response = await request(app)
        .get('/pizza-app/auth-service/api/v1/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.statusCode).toBe(200);
    });

    it('should return the user data', async () => {
      // Register user
      const userData = {
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnM@example.com',
        password: 'Parth@123',
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      // Generate token
      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });
      // Add token to cookie
      const response = await request(app)
        .get('/pizza-app/auth-service/api/v1/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      // Assert
      // Check if user id matches with registered user
      expect(response.statusCode).toBe(200);
      expect((response.body.data.selfDto as Record<string, string>).id).toBe(
        data.id,
      );
    });

    it('should not return the password field', async () => {
      // Register user
      const userData = {
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnM@example.com',
        password: 'Parth@123',
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      // Generate token
      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      // Add token to cookie
      const response = await request(app)
        .get('/pizza-app/auth-service/api/v1/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();
      // Assert
      // Check if user id matches with registered user
      expect(response.body as Record<string, string>).not.toHaveProperty(
        'password',
      );
    });

    it('should return 401 status code if token does not exists', async () => {
      // Register user
      const userData = {
        userName: 'parth731',
        firstName: 'Parth',
        lastName: 'Dangroshiya',
        email: 'BxPnM@example.com',
        password: 'Parth@123',
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      // Add token to cookie
      const response = await request(app)
        .get('/pizza-app/auth-service/api/v1/auth/self')
        .send();
      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
