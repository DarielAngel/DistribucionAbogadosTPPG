const request = require('supertest');
const { sequelize } = require('../src/models');
const appModule = require('../src/index');
const app = appModule.app;

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Schedules and lawyer lifecycle', () => {
  test('POST /api/schedules creates entries for a date range and links to lawyer', async () => {
    // register admin and login
    const reg = await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin@example.com', password: 'password', role: 'admin' });
    expect(reg.statusCode).toBe(201);
    const login = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password' });
    expect(login.statusCode).toBe(200);
    const token = login.body.token;

    // create lawyer
    const lawRes = await request(app)
      .post('/api/lawyers')
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'Test Lawyer', email: 'tl@example.com', province: 'P', municipality: 'M' });
    expect(lawRes.statusCode).toBe(200);
    const lawyer = lawRes.body;

    // create schedule range
    const startDate = '2026-06-20';
    const endDate = '2026-06-22';
    const schRes = await request(app)
      .post('/api/schedules')
      .set('Authorization', 'Bearer ' + token)
      .send({ type: 'task', lawyerId: lawyer.id, description: 'Range task', startDate, endDate });
    expect(schRes.statusCode).toBe(201);
    expect(Array.isArray(schRes.body)).toBe(true);
    expect(schRes.body.length).toBe(3);
    const dates = schRes.body.map(s => s.date).sort();
    expect(dates).toEqual([startDate, '2026-06-21', endDate].sort());
  });

  test('DELETE /api/lawyers/:id removes lawyer and its schedules', async () => {
    // register admin and login
    const reg = await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin2@example.com', password: 'password', role: 'admin' });
    expect(reg.statusCode).toBe(201);
    const login = await request(app).post('/api/auth/login').send({ email: 'admin2@example.com', password: 'password' });
    const token = login.body.token;

    // create lawyer
    const lawRes = await request(app)
      .post('/api/lawyers')
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'ToDelete', email: 'del@example.com' });
    expect(lawRes.statusCode).toBe(200);
    const lawyer = lawRes.body;

    // create a schedule for that lawyer
    const schRes = await request(app)
      .post('/api/schedules')
      .set('Authorization', 'Bearer ' + token)
      .send({ type: 'task', lawyerId: lawyer.id, description: 'Will be removed', date: '2026-06-25' });
    // single-date creates object with status 201
    expect([200,201]).toContain(schRes.statusCode);

    // ensure schedule exists
    const getRes = await request(app).get(`/api/schedules?lawyerId=${lawyer.id}`).set('Authorization', 'Bearer ' + token);
    expect(getRes.statusCode).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBeGreaterThanOrEqual(1);

    // delete lawyer
    const delRes = await request(app).delete(`/api/lawyers/${lawyer.id}`).set('Authorization', 'Bearer ' + token);
    expect(delRes.statusCode).toBe(200);

    // schedules for lawyer should be gone
    const getRes2 = await request(app).get(`/api/schedules?lawyerId=${lawyer.id}`).set('Authorization', 'Bearer ' + token);
    expect(getRes2.statusCode).toBe(200);
    expect(Array.isArray(getRes2.body)).toBe(true);
    expect(getRes2.body.length).toBe(0);
  });
});
