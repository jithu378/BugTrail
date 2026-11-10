import { env } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let status = error.statusCode || error.status || 500;
  let message = error.message || 'Unexpected server error.';
  let errors;

  if (error.name === 'ValidationError' && error.errors) {
    status = 422;
    message = 'Please fix the highlighted fields.';
    errors = Object.fromEntries(
      Object.entries(error.errors).map(([field, detail]) => [field, detail.message]),
    );
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier.';
  } else if (error.code === 11000) {
    status = 409;
    message = 'An account with that email already exists.';
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body must be valid JSON.';
  }

  if (status >= 500) {
    console.error('[BugTrail API]', error);
    if (env.isProduction) message = 'Something went wrong on the server.';
  }

  res.status(status).json({ message, ...(errors ? { errors } : {}) });
}
