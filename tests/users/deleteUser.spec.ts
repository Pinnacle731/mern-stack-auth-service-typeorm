import { DataSource } from 'typeorm';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { AppDataSource } from '../../src/database/data-source';
import { createTenant, createUser } from '../utils';
import { Tenant } from '../../src/database/entities/Tenant';
import { User } from '../../src/database/entities/User';
import app from '../../src/app';

describe('delete a user in the database', () => {
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
