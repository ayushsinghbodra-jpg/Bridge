import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockPrisma: any;
  let mockConfig: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    mockConfig = {
      getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
    };

    strategy = new JwtStrategy(
      mockConfig as unknown as ConfigService,
      mockPrisma as unknown as PrismaService,
    );
  });

  it('should validate and return user for valid token payload', async () => {
    const user = {
      id: 'user-1',
      username: 'alice',
      email: 'alice@example.com',
      displayName: 'Alice',
      avatarUrl: null,
    };
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const result = await strategy.validate({ sub: 'user-1', iat: 1000, exp: 2000 });
    expect(result).toEqual(user);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
      },
    });
  });

  it('should throw UnauthorizedException if user no longer exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'deleted-user-id', iat: 1000, exp: 2000 })
    ).rejects.toThrow(UnauthorizedException);
  });
});
