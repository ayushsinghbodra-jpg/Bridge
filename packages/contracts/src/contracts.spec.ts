import { describe, it, expect } from '@jest/globals';
import {
  registerSchema,
  loginSchema,
  createServerSchema,
  createInviteSchema,
  createChannelSchema,
  sendMessageSchema,
  createConversationSchema,
  sendDmSchema,
} from './index';

describe('Contracts & DTO Invariants', () => {
  const validCuid1 = 'cju1234567890123456789012';
  const validCuid2 = 'cju1234567890123456789013';
  const validCuid3 = 'cju1234567890123456789014';

  describe('User and AuthResponse schema contract', () => {
    it('should validate valid user registration and login contract payloads', () => {
      const validRegister = {
        username: 'alice_w',
        email: 'alice@example.com',
        password: 'Password123!',
        displayName: 'Alice Wonderland',
      };
      const parsedRegister = registerSchema.safeParse(validRegister);
      expect(parsedRegister.success).toBe(true);
      if (parsedRegister.success) {
        expect(parsedRegister.data.username).toBe('alice_w');
        expect(parsedRegister.data.displayName).toBe('Alice Wonderland');
      }

      const validLogin = {
        email: 'alice@example.com',
        password: 'Password123!',
      };
      const parsedLogin = loginSchema.safeParse(validLogin);
      expect(parsedLogin.success).toBe(true);
    });

    it('should reject invalid auth payloads and boundary violations', () => {
      const shortUsername = {
        username: 'al',
        email: 'alice@example.com',
        password: 'Password123!',
      };
      expect(registerSchema.safeParse(shortUsername).success).toBe(false);

      const invalidEmail = {
        username: 'validuser',
        email: 'not-an-email',
        password: 'Password123!',
      };
      expect(registerSchema.safeParse(invalidEmail).success).toBe(false);

      const shortPassword = {
        username: 'validuser',
        email: 'alice@example.com',
        password: '123',
      };
      expect(registerSchema.safeParse(shortPassword).success).toBe(false);

      const emptyLogin = { email: '', password: '' };
      expect(loginSchema.safeParse(emptyLogin).success).toBe(false);
    });
  });

  describe('Server and Channel payload invariants', () => {
    it('should enforce server creation and invite constraints', () => {
      const defaultServer = { name: 'My Gaming Guild' };
      const parsedServer = createServerSchema.safeParse(defaultServer);
      expect(parsedServer.success).toBe(true);
      if (parsedServer.success) {
        expect(parsedServer.data.visibility).toBe('private');
      }

      const invalidServer = { name: '' };
      expect(createServerSchema.safeParse(invalidServer).success).toBe(false);

      const validInvite = { maxUses: 10, expiresInHours: 24 };
      expect(createInviteSchema.safeParse(validInvite).success).toBe(true);

      const invalidInvite = { maxUses: 99999 };
      expect(createInviteSchema.safeParse(invalidInvite).success).toBe(false);
    });

    it('should validate channel creation variants and reject unsupported types', () => {
      const textChannel = { name: 'general', type: 'text' as const };
      const voiceChannel = { name: 'lounge', type: 'voice' as const };
      const announcementChannel = { name: 'news', type: 'announcements' as const };

      expect(createChannelSchema.safeParse(textChannel).success).toBe(true);
      expect(createChannelSchema.safeParse(voiceChannel).success).toBe(true);
      expect(createChannelSchema.safeParse(announcementChannel).success).toBe(true);

      const invalidChannelType = { name: 'invalid', type: 'STAGE' };
      expect(createChannelSchema.safeParse(invalidChannelType).success).toBe(false);

      const emptyChannelName = { name: '', type: 'text' as const };
      expect(createChannelSchema.safeParse(emptyChannelName).success).toBe(false);

      const oversizedChannelName = { name: 'a'.repeat(65), type: 'text' as const };
      expect(createChannelSchema.safeParse(oversizedChannelName).success).toBe(false);
    });
  });

  describe('Message and Dm response structures', () => {
    it('should validate message sending payload limits and boundaries', () => {
      const validMessage = { content: 'Hello world!' };
      expect(sendMessageSchema.safeParse(validMessage).success).toBe(true);

      const emptyMessage = { content: '' };
      expect(sendMessageSchema.safeParse(emptyMessage).success).toBe(false);

      const oversizedMessage = { content: 'a'.repeat(4001) };
      expect(sendMessageSchema.safeParse(oversizedMessage).success).toBe(false);
    });

    it('should validate direct message and conversation payloads', () => {
      const validDm = {
        type: 'DM' as const,
        participantIds: [validCuid1],
      };
      expect(createConversationSchema.safeParse(validDm).success).toBe(true);

      // DM must have exactly 1 other participant
      const invalidMultiDm = {
        type: 'DM' as const,
        participantIds: [validCuid1, validCuid2],
      };
      expect(createConversationSchema.safeParse(invalidMultiDm).success).toBe(false);

      const validGroupDm = {
        type: 'GROUP_DM' as const,
        participantIds: [validCuid1, validCuid2, validCuid3],
      };
      expect(createConversationSchema.safeParse(validGroupDm).success).toBe(true);

      const validDmContent = { content: 'Hey, are you free?' };
      expect(sendDmSchema.safeParse(validDmContent).success).toBe(true);
    });
  });
});
