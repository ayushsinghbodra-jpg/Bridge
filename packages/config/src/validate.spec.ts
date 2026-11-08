import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  validateEnv,
  serverEnvSchema,
  webEnvSchema,
  workerEnvSchema,
  sharedEnvSchema,
} from './index';

describe('Validate Env Variables', () => {
  describe('validateEnv utility', () => {
    it('should parse valid environment variables according to schema', () => {
      const schema = z.object({
        PORT: z.number().int().positive(),
        API_KEY: z.string().min(5),
      });
      const result = validateEnv(schema, { PORT: 3000, API_KEY: 'abcde' });
      expect(result).toEqual({ PORT: 3000, API_KEY: 'abcde' });
    });

    it('should throw an error with detailed messages when environment variables are invalid', () => {
      const schema = z.object({
        PORT: z.number().int().positive(),
        API_KEY: z.string().min(5),
      });
      expect(() => validateEnv(schema, { PORT: -1, API_KEY: 'abc' })).toThrow(
        'Environment validation failed'
      );
    });
  });

  describe('sharedEnvSchema', () => {
    it('should accept valid NODE_ENV values and default to development', () => {
      expect(sharedEnvSchema.parse({})).toEqual({ NODE_ENV: 'development' });
      expect(sharedEnvSchema.parse({ NODE_ENV: 'test' })).toEqual({ NODE_ENV: 'test' });
      expect(sharedEnvSchema.parse({ NODE_ENV: 'production' })).toEqual({
        NODE_ENV: 'production',
      });
    });

    it('should reject invalid NODE_ENV values', () => {
      expect(sharedEnvSchema.safeParse({ NODE_ENV: 'staging' }).success).toBe(false);
    });
  });

  describe('serverEnvSchema', () => {
    const validServerEnv = {
      DATABASE_URL: 'postgresql://bridge:password@localhost:5432/bridge',
      JWT_SECRET: 'jwt-super-secret-key',
      JWT_REFRESH_SECRET: 'a-very-long-refresh-secret-that-has-at-least-32-characters',
    };

    it('should parse valid server configuration and apply defaults', () => {
      const parsed = serverEnvSchema.parse(validServerEnv);
      expect(parsed.PORT).toBe(3000);
      expect(parsed.NODE_ENV).toBe('development');
      expect(parsed.JWT_ACESS_EXPRESS_IN).toBe('15m');
      expect(parsed.JWT_REFRESH_EXPIRES_IN).toBe('7d');
    });

    it('should coerce string PORT to number', () => {
      const parsed = serverEnvSchema.parse({
        ...validServerEnv,
        PORT: '8080',
      });
      expect(parsed.PORT).toBe(8080);
    });

    it('should reject when JWT_REFRESH_SECRET is shorter than 32 characters', () => {
      const result = serverEnvSchema.safeParse({
        ...validServerEnv,
        JWT_REFRESH_SECRET: 'short-secret',
      });
      expect(result.success).toBe(false);
    });

    it('should reject when required DATABASE_URL is missing', () => {
      const { DATABASE_URL, ...missingDb } = validServerEnv;
      expect(serverEnvSchema.safeParse(missingDb).success).toBe(false);
    });
  });

  describe('webEnvSchema', () => {
    it('should validate valid web URLs', () => {
      const validWeb = {
        NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
        NEXT_PUBLIC_WS_URL: 'http://localhost:3000',
      };
      const parsed = webEnvSchema.parse(validWeb);
      expect(parsed.NEXT_PUBLIC_API_URL).toBe('http://localhost:3000/api');
    });

    it('should reject invalid non-URL values', () => {
      const invalidWeb = {
        NEXT_PUBLIC_API_URL: 'not-a-valid-url',
        NEXT_PUBLIC_WS_URL: 'http://localhost:3000',
      };
      expect(webEnvSchema.safeParse(invalidWeb).success).toBe(false);
    });
  });

  describe('workerEnvSchema', () => {
    it('should validate worker configuration', () => {
      const validWorker = {
        REDIS_URL: 'redis://localhost:6379',
        QUEUE_NAME: 'email-notifications',
      };
      const parsed = workerEnvSchema.parse(validWorker);
      expect(parsed.QUEUE_NAME).toBe('email-notifications');
    });

    it('should reject invalid REDIS_URL', () => {
      const invalidWorker = {
        REDIS_URL: 'invalid-redis',
        QUEUE_NAME: 'test',
      };
      expect(workerEnvSchema.safeParse(invalidWorker).success).toBe(false);
    });
  });
});
