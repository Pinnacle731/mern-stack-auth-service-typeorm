import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { isJwt } from '../utils';
import { User } from '../../src/database/entities/User';
import { RefreshToken } from '../../src/database/entities/RefreshToken';
import { Roles } from '../../src/types';
import { AppDataSourceInitialize } from '../../src/utils/common';
import { generateAccessToken } from '../../src/services/tokenService';
import { JwtPayload } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { configEnv } from '../../src/config/config';

jest.setTimeout(20000); // Reduce test timeout for optimization

jest.mock('../../src/services/s3Service', () => ({
  getFileFromS3: jest.fn(),
}));

describe('POST /pizza-app/auth-service/api/v1/auth/register', () => {
  let connection: DataSource;
  const baseUrl = '/pizza-app/auth-service/api/v1/auth/register';

  const mockUser = {
    userName: 'parth731',
    firstName: 'Parth',
    lastName: 'Dangroshiya',
    email: 'BxPnM@example.com',
    password: 'Parth@123',
  };

  beforeAll(async () => {
    connection = await AppDataSourceInitialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Registration', () => {
    it('should create a new user and return 201 status code', async () => {
      const response = await request(app).post(baseUrl).send(mockUser);
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('user created!!');
      expect(response.body.data.registerUserDto).toHaveProperty('id');

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0]?.firstName).toBe(mockUser.firstName);
      expect(users[0]?.role).toBe(Roles.CUSTOMER);
    });

    it('should store hashed password and persist user in the database', async () => {
      await request(app).post(baseUrl).send(mockUser);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find({ select: ['password'] });
      expect(users[0]?.password).not.toBe(mockUser.password);
      expect(users[0]?.password).toHaveLength(60);
      expect(users[0]?.password).toMatch(/^\$2[a|b]\$\d+\$/);
    });

    it('should return valid access and refresh tokens in cookies', async () => {
      const response = await request(app).post(baseUrl).send(mockUser);

      // Ensure cookies are treated as an array
      const cookies = Array.isArray(response.headers['set-cookie'])
        ? response.headers['set-cookie']
        : [response.headers['set-cookie'] || ''];

      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('accessToken='),
      );
      const refreshTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('refreshToken='),
      );

      // Extracting token values from the cookies
      const accessToken = accessTokenCookie?.split('=')[1]?.split(';')[0];
      const refreshToken = refreshTokenCookie?.split('=')[1]?.split(';')[0];

      // Assertions
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();

      // Checking persistence of the refresh token
      const refreshTokenRepo = connection.getRepository(RefreshToken);
      const tokens = await refreshTokenRepo.find();
      expect(tokens).toHaveLength(1);
    });
  });

  describe('Invalid Registration', () => {
    const invalidCases = [
      { field: 'userName', data: { ...mockUser, userName: '' } },
      { field: 'email', data: { ...mockUser, email: '' } },
      { field: 'firstName', data: { ...mockUser, firstName: '' } },
      { field: 'lastName', data: { ...mockUser, lastName: '' } },
      { field: 'password', data: { ...mockUser, password: '' } },
    ];

    invalidCases.forEach(({ field, data }) => {
      it(`should return 400 status code if ${field} is missing`, async () => {
        const response = await request(app).post(baseUrl).send(data);
        expect(response.statusCode).toBe(400);

        const userRepository = connection.getRepository(User);
        const users = await userRepository.find();
        expect(users).toHaveLength(0);
      });
    });

    it('should return 400 if email format is invalid', async () => {
      const response = await request(app)
        .post(baseUrl)
        .send({ ...mockUser, email: 'invalidemail' });
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 if password format is invalid', async () => {
      const response = await request(app)
        .post(baseUrl)
        .send({ ...mockUser, password: 'short' });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Duplicate Email', () => {
    it('should return 400 if email already exists', async () => {
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...mockUser, role: Roles.CUSTOMER });

      const response = await request(app).post(baseUrl).send(mockUser);
      expect(response.statusCode).toBe(400);

      const users = await userRepository.find();
      expect(users).toHaveLength(1);
    });
  });

  describe('Field Formatting', () => {
    it('should trim the email field', async () => {
      await request(app)
        .post(baseUrl)
        .send({ ...mockUser, email: ' BxPnM@example.com ' });

      const userRepository = connection.getRepository(User);
      const user = await userRepository.findOneBy({
        email: 'BxPnM@example.com',
      });
      expect(user).toBeDefined();
    });
  });

  describe('generateAccessToken', () => {
    const mockPayload: JwtPayload = {
      sub: '1',
      role: 'CUSTOMER',
      userName: 'parth731',
      firstName: 'Parth',
      lastName: 'Dangroshiya',
      email: 'BxPnM@example.com',
      password: 'Parth@123',
      tenant: '',
    };

    it('should generate a valid JWT when provided a valid payload', async () => {
      const token = await generateAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should throw an error if private key is missing', async () => {
      // Backup the original private key
      const originalPrivateKey = configEnv.privatekey;

      // Set the private key to undefined
      configEnv.privatekey = '';
      await expect(generateAccessToken(mockPayload)).rejects.toThrow(
        createHttpError(500, 'Private key not found in configuration'),
      );
      // Restore the original private key after the test
      configEnv.privatekey = originalPrivateKey;
    });

    it('should throw an error if S3 bucket details are invalid in non-test environments', async () => {
      const nodeENV = 'prod';
      const awsS3BucketName = 'mern-stack-service-bucket';
      configEnv.nodeEnv = 'prod';
      configEnv.awsS3BucketName = '';
      await expect(generateAccessToken(mockPayload)).rejects.toThrow(
        createHttpError(500, 'S3 bucket name or key not provided'),
      );
      configEnv.nodeEnv = nodeENV;
      configEnv.awsS3BucketName = awsS3BucketName;
    });
  });
});
