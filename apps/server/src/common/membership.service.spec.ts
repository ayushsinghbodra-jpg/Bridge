import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MembershipService', () => {
  let service: MembershipService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      member: {
        findUnique: jest.fn(),
      },
      channel: {
        findUnique: jest.fn(),
      },
    };

    service = new MembershipService(mockPrisma as unknown as PrismaService);
  });

  describe('assertMember', () => {
    it('should resolve without error when user is a member of the server', async () => {
      mockPrisma.member.findUnique.mockResolvedValue({ id: 'mem-1', userId: 'u-1', serverId: 'srv-1' });

      await expect(service.assertMember('srv-1', 'u-1')).resolves.toBeUndefined();
      expect(mockPrisma.member.findUnique).toHaveBeenCalledWith({
        where: { userId_serverId: { userId: 'u-1', serverId: 'srv-1' } },
      });
    });

    it('should throw ForbiddenException when user is not a member', async () => {
      mockPrisma.member.findUnique.mockResolvedValue(null);

      await expect(service.assertMember('srv-1', 'stranger')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assertMemberForChannel', () => {
    it('should return serverId when user is a member of the channel server', async () => {
      mockPrisma.channel.findUnique.mockResolvedValue({ serverId: 'srv-1' });
      mockPrisma.member.findUnique.mockResolvedValue({ id: 'mem-1' });

      const serverId = await service.assertMemberForChannel('ch-1', 'u-1');
      expect(serverId).toBe('srv-1');
    });

    it('should throw NotFoundException if channel does not exist', async () => {
      mockPrisma.channel.findUnique.mockResolvedValue(null);

      await expect(service.assertMemberForChannel('missing-ch', 'u-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if channel exists but user is not a member of its server', async () => {
      mockPrisma.channel.findUnique.mockResolvedValue({ serverId: 'srv-1' });
      mockPrisma.member.findUnique.mockResolvedValue(null);

      await expect(service.assertMemberForChannel('ch-1', 'stranger')).rejects.toThrow(ForbiddenException);
    });
  });
});
