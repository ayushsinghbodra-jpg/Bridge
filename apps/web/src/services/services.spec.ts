import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from './storage/authStorage';
import * as authService from './api/auth.service';
import { api, ApiError } from '@/lib/api';

describe('Frontend Services and Storage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('authStorage', () => {
    it('should save, retrieve and clear tokens in localStorage', () => {
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();

      saveTokens('access-token-123', 'refresh-token-456');

      expect(getAccessToken()).toBe('access-token-123');
      expect(getRefreshToken()).toBe('refresh-token-456');

      clearTokens();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('auth.service', () => {
    it('should register user and store tokens in localStorage', async () => {
      const mockAuthResponse = {
        user: {
          id: 'u-1',
          username: 'alice',
          email: 'alice@example.com',
          displayName: 'Alice',
          avatarUrl: null,
          createdAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 900,
        },
      };

      jest.spyOn(api, 'post').mockImplementation((() => Promise.resolve(mockAuthResponse)) as any);

      const res = await authService.register({
        username: 'alice',
        email: 'alice@example.com',
        password: 'Password123!',
      });

      expect(res.user.username).toBe('alice');
      expect(getAccessToken()).toBe('new-access-token');
      expect(getRefreshToken()).toBe('new-refresh-token');
    });

    it('should clear tokens on logout', async () => {
      saveTokens('existing-access', 'existing-refresh');
      jest.spyOn(api, 'post').mockImplementation((() => Promise.resolve({})) as any);

      await authService.logout();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('api client error handling', () => {
    it('should throw ApiError with status and message when fetch fails', async () => {
      const mockFetch = jest.fn<any>().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Validation error', errors: [{ field: 'name', message: 'Required' }] }),
      });
      global.fetch = mockFetch as any;

      await expect(api.get('/test-error')).rejects.toThrow(ApiError);
    });
  });
});
