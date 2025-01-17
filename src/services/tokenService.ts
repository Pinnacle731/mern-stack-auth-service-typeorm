import createHttpError from 'http-errors';
import { JwtPayload, sign } from 'jsonwebtoken';
import { RefreshToken } from '../database/entities/RefreshToken';
import { getRefreshTokenRepository, isLeapYear } from '../utils/common';
import { configEnv } from '../config/config';
import { UserCreateType } from '../types/auth';
import { getFileFromS3 } from './s3Service';
import { NODE_ENV_VAL } from '../constants';

export const generateAccessToken = async (
  payload: JwtPayload,
): Promise<string> => {
  let privateKey: string | undefined;

  try {
    if (configEnv.nodeEnv !== NODE_ENV_VAL.TEST) {
      // Fetch the private key from S3
      const bucketName = configEnv.awsS3BucketName;
      const key = 'auth-service/private.pem';

      if (!bucketName || !key) {
        throw createHttpError(500, 'S3 bucket name or key not provided');
      }

      privateKey = await getFileFromS3(bucketName, key);

      if (!privateKey) {
        throw createHttpError(500, 'Private key not found in S3');
      }
    } else if (configEnv.privatekey) {
      privateKey = configEnv.privatekey.replace(/\\n/g, '\n');
    } else {
      throw createHttpError(500, 'Private key not found in configuration');
    }
  } catch (err) {
    if (err instanceof Error) {
      throw createHttpError(500, `${err.message}`);
    }
    throw createHttpError(500, 'Error while reading private key');
  }

  try {
    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: String(configEnv.accessTokenExpiresIn),
      issuer: String(configEnv.accessTokenIssuer),
    });
    return accessToken;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw createHttpError(500, 'Error generating access token');
  }
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const refreshToken = sign(payload, configEnv.refreshTokenSecret, {
    algorithm: 'HS256',
    expiresIn: String(configEnv.refreshTokenExpiresIn),
    issuer: String(configEnv.refreshTokenIssuer),
    jwtid: payload.id.toString(), //embed the refresh token id
  });
  return refreshToken;
};

export const persistRefreshToken = async (
  user: UserCreateType,
): Promise<RefreshToken> => {
  const MS_IN_YEAR = isLeapYear(new Date().getFullYear());
  // sonarqube-ignore-line
  // const refreshTokenRepository: Repository<RefreshToken> =
  // AppDataSource.getRepository(RefreshToken);
  const refreshTokenRepository = await getRefreshTokenRepository();
  const newRefreshToken = await refreshTokenRepository.save({
    user: user,
    expiresAt: new Date(Date.now() + MS_IN_YEAR),
  });
  return newRefreshToken;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const deleteRefreshToken = async (tokenId: number) => {
  // sonarqube-ignore-line
  // const refreshTokenRepository: Repository<RefreshToken> =
  //   AppDataSource.getRepository(RefreshToken);
  const refreshTokenRepository = await getRefreshTokenRepository();
  return refreshTokenRepository.delete({ id: tokenId });
};
