import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/bugtrail_test';
process.env.JWT_SECRET = 'test-only-secret-value-that-is-long-enough';
process.env.BCRYPT_ROUNDS = '4';
process.env.JWT_EXPIRES_IN = '1h';

const { default: app } = await import('../src/app.js');
const { connectDB, disconnectDB } = await import('../src/config/db.js');

let server;
let baseUrl;
let cookie = '';

const credentials = {
  name: 'Test Engineer',
  email: 'tester@bugtrail.dev',
  password: 'bugtrail123',
};

before(async () => {
  await connectDB();
  await mongoose.connection.db.dropDatabase();

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  await mongoose.connection.db.dropDatabase();
  await new Promise((resolve) => server.close(resolve));
  await disconnectDB();
});

function extractCookie(response) {
  const setCookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [response.headers.get('set-cookie')].filter(Boolean);

  const authCookie = setCookies.find((value) => value.startsWith('bugtrail_token='));
  return authCookie ? authCookie.split(';')[0] : '';
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && cookie) headers.Cookie = cookie;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  return { response, data };
}

test('health endpoint responds', async () => {
  const { response, data } = await request('/health', { auth: false });
  assert.equal(response.status, 200);
  assert.equal(data.status, 'ok');
});

test('rejects an invalid registration payload', async () => {
  const { response, data } = await request('/auth/register', {
    method: 'POST',
    auth: false,
    body: { name: 'A', email: 'not-an-email', password: 'short' },
  });

  assert.equal(response.status, 422);
  assert.ok(data.errors.name);
  assert.ok(data.errors.email);
  assert.ok(data.errors.password);
});

test('registers a user and sets an httpOnly session cookie', async () => {
  const { response, data } = await request('/auth/register', {
    method: 'POST',
    auth: false,
    body: credentials,
  });

  assert.equal(response.status, 201);
  assert.equal(data.user.email, credentials.email);
  assert.equal(data.user.password, undefined);

  cookie = extractCookie(response);
  assert.match(cookie, /^bugtrail_token=.+/);

  const setCookie = response.headers.getSetCookie().join(';');
  assert.match(setCookie, /HttpOnly/i);
});

test('returns the current user for an authenticated request', async () => {
  const { response, data } = await request('/auth/me');
  assert.equal(response.status, 200);
  assert.equal(data.user.name, credentials.name);
});

test('blocks duplicate registration', async () => {
  const { response } = await request('/auth/register', {
    method: 'POST',
    auth: false,
    body: { ...credentials, name: 'Someone Else' },
  });
  assert.equal(response.status, 409);
});

test('rejects a wrong password', async () => {
  const { response } = await request('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email: credentials.email, password: 'wrongpass123' },
  });
  assert.equal(response.status, 401);
});

test('logs in and refreshes the session cookie', async () => {
  const { response, data } = await request('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email: credentials.email, password: credentials.password },
  });

  assert.equal(response.status, 200);
  assert.equal(data.user.email, credentials.email);

  const refreshed = extractCookie(response);
  assert.ok(refreshed);
  cookie = refreshed;
});

test('requires authentication for bug routes', async () => {
  const { response } = await request('/bugs', { auth: false });
  assert.equal(response.status, 401);
});

test('validates bug creation payloads', async () => {
  const { response, data } = await request('/bugs', {
    method: 'POST',
    body: { title: 'x', description: 'short', project: '' },
  });

  assert.equal(response.status, 422);
  assert.ok(data.errors.title);
  assert.ok(data.errors.description);
  assert.ok(data.errors.project);
});

let bugId;

test('creates a bug report', async () => {
  const { response, data } = await request('/bugs', {
    method: 'POST',
    body: {
      title: 'Checkout button unresponsive on Safari',
      description: 'The primary checkout button does nothing when tapped in Safari 17.',
      project: 'Storefront',
      severity: 'High',
      status: 'Open',
      reproductionSteps: '1. Open Safari\n2. Add item to cart\n3. Tap Checkout',
      expectedResult: 'Checkout modal opens.',
      actualResult: 'Nothing happens.',
      debuggingNotes: 'Event listener attached before hydration.',
      solution: '',
    },
  });

  assert.equal(response.status, 201);
  assert.equal(data.bug.title, 'Checkout button unresponsive on Safari');
  assert.equal(data.bug.severity, 'High');
  assert.equal(data.bug.status, 'Open');
  bugId = data.bug._id;
});

