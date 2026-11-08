import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PinningService } from './pinning.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { MembershipService } from '../common/membership.service';

describe('PinningService', () => {
  let service: PinningService;
  let mockPrisma: any;
  let mockAnalytics: any;
  let mockMembership: any;

  beforeEach(() => {
    mockPrisma = {
      message: { findUnique: jest.fn() },
      member: { findUnique: jest.fn() },
      pinnedMessage: {
        count: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    };

    mockAnalytics = { track: jest.fn() };
    mockMembership = { assertMemberForChannel: jest.fn() };

    service = new PinningService(
      mockPrisma as unknown as PrismaService,
      mockAnalytics as unknown as AnalyticsService,
      mockMembership as unknown as MembershipService,
    );
  });

  describe('pin', () => {
    it('should pin message when requester is moderator and message is valid', async () => {
      mockMembership.assertMemberForChannel.mockResolvedValue('srv-1');
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'MODERATOR' });
      mockPrisma.message.findUnique.mockResolvedValue({ id: 'msg-1', channelId: 'ch-1', deleted: false });
      mockPrisma.pinnedMessage.count.mockResolvedValue(2);
      mockPrisma.pinnedMessage.create.mockResolvedValue({
        id: 'pin-1',
        channelId: 'ch-1',
        messageId: 'msg-1',
        pinnedById: 'u-mod',
        createdAt: new Date(),
        message: {
          id: 'msg-1',
          content: 'Important pin',
          createdAt: new Date(),
          author: { id: 'u-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
        },
        pinnedBy: { id: 'u-mod', username: 'mod', displayName: 'Mod', avatarUrl: null },
      });

      const pin = await service.pin('ch-1', 'msg-1', 'u-mod');
      expect(pin.id).toBe('pin-1');
      expect(mockAnalytics.track).toHaveBeenCalledWith('message_pinned', expect.any(Object));
    });

    it('should prevent regular members from pinning messages', async () => {
      mockMembership.assertMemberForChannel.mockResolvedValue('srv-1');
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'MEMBER' });

      await expect(service.pin('ch-1', 'msg-1', 'regular-user')).rejects.toThrow(ForbiddenException);
    });

    it('should reject pinning a deleted message', async () => {
      mockMembership.assertMemberForChannel.mockResolvedValue('srv-1');
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'ADMIN' });
      mockPrisma.message.findUnique.mockResolvedValue({ id: 'msg-1', channelId: 'ch-1', deleted: true });

      await expect(service.pin('ch-1', 'msg-1', 'admin-user')).rejects.toThrow(BadRequestException);
    });
  });
});
