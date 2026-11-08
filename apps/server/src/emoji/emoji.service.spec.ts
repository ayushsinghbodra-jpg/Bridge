import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { EmojiService } from './emoji.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { MembershipService } from '../common/membership.service';

describe('EmojiService', () => {
  let service: EmojiService;
  let mockPrisma: any;
  let mockAnalytics: any;
  let mockMembership: any;

  beforeEach(() => {
    mockPrisma = {
      member: { findUnique: jest.fn() },
      customEmoji: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    mockAnalytics = { track: jest.fn() };
    mockMembership = { assertMember: jest.fn() };

    service = new EmojiService(
      mockPrisma as unknown as PrismaService,
      mockAnalytics as unknown as AnalyticsService,
      mockMembership as unknown as MembershipService,
    );
  });

  describe('upload', () => {
    it('should upload custom emoji when requester is admin or owner', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'ADMIN' });
      mockPrisma.customEmoji.count.mockResolvedValue(5);
      mockPrisma.customEmoji.create.mockResolvedValue({
        id: 'emoji-1',
        serverId: 'srv-1',
        name: 'party_blob',
        imageUrl: 'https://example.com/blob.png',
        uploaderId: 'admin-user',
        createdAt: new Date(),
        uploader: { id: 'admin-user', username: 'admin', displayName: 'Admin', avatarUrl: null },
      });

      const emoji = await service.upload(
        'srv-1',
        { name: 'party_blob', imageUrl: 'https://example.com/blob.png' },
        'admin-user'
      );

      expect(emoji.id).toBe('emoji-1');
      expect(emoji.name).toBe('party_blob');
      expect(mockAnalytics.track).toHaveBeenCalledWith('custom_emoji_uploaded', expect.any(Object));
    });

    it('should reject invalid emoji names with uppercase or spaces', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'ADMIN' });

      await expect(
        service.upload('srv-1', { name: 'Party Blob!', imageUrl: 'https://example.com/blob.png' }, 'admin-user')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when server reaches custom emoji limit', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'OWNER' });
      mockPrisma.customEmoji.count.mockResolvedValue(50); // limit reached

      await expect(
        service.upload('srv-1', { name: 'blob', imageUrl: 'https://example.com/blob.png' }, 'owner-user')
      ).rejects.toThrow(ConflictException);
    });
  });
});
