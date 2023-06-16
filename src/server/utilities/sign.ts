import jwt from 'jsonwebtoken';
import { AuthUser } from '../../config/types.js';
import { env } from '../../env.js';

export const sign = (user: AuthUser, expiresIn: number): string => {
  return jwt.sign(user, env.SECRET, {
    expiresIn,
  });
};
