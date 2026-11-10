export const SEVERITIES = Object.freeze(['Low', 'Medium', 'High', 'Critical']);
export const STATUSES = Object.freeze(['Open', 'In Progress', 'Resolved']);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const OPTIONAL_BUG_FIELDS = Object.freeze({
  reproductionSteps: { label: 'Reproduction steps', limit: 5000 },
  expectedResult: { label: 'Expected result', limit: 2000 },
  actualResult: { label: 'Actual result', limit: 2000 },
  debuggingNotes: { label: 'Debugging notes', limit: 5000 },
  solution: { label: 'Solution', limit: 5000 },
});

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateRegistration(body = {}) {
  const name = cleanString(body.name);
  const email = cleanString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const errors = {};

  if (name.length < 2 || name.length > 60) {
    errors.name = 'Name must be between 2 and 60 characters.';
  }
  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Password must contain at least one letter and one number.';
  }

  return { errors, values: { name, email, password } };
}

export function validateLogin(body = {}) {
  const email = cleanString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const errors = {};

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  }

  return { errors, values: { email, password } };
}

export function validateBug(body = {}) {
  const errors = {};
  const values = {};

  const title = cleanString(body.title);
  const description = cleanString(body.description);
  const project = cleanString(body.project);
  const severity = cleanString(body.severity) || 'Medium';
  const status = cleanString(body.status) || 'Open';

  if (title.length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  } else if (title.length > 140) {
    errors.title = 'Title cannot exceed 140 characters.';
  }

  if (description.length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  } else if (description.length > 5000) {
    errors.description = 'Description cannot exceed 5000 characters.';
  }

  if (project.length < 2) {
    errors.project = 'Project name must be at least 2 characters.';
  } else if (project.length > 80) {
    errors.project = 'Project name cannot exceed 80 characters.';
  }

  if (!SEVERITIES.includes(severity)) {
    errors.severity = `Severity must be one of: ${SEVERITIES.join(', ')}.`;
  }

  if (!STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${STATUSES.join(', ')}.`;
  }

  for (const [field, { label, limit }] of Object.entries(OPTIONAL_BUG_FIELDS)) {
    const value = cleanString(body[field]);
    if (value.length > limit) {
      errors[field] = `${label} cannot exceed ${limit} characters.`;
    }
    values[field] = value;
  }

  return {
    errors,
    values: { ...values, title, description, project, severity, status },
  };
}
