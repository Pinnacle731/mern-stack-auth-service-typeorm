import createHttpError from 'http-errors';
import { AppDataSource } from '../../src/database/data-source';
import {
  getRefreshTokenRepository,
  getTenantRepository,
} from '../../src/utils/common';

// Typecast AppDataSource as a mock function that returns a Promise
jest.mock('../../src/database/data-source.ts', () => ({
  AppDataSource: jest.fn(),
}));

describe('getRefreshTokenRepository', () => {
  it('should throw an error if AppDataSource is undefined', async () => {
    // Mock AppDataSource to return undefined
    (AppDataSource as jest.Mock).mockResolvedValueOnce(undefined);

    await expect(getRefreshTokenRepository()).rejects.toThrow(
      createHttpError(
        500,
        'DataSource is undefined from getRefreshTokenRepository',
      ),
    );
  });

  it('should return a repository if AppDataSource is initialized correctly', async () => {
    const mockRepository = { findOne: jest.fn() }; // Mock Repository
    const mockDataSource = {
      initialize: jest.fn().mockResolvedValue(true),
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    // Mock AppDataSource to return a mock dataSource
    (AppDataSource as jest.Mock).mockResolvedValueOnce(mockDataSource);

    const repository = await getRefreshTokenRepository();
    expect(repository).toBe(mockRepository); // Ensure the returned repository matches the mock
    expect(mockDataSource.initialize).toHaveBeenCalled(); // Ensure initialize was called
  });
});

describe('getTenantRepository', () => {
  it('should throw an error if AppDataSource is undefined', async () => {
    // Mock AppDataSource to return undefined
    (AppDataSource as jest.Mock).mockResolvedValueOnce(undefined);

    await expect(getTenantRepository()).rejects.toThrow(
      createHttpError(500, 'DataSource is undefined from getTenantRepository'),
    );
  });

  it('should return a repository if AppDataSource is initialized correctly', async () => {
    const mockRepository = { findOne: jest.fn() }; // Mock Repository
    const mockDataSource = {
      initialize: jest.fn().mockResolvedValue(true),
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    // Mock AppDataSource to return a mock dataSource
    (AppDataSource as jest.Mock).mockResolvedValueOnce(mockDataSource);

    const repository = await getTenantRepository();
    expect(repository).toBe(mockRepository); // Ensure the returned repository matches the mock
    expect(mockDataSource.initialize).toHaveBeenCalled(); // Ensure initialize was called
  });
});
