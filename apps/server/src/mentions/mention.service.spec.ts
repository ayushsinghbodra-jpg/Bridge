import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { MentionServices } from './mention.service';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipService } from '../common/membership.service';

describe('MentionServices', () => {
  let service: MentionServices;
  let mockPrisma: any;
  let mockMembership: any;

  beforeEach(() => {
    mockPrisma = {
      user: { findMany: jest.fn() },
      mention: {
        createMany: (jest.fn() as any).mockResolvedValue({ count: 2 }),
        findMany: jest.fn(),
      },
    };

    mockMembership = {
      assertMemberForChannel: jest.fn(),
    };

    service = new MentionServices(
      mockPrisma as unknown as PrismaService,
      mockMembership as unknown as MembershipService,
    );
  });

  describe('parseMentions', () => {
    it('should parse @username mentions from text', () => {
      const text = 'Hello @alice and @bob, welcome!';
      const usernames = service.parseMentions(text);
      expect(usernames).toEqual(['alice', 'bob']);
    });

    it('should deduplicate multiple mentions of the same user', () => {
      const text = '@alice hey @alice check this out @alice';
      const usernames = service.parseMentions(text);
      expect(usernames).toEqual(['alice']);
    });

    it('should throw BadRequestException if mention limit is exceeded', () => {
      const manyMentions = Array.from({ length: 20 }, (_, i) => `@user_${i}_tag`).join(' ');
      expect(() => service.parseMentions(manyMentions)).toThrow(BadRequestException);
    });
  });

  describe('processMentions', () => {
    it('should resolve mentioned channel members and persist mentions', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u-alice', username: 'alice' },
        { id: 'u-bob', username: 'bob' },
      ]);
      mockMembership.assertMemberForChannel.mockResolvedValue('srv-1');
      mockPrisma.mention.findMany.mockResolvedValue([
        { id: 'm-1', userId: 'u-alice', user: { id: 'u-alice', username: 'alice' } },
        { id: 'm-2', userId: 'u-bob', user: { id: 'u-bob', username: 'bob' } },
      ]);

      const mentions = await service.processMentions('Hey @alice and @bob!', 'ch-1', 'msg-1');

      expect(mockPrisma.mention.createMany).toHaveBeenCalledWith({
        data: [
          { messageId: 'msg-1', userId: 'u-alice' },
          { messageId: 'msg-1', userId: 'u-bob' },
        ],
        skipDuplicates: true,
      });
      expect(mentions.length).toBe(2);
    });
  });
});
