import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../utils/test-app';
import { clearTestDb } from '../utils/test-db';

describe('Auth Controller E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  it('should register a new user and reject duplicates', async () => {
    const registerPayload = {
      username: 'alice_reg',
      email: 'alice_reg@example.com',
      password: 'StrongP@ssw0rd123!',
      displayName: 'Alice In E2E',
    };

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerPayload)
      .expect(201);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe('alice_reg');
    expect(res.body.user.email).toBe('alice_reg@example.com');
    expect(res.body.tokens.accessToken).toBeDefined();
    expect(res.body.tokens.refreshToken).toBeDefined();

    // Duplicate email registration should fail with 409
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username: 'other_user_name',
        email: 'alice_reg@example.com',
        password: 'StrongP@ssw0rd123!',
      })
      .expect(409);
  });

  it('should login an existing user and reject invalid credentials', async () => {
    const userCredentials = {
      username: 'bob_login',
      email: 'bob_login@example.com',
      password: 'StrongP@ssw0rd123!',
      displayName: 'Bob The Tester',
    };

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(userCredentials)
      .expect(201);

    // Valid login
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: userCredentials.email,
        password: userCredentials.password,
      })
      .expect(200);

    expect(loginRes.body.tokens.accessToken).toBeDefined();
    expect(loginRes.body.user.email).toBe(userCredentials.email);

    // Invalid password
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: userCredentials.email,
        password: 'WrongPassword!',
      })
      .expect(401);

    // Non-existent email
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'Password123!',
      })
      .expect(401);
  });

  it('should refresh access token and validate /api/auth/me session', async () => {
    const user = {
      username: 'charlie_ref',
      email: 'charlie_ref@example.com',
      password: 'StrongP@ssw0rd123!',
      displayName: 'Charlie Tester',
    };

    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(user)
      .expect(201);

    const refreshToken = registerRes.body.tokens.refreshToken;
    const accessToken = registerRes.body.tokens.accessToken;

    // Verify /api/auth/me with access token
    const meRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meRes.body.email).toBe(user.email);

    // Reject without Bearer token
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(401);

    // Refresh token
    const refreshRes = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(refreshRes.body.accessToken).toBeDefined();
    expect(refreshRes.body.refreshToken).toBeDefined();

    // Verify refreshed token works with /api/auth/me
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${refreshRes.body.accessToken}`)
      .expect(200);
  });
});
