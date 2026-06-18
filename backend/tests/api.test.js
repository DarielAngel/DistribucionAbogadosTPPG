const request = require('supertest');
const { sequelize } = require('../src/models');
const appModule = require('../src/index');
const app = appModule.app;
const { Lawyer } = require('../src/models');

beforeAll(async () => {
  // ensure test DB is fresh
  await sequelize.sync({ force: true });
  // seed some lawyers for search tests
  await Lawyer.create({ name: 'María', province: 'P1', municipality: 'M1', specialization: 'Civil' });
  await Lawyer.create({ name: 'Ana García', province: 'P2', municipality: 'M2', specialization: 'Penal' });
  await Lawyer.create({ name: 'Pedro', province: 'ProvinciaX', municipality: 'VillaSur', specialization: 'Laboral' });
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

  test('GET /api/lawyers?name=Mar returns partial name matches', async () => {
    const res = await request(app).get('/api/lawyers?name=Mar');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.items.some(i => /Mar/i.test(i.name))).toBe(true);
  });

  test('GET /api/lawyers?name=Villa returns partial municipality/province matches', async () => {
    const res = await request(app).get('/api/lawyers?name=Villa');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.items.some(i => /Villa/i.test(i.municipality) || /Provincia/i.test(i.province))).toBe(true);
  });
});
