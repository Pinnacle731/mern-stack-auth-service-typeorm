import { Response } from 'express';

export const setResponseCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  //Add token to cookie
  res.cookie('accessToken', accessToken, {
    domain: 'localhost',
    httpOnly: true, //very important
    secure: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60, // cookie expires in 1 hours
  });
  res.cookie('refreshToken', refreshToken, {
    domain: 'localhost',
    httpOnly: true, //very important
    secure: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 365, // cookie expires in 1 year
  });
};
