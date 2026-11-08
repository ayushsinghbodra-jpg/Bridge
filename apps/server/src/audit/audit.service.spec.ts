import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { AuditLogService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      member: {
        findUnique: jest.fn(),
      },
    };

    service = new AuditLogService(mockPrisma as unknown as PrismaService);
  });

  describe('log', () => {
    it('should persist audit log event with sanitized metadata', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

      service.log('srv-1', 'u-1', 'SERVER_CREATED', 'srv-1', { name: 'My Server' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          serverId: 'srv-1',
          actorId: 'u-1',
          action: 'SERVER_CREATED',
          targetId: 'srv-1',
          metadata: { name: 'My Server' },
        },
      });
    });

    it('should catch database errors silently without bubbling', async () => {
      mockPrisma.auditLog.create.mockRejectedValue(new Error('DB failure'));

      expect(() => {
        service.log('srv-1', 'u-1', 'MEMBER_LEFT', null, null);
      }).not.toThrow();
    });
  });

  describe('list', () => {
    it('should return paginated audit logs for admin or owner', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'ADMIN' });
      mockPrisma.auditLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          serverId: 'srv-1',
          action: 'ROLE_CHANGED',
          targetId: 'u-target',
          metadata: { newRole: 'MODERATOR' },
          createdAt: new Date(),
          actor: { id: 'u-1', username: 'admin', displayName: 'Admin', avatarUrl: null },
        },
      ]);

      const result = await service.list('srv-1', 'u-1');

      expect(result.logs.length).toBe(1);
      expect(result.logs[0].action).toBe('ROLE_CHANGED');
    });

    it('should reject access for regular members', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({ role: 'MEMBER' });

      await expect(service.list('srv-1', 'regular-user')).rejects.toThrow(ForbiddenException);
    });
  });
});