test('fetches a bug by id', async () => {
  const { response, data } = await request(`/bugs/${bugId}`);
  assert.equal(response.status, 200);
  assert.equal(data.bug._id, bugId);
});

test('lists bugs with search and filters', async () => {
  await request('/bugs', {
    method: 'POST',
    body: {
      title: 'Memory leak in upload worker',
      description: 'Worker memory grows without bound after repeated uploads.',
      project: 'Media Pipeline',
      severity: 'Critical',
      status: 'In Progress',
    },
  });

  const all = await request('/bugs');
  assert.equal(all.response.status, 200);
  assert.equal(all.data.pagination.total, 2);

  const search = await request('/bugs?search=memory');
  assert.equal(search.data.bugs.length, 1);
  assert.equal(search.data.bugs[0].severity, 'Critical');

  const bySeverity = await request('/bugs?severity=High');
  assert.equal(bySeverity.data.bugs.length, 1);
  assert.equal(bySeverity.data.bugs[0].project, 'Storefront');

  const byStatus = await request('/bugs?status=In%20Progress');
  assert.equal(byStatus.data.bugs.length, 1);

  const byProject = await request('/bugs?project=Media%20Pipeline');
  assert.equal(byProject.data.bugs.length, 1);

  const noMatch = await request('/bugs?search=does-not-exist');
  assert.equal(noMatch.data.bugs.length, 0);
});

test('returns dashboard stats and project list', async () => {
  const stats = await request('/bugs/stats');
  assert.equal(stats.response.status, 200);
  assert.deepEqual(stats.data.counts, { total: 2, open: 1, inProgress: 1, resolved: 0 });
  assert.equal(stats.data.bySeverity.High, 1);
  assert.equal(stats.data.bySeverity.Critical, 1);
  assert.equal(stats.data.recent.length, 2);

  const projects = await request('/bugs/projects');
  assert.deepEqual(projects.data.projects, ['Media Pipeline', 'Storefront']);
});

test('updates a bug and stamps the resolved date', async () => {
  const { response, data } = await request(`/bugs/${bugId}`, {
    method: 'PUT',
    body: {
      title: 'Checkout button unresponsive on Safari',
      description: 'The primary checkout button does nothing when tapped in Safari 17.',
      project: 'Storefront',
      severity: 'High',
      status: 'Resolved',
      solution: 'Moved the click handler outside the hydration boundary.',
    },
  });

  assert.equal(response.status, 200);
  assert.equal(data.bug.status, 'Resolved');
  assert.ok(data.bug.resolvedAt);
});

test('keeps bug data isolated between users', async () => {
  const register = await request('/auth/register', {
    method: 'POST',
    auth: false,
    body: { name: 'Second User', email: 'second@bugtrail.dev', password: 'secondpass123' },
  });

  const secondCookie = extractCookie(register.response);
  const list = await fetch(`${baseUrl}/bugs`, { headers: { Cookie: secondCookie } });
  const payload = await list.json();

  assert.equal(payload.pagination.total, 0);

  const foreign = await fetch(`${baseUrl}/bugs/${bugId}`, { headers: { Cookie: secondCookie } });
  assert.equal(foreign.status, 404);

  const foreignDelete = await fetch(`${baseUrl}/bugs/${bugId}`, {
    method: 'DELETE',
    headers: { Cookie: secondCookie },
  });
  assert.equal(foreignDelete.status, 404);
});

test('deletes a bug', async () => {
  const { response } = await request(`/bugs/${bugId}`, { method: 'DELETE' });
  assert.equal(response.status, 200);

  const missing = await request(`/bugs/${bugId}`);
  assert.equal(missing.response.status, 404);
});

test('logs out by clearing the cookie', async () => {
  const { response, data } = await request('/auth/logout', { method: 'POST' });
  assert.equal(response.status, 200);
  assert.match(data.message, /signed out/i);

  const setCookie = response.headers.getSetCookie().join(';');
  assert.match(setCookie, /bugtrail_token=;/);
});
