import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { ServerService } from './server.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AuditLogService } from '../audit/audit.service';

describe('ServerService', () => {
  let service: ServerService;
  let mockPrisma: any;
  let mockAnalytics: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      server: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      member: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((promises: any[]) => Promise.all(promises)),
    };

    mockAnalytics = {
      track: jest.fn(),
    };

    mockAudit = {
      log: jest.fn(),
    };

    service = new ServerService(
      mockPrisma as unknown as PrismaService,
      mockAnalytics as unknown as AnalyticsService,
      mockAudit as unknown as AuditLogService,
    );
  });

  describe('create', () => {
    it('should create server with slug, default channel and owner membership', async () => {
      mockPrisma.server.findUnique.mockResolvedValue(null);
      mockPrisma.server.create.mockResolvedValue({
        id: 'srv-1',
        name: 'Gaming Lounge',
        slug: 'gaming-lounge',
        description: 'Hangout spot',
        iconUrl: null,
        bannerUrl: null,
        visibility: 'PRIVATE',
        ownerId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { members: 1 },
      });

      const result = await service.create(
        { name: 'Gaming Lounge', description: 'Hangout spot', visibility: 'private' },
        'user-1'
      );

      expect(mockPrisma.server.create).toHaveBeenCalled();
      expect(mockAnalytics.track).toHaveBeenCalledWith('server_created', expect.any(Object));
      expect(mockAudit.log).toHaveBeenCalledWith('srv-1', 'user-1', 'SERVER_CREATED', 'srv-1', expect.any(Object));
      expect(result.id).toBe('srv-1');
      expect(result.memberCount).toBe(1);
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockPrisma.server.findUnique.mockResolvedValue({ id: 'existing-srv' });

      await expect(
        service.create({ name: 'Duplicate Server', visibility: 'private' }, 'user-1')
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById and findBySlug', () => {
    it('should find server by id or throw NotFoundException', async () => {
      mockPrisma.server.findUnique.mockResolvedValue({
        id: 'srv-1',
        name: 'Test',
        slug: 'test',
        description: null,
        iconUrl: null,
        bannerUrl: null,
        visibility: 'PUBLIC',
        ownerId: 'u-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { members: 5 },
      });

      const res = await service.findById('srv-1');
      expect(res.id).toBe('srv-1');

      mockPrisma.server.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should allow owner to delete server', async () => {
      mockPrisma.server.findUnique.mockResolvedValue({
        id: 'srv-1',
        ownerId: 'owner-id',
      });
      mockPrisma.server.delete.mockResolvedValue({});

      await service.delete('srv-1', 'owner-id');
      expect(mockPrisma.server.delete).toHaveBeenCalledWith({ where: { id: 'srv-1' } });
    });

    it('should prevent non-owners from deleting server', async () => {
      mockPrisma.server.findUnique.mockResolvedValue({
        id: 'srv-1',
        ownerId: 'owner-id',
      });

      await expect(service.delete('srv-1', 'impostor-id')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership atomically when requester is owner and target is member', async () => {
      mockPrisma.server.findUnique.mockResolvedValue({ id: 'srv-1', ownerId: 'current-owner' });
      mockPrisma.member.findUnique.mockResolvedValue({ id: 'mem-2', userId: 'new-owner', serverId: 'srv-1' });

      await service.transferOwnership('srv-1', 'current-owner', 'new-owner');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockAnalytics.track).toHaveBeenCalledWith('ownership_transferred', expect.any(Object));
      expect(mockAudit.log).toHaveBeenCalledWith('srv-1', 'current-owner', 'OWNERSHIP_TRANSFERRED', 'new-owner', expect.any(Object));
    });

    it('should reject transfer if requester is not owner', async () => {
      mockPrisma.server.findUnique.mockResolvedValue({ id: 'srv-1', ownerId: 'real-owner' });

      await expect(
        service.transferOwnership('srv-1', 'fake-owner', 'new-owner')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
