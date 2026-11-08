import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { MemberService } from './member.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AuditLogService } from '../audit/audit.service';
import { MembershipService } from '../common/membership.service';

describe('MemberService', () => {
  let service: MemberService;
  let mockPrisma: any;
  let mockAnalytics: any;
  let mockAudit: any;
  let mockMembership: any;

  beforeEach(() => {
    mockPrisma = {
      server: { findUnique: jest.fn() },
      member: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockAnalytics = { track: jest.fn() };
    mockAudit = { log: jest.fn() };
    mockMembership = { assertMember: jest.fn() };

    service = new MemberService(
      mockPrisma as unknown as PrismaService,
      mockAnalytics as unknown as AnalyticsService,
      mockAudit as unknown as AuditLogService,
      mockMembership as unknown as MembershipService,
    );
  });

  describe('join', () => {
    it('should join server and return member with role MEMBER', async () => {
      mockPrisma.server.findUnique.mockResolvedValue({ id: 'srv-1' });
      mockPrisma.member.findUnique.mockResolvedValue(null);
      mockPrisma.member.create.mockResolvedValue({
        id: 'mem-1',
        serverId: 'srv-1',
        userId: 'u-1',
        role: 'MEMBER',
        nickname: null,
        joinedAt: new Date(),
        user: { id: 'u-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
      });

      const member = await service.join('srv-1', 'u-1');

      expect(member.role).toBe('MEMBER');
      expect(mockAnalytics.track).toHaveBeenCalledWith('member_joined', expect.any(Object));
      expect(mockAudit.log).toHaveBeenCalledWith('srv-1', 'u-1', 'MEMBER_JOINED', 'u-1', expect.any(Object));
    });

    it('should reject joining if user is already a member', async () => {
      mockPrisma.server.findUnique.mockResolvedValue({ id: 'srv-1' });
      mockPrisma.member.findUnique.mockResolvedValue({ id: 'existing-mem' });

      await expect(service.join('srv-1', 'u-1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if server does not exist', async () => {
      mockPrisma.server.findUnique.mockResolvedValue(null);

      await expect(service.join('nonexistent', 'u-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('leave', () => {
    it('should allow regular members to leave', async () => {
      mockPrisma.server.findUnique.mockResolvedValue({ id: 'srv-1', ownerId: 'other-owner' });
      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'mem-1',
        serverId: 'srv-1',
        userId: 'u-1',
        role: 'MEMBER',
        user: { id: 'u-1', username: 'alice' },
      });
      mockPrisma.member.delete.mockResolvedValue({});

      await service.leave('srv-1', 'u-1');
      expect(mockPrisma.member.delete).toHaveBeenCalled();
      expect(mockAnalytics.track).toHaveBeenCalledWith('member_left', expect.any(Object));
    });

    it('should prevent server owners from leaving without transferring ownership', async () => {
      mockPrisma.server.findUnique.mockResolvedValue({ id: 'srv-1', ownerId: 'owner-id' });
      mockPrisma.member.findUnique.mockResolvedValue({
        id: 'mem-1',
        serverId: 'srv-1',
        userId: 'owner-id',
        role: 'OWNER',
        user: { id: 'owner-id', username: 'boss' },
      });

      await expect(service.leave('srv-1', 'owner-id')).rejects.toThrow(ForbiddenException);
    });
  });
});
