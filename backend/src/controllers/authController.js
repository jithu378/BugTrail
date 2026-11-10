import { User } from '../models/User.js';
import { AUTH_COOKIE, cookieOptions, signToken } from '../utils/token.js';
import { validateLogin, validateRegistration } from '../utils/validation.js';

function beginSession(res, userId) {
  const token = signToken(userId);
  res.cookie(AUTH_COOKIE, token, cookieOptions());
}

export async function register(req, res) {
  const { errors, values } = validateRegistration(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ message: 'Please fix the highlighted fields.', errors });
  }

  const existing = await User.findOne({ email: values.email }).lean();
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const user = await User.create(values);
  beginSession(res, user._id);

  return res.status(201).json({ user: user.toPublicJSON() });
}

export async function login(req, res) {
  const { errors, values } = validateLogin(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ message: 'Please fix the highlighted fields.', errors });
  }

  const user = await User.findOne({ email: values.email }).select('+password');
  const isValid = user ? await user.verifyPassword(values.password) : false;

  if (!isValid) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }

  beginSession(res, user._id);
  return res.json({ user: user.toPublicJSON() });
}

export function logout(req, res) {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(AUTH_COOKIE, options);
  res.json({ message: 'Signed out successfully.' });
}

export function me(req, res) {
  res.json({ user: req.user.toPublicJSON() });
}
