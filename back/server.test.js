/* eslint-env jest */
const request = require('supertest');
const app = require('./server');

describe('POST /login', () => {
  it('should return 400 if credentials are missing', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Faltan credenciales');
  });
}); 