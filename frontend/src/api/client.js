const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Unable to reach the server. Check your connection and try again.');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => ({})) : {};

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event('bugtrail:unauthorized'));
    }
    throw new ApiError(
      payload.message || `Request failed with status ${response.status}.`,
      response.status,
      payload.errors,
    );
  }

  return payload;
}

export const api = {
  auth: {
    me: (signal) => apiRequest('/auth/me', { signal }),
    login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
    register: (details) => apiRequest('/auth/register', { method: 'POST', body: details }),
    logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  },
  bugs: {
    list: (params, signal) => apiRequest(`/bugs${buildQuery(params)}`, { signal }),
    stats: (signal) => apiRequest('/bugs/stats', { signal }),
    projects: (signal) => apiRequest('/bugs/projects', { signal }),
    get: (id, signal) => apiRequest(`/bugs/${id}`, { signal }),
    create: (payload) => apiRequest('/bugs', { method: 'POST', body: payload }),
    update: (id, payload) => apiRequest(`/bugs/${id}`, { method: 'PUT', body: payload }),
    remove: (id) => apiRequest(`/bugs/${id}`, { method: 'DELETE' }),
  },
};
