require('dotenv').config({ path: __dirname + '/../.env' });
const http = require('http');
const app = require('../index');

const PORT = 5001; // Temporary port for automated test run
let server;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Backend Route Tests...\n');
  server = app.listen(PORT);

  // Give DB time to connect if needed
  await new Promise(r => setTimeout(r, 1500));

  let passed = 0;
  let failed = 0;

  async function assertRoute(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message || err);
      failed++;
    }
  }

  // 1. Health checks
  await assertRoute('GET /health (health endpoint)', async () => {
    const res = await request('GET', '/health');
    if (res.status !== 200 || res.data.status !== 'ok') throw new Error(`Unexpected response: ${res.status}`);
  });

  await assertRoute('GET /api/health (prefixed health endpoint)', async () => {
    const res = await request('GET', '/api/health');
    if (res.status !== 200 || res.data.status !== 'ok') throw new Error(`Unexpected response: ${res.status}`);
  });

  // 2. CORS Preflight OPTIONS check
  await assertRoute('OPTIONS /auth/login (CORS preflight)', async () => {
    const res = await request('OPTIONS', '/auth/login');
    if (res.status !== 204 && res.status !== 200) throw new Error(`Preflight status: ${res.status}`);
  });

  // 3. Auth Routes — Register
  const testEmail = `test_${Date.now()}@example.com`;
  let userToken = null;
  let createdStoryId = null;

  await assertRoute('POST /auth/register (Register User)', async () => {
    const res = await request('POST', '/auth/register', {
      name: 'Test Explorer',
      email: testEmail,
      password: 'Password123!',

    });
    if (res.status !== 201 || !res.data.token) throw new Error(`Registration failed: ${JSON.stringify(res.data)}`);
    userToken = res.data.token;
  });

  // 4. Auth Routes — Login
  await assertRoute('POST /auth/login (Login User)', async () => {
    const res = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'Password123!',

    });
    if (res.status !== 200 || !res.data.token) throw new Error(`Login failed: ${JSON.stringify(res.data)}`);
  });

  // 5. Auth Routes — Guest Login
  await assertRoute('POST /auth/guest (Guest Login)', async () => {
    const res = await request('POST', '/auth/guest');
    if (res.status !== 200 || !res.data.token) throw new Error(`Guest login failed: ${JSON.stringify(res.data)}`);
  });

  // 6. Auth Routes — Profile /me
  await assertRoute('GET /auth/me (Protected User Profile)', async () => {
    const res = await request('GET', '/auth/me', null, userToken);
    if (res.status !== 200 || !res.data.user) throw new Error(`Profile fetch failed: ${JSON.stringify(res.data)}`);
  });

  // 7. Stories Routes — Get All Stories
  await assertRoute('GET /stories (Fetch Stories List)', async () => {
    const res = await request('GET', '/stories');
    if (res.status !== 200 || !Array.isArray(res.data.stories)) throw new Error(`Fetch stories failed: ${JSON.stringify(res.data)}`);
  });

  // 8. Stories Routes — Create Story
  await assertRoute('POST /stories (Create New Story)', async () => {
    const res = await request('POST', '/stories', {
      title: 'Automated Test Adventure',
      fromPlace: 'San Francisco, CA',
      place: 'Yosemite Valley, CA',
      tripStartDate: '2026-05-01',
      tripEndDate: '2026-05-05',
      description: 'An epic hiking trip through Yosemite National Park.',
      activities: [
        { activityName: 'Hike to Vernal Falls', cost: '15' },
        { activityName: 'Campground Stay', cost: '35' }
      ]
    }, userToken);

    if (res.status !== 201 || !res.data.story?._id) throw new Error(`Create story failed: ${JSON.stringify(res.data)}`);
    createdStoryId = res.data.story._id;
  });

  // 9. Stories Routes — Get Single Story
  await assertRoute('GET /stories/:id (Fetch Single Story)', async () => {
    const res = await request('GET', `/stories/${createdStoryId}`);
    if (res.status !== 200 || res.data.story?._id !== createdStoryId) throw new Error(`Fetch single story failed: ${JSON.stringify(res.data)}`);
  });

  // 10. Stories Routes — Toggle Like
  await assertRoute('PATCH /stories/:id/like (Toggle Story Like)', async () => {
    const res = await request('PATCH', `/stories/${createdStoryId}/like`, null, userToken);
    if (res.status !== 200 || typeof res.data.likes !== 'number') throw new Error(`Like story failed: ${JSON.stringify(res.data)}`);
  });

  // 11. Stories Routes — Update Story
  await assertRoute('PUT /stories/:id (Update Story)', async () => {
    const res = await request('PUT', `/stories/${createdStoryId}`, {
      title: 'Updated Test Adventure',
      fromPlace: 'San Francisco, CA',
      place: 'Yosemite Valley, CA',
      tripStartDate: '2026-05-01',
      tripEndDate: '2026-05-06',
      description: 'Updated narrative details for Yosemite trip.',
      activities: [{ activityName: 'Summit Glacier Point', cost: '0' }]
    }, userToken);

    if (res.status !== 200 || res.data.story?.title !== 'Updated Test Adventure') throw new Error(`Update story failed: ${JSON.stringify(res.data)}`);
  });

  // 12. Stories Routes — Delete Story
  await assertRoute('DELETE /stories/:id (Delete Story)', async () => {
    const res = await request('DELETE', `/stories/${createdStoryId}`, null, userToken);
    if (res.status !== 200 || !res.data.success) throw new Error(`Delete story failed: ${JSON.stringify(res.data)}`);
  });

  // 13. 404 Route handling
  await assertRoute('GET /invalid-route-name (404 Fallback)', async () => {
    const res = await request('GET', '/invalid-route-name');
    if (res.status !== 404) throw new Error(`Expected 404 but got ${res.status}`);
  });

  console.log(`\n📊 Test Results: ${passed} Passed, ${failed} Failed out of ${passed + failed} Tests.`);
  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  if (server) server.close();
  process.exit(1);
});
