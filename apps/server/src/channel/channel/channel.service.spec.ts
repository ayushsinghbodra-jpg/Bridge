import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { AuditLogService } from '../../audit/audit.service';
import { MembershipService } from '../../common/membership.service';

describe('ChannelService', () => {
  let service: ChannelService;
  let mockPrisma: any;
  let mockAnalytics: any;
  let mockAudit: any;
  let mockMembership: any;

  beforeEach(() => {
    mockPrisma = {
      channel: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        aggregate: jest.fn(),
      },
      member: {
        findUnique: jest.fn(),
      },
    };

    mockAnalytics = { track: jest.fn() };
    mockAudit = { log: jest.fn() };
    mockMembership = { assertMember: jest.fn() };

    service = new ChannelService(
      mockPrisma as unknown as PrismaService,
      mockAnalytics as unknown as AnalyticsService,
      mockAudit as unknown as AuditLogService,
      mockMembership as unknown as MembershipService,
    );
  });

  describe('create', () => {
    it('should create channel when requester is admin or owner', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'ADMIN' });
      mockPrisma.channel.aggregate.mockResolvedValue({ _max: { position: 1 } });
      mockPrisma.channel.create.mockResolvedValue({
        id: 'ch-1',
        serverId: 'srv-1',
        name: 'announcements',
        topic: 'Important news',
        type: 'ANNOUNCEMENT',
        position: 2,
        createdAt: new Date(),
      });

      const channel = await service.create(
        'srv-1',
        { name: 'announcements', topic: 'Important news', type: 'announcements' },
        'admin-user'
      );

      expect(channel.name).toBe('announcements');
      expect(channel.type).toBe('announcements');
      expect(mockAnalytics.track).toHaveBeenCalledWith('channel_created', expect.any(Object));
      expect(mockAudit.log).toHaveBeenCalledWith('srv-1', 'admin-user', 'CHANNEL_CREATED', 'ch-1', expect.any(Object));
    });

    it('should reject creation if requester is a regular member', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'MEMBER' });

      await expect(
        service.create('srv-1', { name: 'rules', type: 'text' }, 'regular-user')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should allow admin/owner to delete channel', async () => {
      mockPrisma.channel.findUnique.mockResolvedValue({
        id: 'ch-1',
        serverId: 'srv-1',
        name: 'old-chat',
      });
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'OWNER' });
      mockPrisma.channel.delete.mockResolvedValue({});

      await service.delete('ch-1', 'owner-user');
      expect(mockPrisma.channel.delete).toHaveBeenCalledWith({ where: { id: 'ch-1' } });
      expect(mockAudit.log).toHaveBeenCalledWith('srv-1', 'owner-user', 'CHANNEL_DELETED', 'ch-1', expect.any(Object));
    });

    it('should throw NotFoundException if channel does not exist', async () => {
      mockPrisma.channel.findUnique.mockResolvedValue(null);

      await expect(service.delete('missing-ch', 'owner-user')).rejects.toThrow(NotFoundException);
    });
  });
});
