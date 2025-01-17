import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSourceInitialize } from '../../src/utils/common';
import { RefreshToken } from '../../src/database/entities/RefreshToken';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/types';
import { createTenant } from '../utils';
import { Tenant } from '../../src/database/entities/Tenant';

describe('POST /pizza-app/auth-service/api/v1/auth/logout', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  const baseUrl = '/pizza-app/auth-service/api/v1/auth/logout';

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
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(() => {
    jwks.stop();
  });

  it('should clear cookies and delete the refresh token', async () => {
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
      role: Roles.ADMIN,
    };

    // Add token to cookie
    const responseUser = await request(app)
      .post('/pizza-app/auth-service/api/v1/auth/register')
      .set('Cookie', [`accessToken=${adminToken}`])
      .send(userData);

    console.log('User registration response:', responseUser.body);

    const cookies: string[] = responseUser.headers[
      'set-cookie'
    ] as unknown as string[];
    console.log('Cookies set on registration:', cookies);

    const accessTokenCookie = cookies.find((cookie) =>
      cookie.startsWith('accessToken='),
    );

    if (!accessTokenCookie) {
      throw new Error('Access token cookie not found');
    }

    const accessToken = accessTokenCookie.split('=')[1].split(';')[0];
    console.log('Extracted access token:', accessToken);

    const response = await request(app)
      .post(baseUrl)
      .set('Cookie', cookies)
      .send();

    console.log('Logout response body:', response.body);
    console.log('Logout response status code:', response.statusCode);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('logout successfully!!!');

    // Checking if cookies are cleared
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/accessToken=;/),
        expect.stringMatching(/refreshToken=;/),
      ]),
    );

    const refreshTokenRepo = connection.getRepository(RefreshToken);
    const tokens = await refreshTokenRepo.find();

    // Debugging the state of refresh tokens
    console.log('Refresh tokens in the database:', tokens);

    expect(tokens).toHaveLength(0);
  });

  // it('should return an error if no authorization token is provided', async () => {
  //   const response = await request(app).post(baseUrl).send();

  //   expect(response.statusCode).toBe(401);
  //   expect(response.body.message).toBe('Unauthorized');
  // });
});
