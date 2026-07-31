const request = require('supertest');
const app = require('./index');

test('GET / returns ok status', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('ok');
});
