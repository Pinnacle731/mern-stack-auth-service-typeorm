import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../src/app';
import { isJwt } from '../utils';
import { AppDataSource } from '../../src/database/data-source';
import { User } from '../../src/database/entities/User';
import { Roles } from '../../src/types';

describe('POST /pizza-app/auth-service/api/v1/auth/login', () => {
  let connection: DataSource;
  const baseUrl = '/pizza-app/auth-service/api/v1/auth/login';
  const UserInfo = () => {
    const userData = {
      userName: 'parth731',
      firstName: 'Parth',
      lastName: 'Dangroshiya',
      email: 'BxPnM@example.com',
      password: 'Parth@123',
    };

    return userData;
  };

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // database truncate
    // await truncateTable(connection);
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    //database close
    await connection.destroy();
  });

  it('should return the 200 if username or email or password tested successfully', async () => {
    // Arrange
    const userData = UserInfo();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userRepository = connection.getRepository(User);
    await userRepository.save({
      ...userData,
      password: hashedPassword,
      role: Roles.CUSTOMER,
    });

    // Act
    const responsePassword = await request(app).post(baseUrl).send({
      userName: userData.userName,
      email: userData.email,
      password: userData.password,
    });

    // Assert
    expect(responsePassword.statusCode).toBe(200);
  });

  it('should return the access token and refresh token inside a cookie', async () => {
    // Arrange
    const userData = UserInfo();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userRepository = connection.getRepository(User);
    await userRepository.save({
      ...userData,
      password: hashedPassword,
      role: Roles.CUSTOMER,
    });

    // Act
    const response = await request(app).post(baseUrl).send({
      userName: userData.userName,
      email: userData.email,
      password: userData.password,
    });

    // Assert
    interface Headers {
      'set-cookie': string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }
    // accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjkzOTA5Mjc2LCJleHAiOjE2OTM5MDkzMzYsImlzcyI6Im1lcm5zcGFjZSJ9.KetQMEzY36vxhO6WKwSR-P_feRU1yI-nJtp6RhCEZQTPlQlmVsNTP7mO-qfCdBr0gszxHi9Jd1mqf-hGhfiK8BRA_Zy2CH9xpPTBud_luqLMvfPiz3gYR24jPjDxfZJscdhE_AIL6Uv2fxCKvLba17X0WbefJSy4rtx3ZyLkbnnbelIqu5J5_7lz4aIkHjt-rb_sBaoQ0l8wE5KzyDNy7mGUf7cI_yR8D8VlO7x9llbhvCHF8ts6YSBRBt_e2Mjg5txtfBaDq5auCTXQ2lmnJtMb75t1nAFu8KwQPrDYmwtGZDkHUcpQhlP7R-y3H99YnrWpXbP8Zr_oO67hWnoCSw; Max-Age=43200; Domain=localhost; Path=/; Expires=Tue, 05 Sep 2023 22:21:16 GMT; HttpOnly; SameSite=Strict
    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    const cookies = (response.headers as Headers)['set-cookie'] || [];
    cookies.forEach((cookie) => {
      if (cookie.startsWith('accessToken=')) {
        accessToken = cookie.split(';')[0].split('=')[1];
      }

      if (cookie.startsWith('refreshToken=')) {
        refreshToken = cookie.split(';')[0].split('=')[1];
      }
    });
    expect(accessToken).not.toBeNull();
    expect(refreshToken).not.toBeNull();

    // check jwt token
    expect(isJwt(accessToken)).toBeTruthy();
    expect(isJwt(refreshToken)).toBeTruthy();
  });

  it('should return the 400 if username is empty', async () => {
    // Arrange
    const userData = UserInfo();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userRepository = connection.getRepository(User);
    await userRepository.save({
      ...userData,
      password: hashedPassword,
      role: Roles.CUSTOMER,
    });

    // Act
    const responsePassword = await request(app).post(baseUrl).send({
      userName: '',
      email: userData.email,
      password: userData.password,
    });

    // Assert
    expect(responsePassword.statusCode).toBe(400);
  });

  it('should return the 400 if email is empty', async () => {
    // Arrange
    const userData = UserInfo();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userRepository = connection.getRepository(User);
    await userRepository.save({
      ...userData,
      password: hashedPassword,
      role: Roles.CUSTOMER,
    });

    // Act
    const responsePassword = await request(app).post(baseUrl).send({
      userName: userData.userName,
      email: '',
      password: userData.password,
    });

    // Assert
    expect(responsePassword.statusCode).toBe(400);
  });

  it('should return the 400 if password is empty', async () => {
    // Arrange
    const userData = UserInfo();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userRepository = connection.getRepository(User);
    await userRepository.save({
      ...userData,
      password: hashedPassword,
      role: Roles.CUSTOMER,
    });

    // Act
    const responsePassword = await request(app).post(baseUrl).send({
      userName: userData.userName,
      email: userData.email,
      password: '',
    });

    // Assert
    expect(responsePassword.statusCode).toBe(400);
  });

  it('should return the 400 if username or email or password is wrong', async () => {
    // Arrange
    const userData = UserInfo();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userRepository = connection.getRepository(User);
    await userRepository.save({
      ...userData,
      password: hashedPassword,
      role: Roles.CUSTOMER,
    });

    // Act
    const responsePassword = await request(app).post(baseUrl).send({
      userName: userData.userName,
      email: userData.email,
      password: 'wrongPassword',
    });

    const responseUsername = await request(app).post(baseUrl).send({
      userName: 'parth732',
      email: userData.email,
      password: userData.password,
    });

    // Assert
    expect(responsePassword.statusCode).toBe(400);
    expect(responseUsername.statusCode).toBe(400);
  });
});
