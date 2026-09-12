import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUserPayload } from '../types';

export function signJwt(payload: AuthUserPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
}

export function verifyJwt(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as AuthUserPayload;
  } catch {
    return null;
  }
}
