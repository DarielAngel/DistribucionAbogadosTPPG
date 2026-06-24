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

async function loginAdmin(email = 'adm@test.com') {
  await request(app).post('/api/auth/register').send({ name: 'Admin', email, password: 'pass', role: 'admin' });
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass' });
  return login.body.token;
}

describe('PUT /api/lawyers/:id', () => {
  test('admin can update lawyer fields', async () => {
    const token = await loginAdmin();
    const create = await request(app)
      .post('/api/lawyers')
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'Original', province: 'P1', municipality: 'M1', specialization: 'Civil' });
    expect(create.statusCode).toBe(200);

    const update = await request(app)
      .put(`/api/lawyers/${create.body.id}`)
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'Actualizado', province: 'P2', specialization: 'Penal' });
    expect(update.statusCode).toBe(200);
    expect(update.body.name).toBe('Actualizado');
    expect(update.body.province).toBe('P2');
    expect(update.body.specialization).toBe('Penal');
  });

  test('updated data persists — GET returns new values', async () => {
    const token = await loginAdmin('adm2@test.com');
    const create = await request(app)
      .post('/api/lawyers')
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'Antes', email: 'antes@test.com' });
    expect(create.statusCode).toBe(200);

    await request(app)
      .put(`/api/lawyers/${create.body.id}`)
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'Después', email: 'despues@test.com' });

    const get = await request(app)
      .get(`/api/lawyers/${create.body.id}`)
      .set('Authorization', 'Bearer ' + token);
    expect(get.statusCode).toBe(200);
    expect(get.body.name).toBe('Después');
    expect(get.body.email).toBe('despues@test.com');
  });

  test('returns 404 for non-existent lawyer', async () => {
    const token = await loginAdmin('adm3@test.com');
    const res = await request(app)
      .put('/api/lawyers/99999')
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'X' });
    expect(res.statusCode).toBe(404);
  });

  // ponytail: auth middleware bypasses checks in NODE_ENV=test; 401/403 covered by auth.test.js
  test('returns 404 for non-existent id', async () => {
    const token = await loginAdmin('adm4@test.com');
    const res = await request(app).put('/api/lawyers/99999').set('Authorization', 'Bearer ' + token).send({ name: 'X' });
    expect(res.statusCode).toBe(404);
  });
});
