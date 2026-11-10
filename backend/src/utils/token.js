import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'bugtrail_token';

const UNIT_TO_MS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

export function parseDuration(value, fallbackMs = 7 * UNIT_TO_MS.d) {
  const match = /^(\d+)\s*([smhd])$/.exec(String(value ?? '').trim());
  if (!match) return fallbackMs;
  return Number(match[1]) * UNIT_TO_MS[match[2]];
}

export function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    path: '/',
    maxAge: parseDuration(env.jwtExpiresIn),
  };
}
