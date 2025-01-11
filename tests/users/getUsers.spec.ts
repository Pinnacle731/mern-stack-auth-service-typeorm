import { DataSource } from 'typeorm';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { AppDataSource } from '../../src/database/data-source';
import { createTenant, createUser } from '../utils';
import { Tenant } from '../../src/database/entities/Tenant';
import { User } from '../../src/database/entities/User';
import app from '../../src/app';

describe('get users from database', () => {
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
});
