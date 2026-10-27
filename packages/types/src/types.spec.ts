import { describe, it, expect } from '@jest/globals';
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  createServerSchema,
  createInviteSchema,
  createChannelSchema,
  CHANNEL_TYPES,
  sendMessageSchema,
  createConversationSchema,
  AddReactionSchema,
} from './index';

describe('Shared Types & Validation Schemas', () => {
  describe('Auth Schemas', () => {
    describe('registerSchema', () => {
      it('should validate a correct registration payload', () => {
        const payload = {
          username: 'validuser',
          email: 'valid@example.com',
          password: 'securepassword123',
          displayName: 'Valid User',
        };
        const result = registerSchema.safeParse(payload);
        expect(result.success).toBe(true);
      });

      it('should reject usernames shorter than 3 characters', () => {
        const payload = {
          username: 'ab',
          email: 'valid@example.com',
          password: 'securepassword123',
        };
        const result = registerSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it('should reject passwords shorter than 8 characters', () => {
        const payload = {
          username: 'validuser',
          email: 'valid@example.com',
          password: 'short',
        };
        const result = registerSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });

      it('should reject invalid email formats', () => {
        const payload = {
          username: 'validuser',
          email: 'not-an-email',
          password: 'securepassword123',
        };
        const result = registerSchema.safeParse(payload);
        expect(result.success).toBe(false);
      });
    });

    describe('loginSchema', () => {
      it('should accept valid email and password', () => {
        const result = loginSchema.safeParse({
          email: 'user@example.com',
          password: 'password123',
        });
        expect(result.success).toBe(true);
      });

      it('should reject empty passwords', () => {
        const result = loginSchema.safeParse({
          email: 'user@example.com',
          password: '',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('resetPasswordSchema', () => {
      it('should validate valid reset payload', () => {
        const result = resetPasswordSchema.safeParse({
          token: 'valid-reset-token-123',
          newPassword: 'newsecurepassword123',
        });
        expect(result.success).toBe(true);
      });

      it('should reject short new password', () => {
        const result = resetPasswordSchema.safeParse({
          token: 'valid-token',
          newPassword: 'short',
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Server Schemas', () => {
    describe('createServerSchema', () => {
      it('should parse server payload and default visibility to private', () => {
        const result = createServerSchema.safeParse({
          name: 'Bridge Community',
          description: 'A place for developers',
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.visibility).toBe('private');
        }
      });

      it('should reject empty server name', () => {
        const result = createServerSchema.safeParse({
          name: '',
        });
        expect(result.success).toBe(false);
      });

      it('should reject invalid iconUrl', () => {
        const result = createServerSchema.safeParse({
          name: 'Server',
          iconUrl: 'not-a-valid-url',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('createInviteSchema', () => {
      it('should accept valid maxUses and expiresInHours', () => {
        const result = createInviteSchema.safeParse({
          maxUses: 10,
          expiresInHours: 24,
        });
        expect(result.success).toBe(true);
      });

      it('should reject maxUses greater than 1000', () => {
        const result = createInviteSchema.safeParse({
          maxUses: 1001,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Channel Schemas', () => {
    describe('createChannelSchema', () => {
      it.each(CHANNEL_TYPES)('should accept valid channel type: %s', (type) => {
        const result = createChannelSchema.safeParse({
          name: 'general',
          type,
        });
        expect(result.success).toBe(true);
      });

      it('should reject unsupported channel types', () => {
        const result = createChannelSchema.safeParse({
          name: 'video-chat',
          type: 'invalid_type',
        });
        expect(result.success).toBe(false);
      });

      it('should reject empty channel name', () => {
        const result = createChannelSchema.safeParse({
          name: '',
          type: 'text',
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Message Schemas', () => {
    describe('sendMessageSchema', () => {
      it('should accept valid message content', () => {
        const result = sendMessageSchema.safeParse({
          content: 'Hello, world!',
        });
        expect(result.success).toBe(true);
      });

      it('should reject empty message content', () => {
        const result = sendMessageSchema.safeParse({
          content: '',
        });
        expect(result.success).toBe(false);
      });

      it('should reject message content exceeding 4000 characters', () => {
        const result = sendMessageSchema.safeParse({
          content: 'a'.repeat(4001),
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Conversation Schemas', () => {
    const validCuid1 = 'clh1111110000011111111111';
    const validCuid2 = 'clh2222220000022222222222';
    const validCuid3 = 'clh3333330000033333333333';

    describe('createConversationSchema', () => {
      it('should accept DM with exactly one other participant', () => {
        const result = createConversationSchema.safeParse({
          type: 'DM',
          participantIds: [validCuid1],
        });
        expect(result.success).toBe(true);
      });

      it('should reject DM with more than one participant', () => {
        const result = createConversationSchema.safeParse({
          type: 'DM',
          participantIds: [validCuid1, validCuid2],
        });
        expect(result.success).toBe(false);
      });

      it('should accept GROUP_DM with 2 or more participants', () => {
        const result = createConversationSchema.safeParse({
          type: 'GROUP_DM',
          participantIds: [validCuid1, validCuid2],
        });
        expect(result.success).toBe(true);
      });

      it('should reject GROUP_DM with fewer than 2 participants', () => {
        const result = createConversationSchema.safeParse({
          type: 'GROUP_DM',
          participantIds: [validCuid1],
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Reaction Schemas', () => {
    describe('AddReactionSchema', () => {
      it('should accept valid standard emoji', () => {
        const result = AddReactionSchema.safeParse({
          emoji: '👍',
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid custom Discord-style emoji', () => {
        const result = AddReactionSchema.safeParse({
          emoji: '<:custom_emoji:123456789012345678>',
        });
        expect(result.success).toBe(true);
      });

      it('should reject arbitrary non-emoji text', () => {
        const result = AddReactionSchema.safeParse({
          emoji: 'hello_not_an_emoji',
        });
        expect(result.success).toBe(false);
      });
    });
  });
});
