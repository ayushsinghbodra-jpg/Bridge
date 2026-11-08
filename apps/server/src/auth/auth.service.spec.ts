import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockJwt: any;
  let mockConfig: any;
  let mockSession: any;
  let mockAnalytics: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      session: {
        deleteMany: (jest.fn() as any).mockResolvedValue({ count: 1 }),
      },
      passwordResetToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((promises: any[]) => Promise.all(promises)),
    };

    mockJwt = {
      sign: jest.fn().mockImplementation((payload: any) => `signed_token_${payload.sub}`),
      signAsync: jest.fn().mockImplementation((payload: any) => Promise.resolve(`signed_token_${payload.sub}`)),
    };

    mockConfig = {
      get: jest.fn((key: string, fallback?: any) => {
        if (key === 'JWT_SECRET') return 'test-jwt-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret-32-chars-long';
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return fallback;
      }),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-jwt-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret-32-chars-long';
        return 'mock-value';
      }),
    };

    mockSession = {
      create: (jest.fn() as any).mockResolvedValue({ id: 'sess-1' }),
      findByToken: jest.fn() as any,
      rotate: (jest.fn() as any).mockResolvedValue({ id: 'sess-1' }),
      revoke: (jest.fn() as any).mockResolvedValue(undefined),
      revokeAllForUser: (jest.fn() as any).mockResolvedValue(undefined),
    };

    mockAnalytics = {
      track: jest.fn(),
    };

    authService = new AuthService(
      mockPrisma as unknown as PrismaService,
      mockJwt as unknown as JwtService,
      mockConfig as unknown as ConfigService,
      mockSession as unknown as SessionService,
      mockAnalytics as unknown as AnalyticsService,
    );
  });

  describe('register', () => {
    const registerDto = {
      username: 'alice',
      email: 'alice@example.com',
      password: 'SecurePassword123!',
      displayName: 'Alice In Wonderland',
    };

    it('should successfully register a new user and return auth tokens', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        username: registerDto.username,
        email: registerDto.email,
        displayName: registerDto.displayName,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.register(registerDto);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: registerDto.email }, { username: registerDto.username }] },
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockSession.create).toHaveBeenCalledWith('user-1', expect.any(String), expect.any(Object));
      expect(mockAnalytics.track).toHaveBeenCalledWith('user_registered', expect.objectContaining({ userId: 'user-1' }));
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe(registerDto.email);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw ConflictException if email is already taken', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-id',
        email: registerDto.email,
        username: 'other',
      });

      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if username is already taken', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-id',
        email: 'other@example.com',
        username: registerDto.username,
      });

      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'alice@example.com',
      password: 'SecurePassword123!',
    };

    it('should successfully login user with correct credentials', async () => {
      const hashedPassword = await argon2.hash(loginDto.password);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        username: 'alice',
        email: loginDto.email,
        password: hashedPassword,
        displayName: 'Alice',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.login(loginDto);

      expect(result.user.id).toBe('user-1');
      expect(result.tokens.accessToken).toBeDefined();
      expect(mockAnalytics.track).toHaveBeenCalledWith('user_logged_in', expect.objectContaining({ userId: 'user-1' }));
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAnalytics.track).toHaveBeenCalledWith('login_failed', expect.any(Object));
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const wrongHash = await argon2.hash('DifferentPassword123!');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        password: wrongHash,
      });

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should issue new tokens if refresh token is valid and not expired', async () => {
      mockSession.findByToken.mockResolvedValue({
        id: 'sess-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 100000),
      });

      const tokens = await authService.refresh('valid-refresh-token');

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(mockSession.rotate).toHaveBeenCalledWith('sess-1', expect.any(String));
    });

    it('should throw UnauthorizedException if session is expired or not found', async () => {
      mockSession.findByToken.mockResolvedValue(null);

      await expect(authService.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);

      mockSession.findByToken.mockResolvedValue({
        id: 'sess-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 5000), // expired
      });

      await expect(authService.refresh('expired-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout and revoke', () => {
    it('should revoke session on logout', async () => {
      await authService.logout('test-refresh-token');
      expect(mockSession.revoke).toHaveBeenCalledWith('test-refresh-token');
    });

    it('should revoke all sessions on logoutAll', async () => {
      await authService.logoutAll('user-1');
      expect(mockSession.revokeAllForUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('password reset', () => {
    it('should handle requestPasswordReset for existing and non-existing email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const res1 = await authService.requestPasswordReset('nonexistent@example.com');
      expect(res1.message).toContain('reset link has been sent');

      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'alice@example.com' });
      mockPrisma.passwordResetToken.create.mockResolvedValue({ id: 'token-1' });

      const res2 = await authService.requestPasswordReset('alice@example.com');
      expect(res2.message).toContain('reset link has been sent');
      expect(mockPrisma.passwordResetToken.create).toHaveBeenCalled();
    });

    it('should reset password with valid token', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'tok-1',
        userId: 'user-1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 3600000),
      });

      const res = await authService.resetPassword('valid-tok', 'NewPassword123!');
      expect(res.message).toBe('Password has been reset. Please log in again.');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for expired or already used token', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'tok-1',
        userId: 'user-1',
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      });

      await expect(authService.resetPassword('used-tok', 'NewPassword123!')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProfile', () => {
    it('should update and return updated user profile', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-1',
        username: 'alice',
        email: 'alice@example.com',
        displayName: 'Alice Updated',
        avatarUrl: 'https://example.com/avatar.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updated = await authService.updateProfile('user-1', {
        displayName: 'Alice Updated',
        avatarUrl: 'https://example.com/avatar.png',
      });

      expect(updated.displayName).toBe('Alice Updated');
      expect(updated.avatarUrl).toBe('https://example.com/avatar.png');
    });
  });
});
