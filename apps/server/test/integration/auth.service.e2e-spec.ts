import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import * as argon2 from 'argon2';
import { createTestApp } from '../utils/test-app';
import { testDb, clearTestDb } from '../utils/test-db';
import { AuthService } from '../../src/auth/auth.service';

describe('Auth Service Integration', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    app = await createTestApp();
    authService = app.get(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  it('should hash passwords and register a new user in the database', async () => {
    const registerDto = {
      username: 'integration_user',
      email: 'integration@example.com',
      password: 'SuperSecretPassword123!',
      displayName: 'Integration User',
    };

    const res = await authService.register(registerDto, {
      userAgent: 'JestIntegration',
      ip: '127.0.0.1',
    });

    expect(res.user.email).toBe(registerDto.email);
    expect(res.tokens.accessToken).toBeDefined();

    // Verify DB persisted record
    const userInDb = await testDb.user.findUnique({
      where: { email: registerDto.email },
    });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.username).toBe(registerDto.username);
    expect(userInDb?.password).not.toBe(registerDto.password);

    // Verify password is valid argon2 hash
    const isArgonValid = await argon2.verify(userInDb!.password, registerDto.password);
    expect(isArgonValid).toBe(true);

    // Verify session record persisted in DB
    const sessionInDb = await testDb.session.findUnique({
      where: { refreshToken: res.tokens.refreshToken },
    });
    expect(sessionInDb).not.toBeNull();
    expect(sessionInDb?.userId).toBe(userInDb!.id);
    expect(sessionInDb?.userAgent).toBe('JestIntegration');
  });

  it('should validate credentials and generate valid JWT sessions', async () => {
    const rawPassword = 'SecurePassword789!';
    const user = await testDb.user.create({
      data: {
        username: 'session_user',
        email: 'session@example.com',
        password: await argon2.hash(rawPassword),
        displayName: 'Session Tester',
      },
    });

    const loginRes = await authService.login({
      email: 'session@example.com',
      password: rawPassword,
    });

    expect(loginRes.user.id).toBe(user.id);
    expect(loginRes.tokens.accessToken).toBeDefined();

    // Verify session is active in database
    const session = await testDb.session.findUnique({
      where: { refreshToken: loginRes.tokens.refreshToken },
    });
    expect(session).not.toBeNull();
    expect(session?.userId).toBe(user.id);
  });

  it('should reject duplicate email registrations', async () => {
    const userDto = {
      username: 'first_user',
      email: 'duplicate@example.com',
      password: 'Password123!',
    };

    await authService.register(userDto);

    // Try registering with same email but different username
    await expect(
      authService.register({
        username: 'second_user',
        email: 'duplicate@example.com',
        password: 'Password123!',
      })
    ).rejects.toThrow();
  });
});
