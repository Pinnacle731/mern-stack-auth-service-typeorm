import { expressjwt } from 'express-jwt';
import { Request } from 'express';
import { AuthCookies } from '../types';
import { configEnv } from '../config/config';

export default expressjwt({
  secret: configEnv.refreshTokenSecret!,
  algorithms: ['HS256'],
  // get refresh token
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookies;

    return refreshToken;
  },
});
