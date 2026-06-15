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
    // API returns a paginated response: { items, total, page, pageSize }
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.items[0]).toHaveProperty('name');
  });
});
