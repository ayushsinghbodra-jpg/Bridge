import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReactionService } from './reaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { MembershipService } from '../common/membership.service';

describe('ReactionService', () => {
  let service: ReactionService;
  let mockPrisma: any;
  let mockAnalytics: any;
  let mockMembership: any;

  beforeEach(() => {
    mockPrisma = {
      message: { findUnique: jest.fn() },
      reaction: {
        groupBy: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    };

    mockAnalytics = { track: jest.fn() };
    mockMembership = { assertMemberForChannel: jest.fn() };

    service = new ReactionService(
      mockPrisma as unknown as PrismaService,
      mockAnalytics as unknown as AnalyticsService,
      mockMembership as unknown as MembershipService,
    );
  });

  describe('addReaction', () => {
    it('should add reaction to message when emoji is valid and user is member', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({ id: 'msg-1', channelId: 'ch-1' });
      mockPrisma.reaction.groupBy.mockResolvedValue([]);
      mockPrisma.reaction.create.mockResolvedValue({
        id: 'rx-1',
        messageId: 'msg-1',
        userId: 'u-1',
        emoji: '👍',
        user: { id: 'u-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
      });

      const res = await service.addReaction('msg-1', 'u-1', '👍');
      expect(res.emoji).toBe('👍');
      expect(res.channelId).toBe('ch-1');
      expect(mockAnalytics.track).toHaveBeenCalledWith('reaction_added', expect.any(Object));
    });

    it('should reject invalid non-emoji text', async () => {
      await expect(service.addReaction('msg-1', 'u-1', 'not_an_emoji')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should reject when message is not found', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(null);

      await expect(service.addReaction('missing-msg', 'u-1', '🔥')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ConflictException if duplicate reaction is added', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({ id: 'msg-1', channelId: 'ch-1' });
      mockPrisma.reaction.groupBy.mockResolvedValue([{ emoji: '🔥' }]);
      mockPrisma.reaction.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Duplicate', {
          code: 'P2002',
          clientVersion: '5.22.0',
        })
      );

      await expect(service.addReaction('msg-1', 'u-1', '🔥')).rejects.toThrow(ConflictException);
    });
  });

  describe('removeReaction', () => {
    it('should remove existing reaction', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({ id: 'msg-1', channelId: 'ch-1' });
      mockPrisma.reaction.delete.mockResolvedValue({});

      await service.removeReaction('msg-1', 'u-1', '👍');
      expect(mockPrisma.reaction.delete).toHaveBeenCalled();
    });
  });
});
