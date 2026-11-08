import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MessageService } from './message.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { MembershipService } from '../../common/membership.service';
import { MentionServices } from '../../mentions/mention.service';

describe('MessageService', () => {
  let service: MessageService;
  let mockPrisma: any;
  let mockAnalytics: any;
  let mockMembership: any;
  let mockMentions: any;

  beforeEach(() => {
    mockPrisma = {
      channel: { findUnique: jest.fn() },
      member: { findUnique: jest.fn() },
      message: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    mockAnalytics = { track: jest.fn() };
    mockMembership = {
      assertMemberForChannel: jest.fn(),
    };
    mockMentions = {
      processMentions: (jest.fn() as any).mockResolvedValue([]),
    };

    service = new MessageService(
      mockPrisma as unknown as PrismaService,
      mockAnalytics as unknown as AnalyticsService,
      mockMembership as unknown as MembershipService,
      mockMentions as unknown as MentionServices,
    );
  });

  describe('send', () => {
    it('should successfully send message and process mentions', async () => {
      mockPrisma.channel.findUnique.mockResolvedValue({ id: 'ch-1', serverId: 'srv-1' });
      mockPrisma.member.findUnique.mockResolvedValue({ id: 'mem-1', role: 'MEMBER' });
      mockPrisma.message.create.mockResolvedValue({
        id: 'msg-1',
        channelId: 'ch-1',
        authorId: 'u-1',
        content: 'Hello everyone!',
        replyToId: null,
        replyTo: null,
        editedAt: null,
        deleted: false,
        createdAt: new Date(),
        author: { id: 'u-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
      });

      const message = await service.send('ch-1', 'u-1', 'Hello everyone!');

      expect(message.id).toBe('msg-1');
      expect(message.content).toBe('Hello everyone!');
      expect(mockAnalytics.track).toHaveBeenCalledWith('message_sent', expect.any(Object));
      expect(mockMentions.processMentions).toHaveBeenCalledWith('Hello everyone!', 'ch-1', 'msg-1');
    });

    it('should reject send if requester is not a member of the server', async () => {
      mockPrisma.channel.findUnique.mockResolvedValue({ id: 'ch-1', serverId: 'srv-1' });
      mockPrisma.member.findUnique.mockResolvedValue(null);

      await expect(service.send('ch-1', 'non-member', 'Hi')).rejects.toThrow(ForbiddenException);
    });

    it('should reject reply if replyTo message is in a different channel', async () => {
      mockPrisma.channel.findUnique.mockResolvedValue({ id: 'ch-1', serverId: 'srv-1' });
      mockPrisma.member.findUnique.mockResolvedValue({ id: 'mem-1' });
      mockPrisma.message.findUnique.mockResolvedValue({ id: 'reply-1', channelId: 'ch-other' });

      await expect(service.send('ch-1', 'u-1', 'replying', 'reply-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('edit and delete', () => {
    it('should allow author to edit their own message', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'msg-1',
        authorId: 'u-1',
      });
      mockPrisma.message.update.mockResolvedValue({
        id: 'msg-1',
        channelId: 'ch-1',
        content: 'Edited content',
        replyTo: null,
        editedAt: new Date(),
        deleted: false,
        createdAt: new Date(),
        author: { id: 'u-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
      });

      const updated = await service.edit('msg-1', 'u-1', 'Edited content');
      expect(updated.content).toBe('Edited content');
      expect(updated.editedAt).toBeDefined();
    });

    it('should prevent non-authors from editing someone elses message', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'msg-1',
        authorId: 'u-1',
      });

      await expect(service.edit('msg-1', 'u-hacker', 'Hacked message')).rejects.toThrow(ForbiddenException);
    });

    it('should soft-delete message when requested by author', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'msg-1',
        authorId: 'u-1',
      });
      mockPrisma.message.update.mockResolvedValue({});

      await service.delete('msg-1', 'u-1');
      expect(mockPrisma.message.update).toHaveBeenCalledWith({
        where: { id: 'msg-1' },
        data: { deleted: true, content: '[message deleted]' },
      });
    });
  });
});
