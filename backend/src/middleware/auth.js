import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AUTH_COOKIE } from '../utils/token.js';

/**
 * Accepts the httpOnly auth cookie (preferred) or an Authorization: Bearer token.
 */
export async function protect(req, res, next) {
  try {
    let token = req.cookies?.[AUTH_COOKIE];
    const header = req.headers.authorization;

    if (!token && header?.startsWith('Bearer ')) {
      token = header.slice(7).trim();
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Your session is no longer valid. Please sign in again.' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}
