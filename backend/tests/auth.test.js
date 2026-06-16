const request = require('supertest');
const { sequelize, User } = require('../src/models');
const appModule = require('../src/index');
const app = appModule.app;
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config/config');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth roles', () => {
  test('register without role defaults to client', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Client', email: 'client@example.com', password: 'password' });
    expect(res.statusCode).toBe(201);
    expect(res.body.role).toBe('client');
    const dbUser = await User.findOne({ where: { email: 'client@example.com' } });
    expect(dbUser.role).toBe('client');
  });

  test('register admin and login returns token with admin role', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin2@example.com', password: 'password', role: 'admin' });
    expect(reg.statusCode).toBe(201);
    expect(reg.body.role).toBe('admin');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin2@example.com', password: 'password' });
    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty('token');
    const payload = jwt.verify(login.body.token, jwtSecret);
    expect(payload.role).toBe('admin');
    expect(payload).toHaveProperty('id');
  });
});
