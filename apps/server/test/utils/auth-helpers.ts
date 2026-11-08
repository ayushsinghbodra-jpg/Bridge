import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import * as argon2 from 'argon2';
import { testDb } from './test-db';

export interface TestUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  token: string;
  refreshToken: string;
}

let userCounter = 0;

export async function createTestUserDirect(overrides: Partial<{ email: string; username: string; password: string; displayName: string }> = {}): Promise<{ id: string; email: string; username: string; displayName: string }> {
  userCounter++;
  const username = overrides.username || `testuser_${Date.now()}_${userCounter}`;
  const email = overrides.email || `test_${Date.now()}_${userCounter}@example.com`;
  const password = overrides.password || 'SecureP@ssw0rd!';
  const displayName = overrides.displayName || username;

  const hashedPassword = await argon2.hash(password);

  const user = await testDb.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      displayName,
    },
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName || user.username,
  };
}

export async function registerAndLoginUser(
  app: INestApplication,
  overrides: Partial<{ email: string; username: string; password: string; displayName: string }> = {}
): Promise<TestUser> {
  userCounter++;
  const username = overrides.username || `user_${Date.now()}_${userCounter}`;
  const email = overrides.email || `user_${Date.now()}_${userCounter}@example.com`;
  const password = overrides.password || 'StrongP@ss1234';
  const displayName = overrides.displayName || `Test User ${userCounter}`;

  const res = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({
      username,
      email,
      password,
      displayName,
    })
    .expect(201);

  return {
    id: res.body.user.id,
    email: res.body.user.email,
    username: res.body.user.username,
    displayName: res.body.user.displayName,
    token: res.body.tokens.accessToken,
    refreshToken: res.body.tokens.refreshToken,
  };
}
