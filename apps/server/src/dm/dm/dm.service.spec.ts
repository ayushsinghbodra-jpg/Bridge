import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DmService } from './dm.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsService } from '../../analytics/analytics.service';

describe('DmService', () => {
  let service: DmService;
  let mockPrisma: any;
  let mockAnalytics: any;

  beforeEach(() => {
    mockPrisma = {
      user: { findMany: jest.fn() },
      conversation: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      conversationParticipant: {
        findUnique: jest.fn(),
      },
      directMessage: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    mockAnalytics = { track: jest.fn() };

    service = new DmService(
      mockPrisma as unknown as PrismaService,
      mockAnalytics as unknown as AnalyticsService,
    );
  });

  describe('createConversation', () => {
    it('should create a DM conversation between two valid users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'u-target' }]);
      mockPrisma.conversation.findMany.mockResolvedValue([]); // no existing DM
      mockPrisma.conversation.create.mockResolvedValue({
        id: 'conv-1',
        type: 'DM',
        createdAt: new Date(),
        participants: [
          {
            id: 'p-1',
            joinedAt: new Date(),
            lastReadAt: null,
            user: { id: 'u-actor', username: 'alice', displayName: 'Alice', avatarUrl: null },
          },
          {
            id: 'p-2',
            joinedAt: new Date(),
            lastReadAt: null,
            user: { id: 'u-target', username: 'bob', displayName: 'Bob', avatarUrl: null },
          },
        ],
      });

      const conversation = await service.createConversation('u-actor', 'DM', ['u-target']);

      expect(conversation.id).toBe('conv-1');
      expect(conversation.type).toBe('DM');
      expect(conversation.participants.length).toBe(2);
      expect(mockAnalytics.track).toHaveBeenCalledWith('conversation_created', expect.any(Object));
    });

    it('should reject if actor includes themselves in participants', async () => {
      await expect(
        service.createConversation('u-actor', 'DM', ['u-actor'])
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if participant user does not exist in DB', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]); // user not found

      await expect(
        service.createConversation('u-actor', 'DM', ['u-nonexistent'])
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject GROUP_DM with fewer than 2 other participants', async () => {
      await expect(
        service.createConversation('u-actor', 'GROUP_DM', ['u-1'])
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendMessage', () => {
    it('should send DM to conversation if sender is participant', async () => {
      mockPrisma.conversationParticipant.findUnique.mockResolvedValue({ id: 'cp-1' });
      mockPrisma.directMessage.create.mockResolvedValue({
        id: 'dm-1',
        conversationId: 'conv-1',
        senderId: 'u-1',
        content: 'Hey there!',
        replyToId: null,
        replyTo: null,
        editedAt: null,
        deleted: false,
        createdAt: new Date(),
        sender: { id: 'u-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
      });

      const message = await service.sendMessage('conv-1', 'u-1', 'Hey there!');
      expect(message.id).toBe('dm-1');
      expect(message.content).toBe('Hey there!');
      expect(mockAnalytics.track).toHaveBeenCalledWith('dm_sent', expect.any(Object));
    });

    it('should reject send if sender is not a participant', async () => {
      mockPrisma.conversationParticipant.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage('conv-1', 'stranger', 'Hello?')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
