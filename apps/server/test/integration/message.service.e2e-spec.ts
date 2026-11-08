import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import * as argon2 from 'argon2';
import { createTestApp } from '../utils/test-app';
import { testDb, clearTestDb } from '../utils/test-db';
import { MessageService } from '../../src/message/message/message.service';
import { ServerService } from '../../src/server/server.service';
import { MemberService } from '../../src/server/member.service';
import { ChannelService } from '../../src/channel/channel/channel.service';

describe('Message Service Integration', () => {
  let app: INestApplication;
  let messageService: MessageService;
  let serverService: ServerService;
  let memberService: MemberService;
  let channelService: ChannelService;

  beforeAll(async () => {
    app = await createTestApp();
    messageService = app.get(MessageService);
    serverService = app.get(ServerService);
    memberService = app.get(MemberService);
    channelService = app.get(ChannelService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  it('should save and retrieve paginated messages for a channel', async () => {
    const owner = await testDb.user.create({
      data: {
        username: 'msg_author',
        email: 'author@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    const server = await serverService.create(
      { name: 'Chat Realm', visibility: 'private' },
      owner.id
    );

    const channel = await channelService.create(
      server.id,
      { name: 'lounge', type: 'text' },
      owner.id
    );

    // Send 3 messages
    await messageService.send(channel.id, owner.id, 'Message 1');
    await messageService.send(channel.id, owner.id, 'Message 2');
    await messageService.send(channel.id, owner.id, 'Message 3');

    // Retrieve paginated
    const page = await messageService.list(channel.id, owner.id, undefined, 2);

    expect(page.messages.length).toBe(2);
    expect(page.nextCursor).not.toBeNull();

    // Verify messages exist in DB
    const countInDb = await testDb.message.count({ where: { channelId: channel.id } });
    expect(countInDb).toBe(3);
  });

  it('should record mention records when user is tagged in message', async () => {
    const owner = await testDb.user.create({
      data: {
        username: 'mention_sender',
        email: 'sender@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    const taggedUser = await testDb.user.create({
      data: {
        username: 'tagged_user',
        email: 'tagged@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    const server = await serverService.create(
      { name: 'Tag Central', visibility: 'private' },
      owner.id
    );

    // Add taggedUser as member so mention resolves
    await memberService.join(server.id, taggedUser.id);

    const channel = await channelService.create(
      server.id,
      { name: 'general_tag', type: 'text' },
      owner.id
    );

    const message = await messageService.send(
      channel.id,
      owner.id,
      'Hello @tagged_user please check this!'
    );

    // Verify mention record in DB
    const mentionsInDb = await testDb.mention.findMany({
      where: { messageId: message.id },
    });

    expect(mentionsInDb.length).toBe(1);
    expect(mentionsInDb[0]?.userId).toBe(taggedUser.id);
  });

  it('should cascade delete messages when channel is removed', async () => {
    const owner = await testDb.user.create({
      data: {
        username: 'cascade_owner',
        email: 'cascade@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    const server = await serverService.create(
      { name: 'Temporary Server', visibility: 'private' },
      owner.id
    );

    const channel = await channelService.create(
      server.id,
      { name: 'temp_channel', type: 'text' },
      owner.id
    );

    await messageService.send(channel.id, owner.id, 'Temporary message');

    const msgBefore = await testDb.message.count({ where: { channelId: channel.id } });
    expect(msgBefore).toBe(1);

    // Delete channel
    await channelService.delete(channel.id, owner.id);

    // Verify messages in that channel are deleted by cascade
    const msgAfter = await testDb.message.count({ where: { channelId: channel.id } });
    expect(msgAfter).toBe(0);
  });
});
