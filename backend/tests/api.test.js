const request = require('supertest');
const { sequelize } = require('../src/models');
const appModule = require('../src/index');
const app = appModule.app;
const { Lawyer } = require('../src/models');

beforeAll(async () => {
  // ensure test DB is fresh
  await sequelize.sync({ force: true });
  // seed one lawyer
  await Lawyer.create({ name: 'Test Lawyer', specialty: 'Civil' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('API basic', () => {
  test('GET /api/lawyers returns list', async () => {
    const res = await request(app).get('/api/lawyers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('name');
  });
});
