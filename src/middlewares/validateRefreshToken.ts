import { expressjwt } from 'express-jwt';
import { Request } from 'express';
import { AuthCookies, IRefreshTokenPayload } from '../types';
import logger from '../config/logger';
import { configEnv } from '../config/config';
import { getRefreshTokenRepository } from '../utils/common';

export default expressjwt({
  secret: configEnv.refreshTokenSecret,
  algorithms: ['HS256'],
  // get refresh token
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookies;
    return refreshToken;
  },
  // validate to refresh token
  async isRevoked(req: Request, token) {
    /**
     * 
     * isRevoked {
        header: { alg: 'HS256', typ: 'JWT' },
        payload: {
            sub: '3',
            role: 'customer',
            id: '7',
            iat: 1734851865,
            exp: 1766409465,
            iss: 'Auth-service',
            jti: '7'
        },
        signature: '-Lpnst36CS5xQ_Ke3y2OS17CgiHfrlHmAIXytDtUsrE'
        }
        */
    try {
      const refreshTokenRepository = await getRefreshTokenRepository();
      const refreshToken = await refreshTokenRepository.findOne({
        where: {
          id: Number((token?.payload as IRefreshTokenPayload).id),
          user: { id: Number(token?.payload.sub) },
        },
      });
      return refreshToken === null;
    } catch (error) {
      logger.error(`Error while getting the refresh token: ${error}`, {
        id: (token?.payload as IRefreshTokenPayload).id,
      });
    }
    return true;
  },
});
