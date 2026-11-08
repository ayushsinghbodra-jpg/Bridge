import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../utils/test-app';
import { clearTestDb } from '../utils/test-db';
import { registerAndLoginUser, TestUser } from '../utils/auth-helpers';
import { ServerService } from '../../src/server/server.service';
import { ChannelService } from '../../src/channel/channel/channel.service';

describe('Message Controller E2E', () => {
  let app: INestApplication;
  let serverService: ServerService;
  let channelService: ChannelService;
  let user: TestUser;
  let serverId: string;
  let channelId: string;

  beforeAll(async () => {
    app = await createTestApp();
    serverService = app.get(ServerService);
    channelService = app.get(ChannelService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTestDb();
    user = await registerAndLoginUser(app);

    const server = await serverService.create(
      { name: 'Message Test Server', visibility: 'private' },
      user.id
    );
    serverId = server.id;

    const channel = await channelService.create(
      serverId,
      { name: 'test-chat', type: 'text' },
      user.id
    );
    channelId = channel.id;
  });

  it('should post a new message to a channel', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/channels/${channelId}/messages`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ content: 'Hello from E2E test!' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.content).toBe('Hello from E2E test!');
    expect(res.body.author.id).toBe(user.id);
  });

  it('should retrieve channel messages', async () => {
    // Post two messages
    await request(app.getHttpServer())
      .post(`/api/channels/${channelId}/messages`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ content: 'First message' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/channels/${channelId}/messages`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ content: 'Second message' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/api/channels/${channelId}/messages`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(res.body.messages).toBeDefined();
    expect(res.body.messages.length).toBe(2);
    expect(res.body.messages.some((m: any) => m.content === 'First message')).toBe(true);
    expect(res.body.messages.some((m: any) => m.content === 'Second message')).toBe(true);
  });

  it('should add and manage reactions on a message', async () => {
    const msgRes = await request(app.getHttpServer())
      .post(`/api/channels/${channelId}/messages`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ content: 'React to this!' })
      .expect(201);

    const messageId = msgRes.body.id;

    // Add reaction
    const addRxRes = await request(app.getHttpServer())
      .post(`/api/messages/${messageId}/reactions`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ emoji: '🔥' })
      .expect(201);

    expect(addRxRes.body.emoji).toBe('🔥');

    // Get reactions
    const listRxRes = await request(app.getHttpServer())
      .get(`/api/messages/${messageId}/reactions`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(listRxRes.body).toBeDefined();
    expect(listRxRes.body.length).toBeGreaterThan(0);
    expect(listRxRes.body[0].emoji).toBe('🔥');

    // Remove reaction
    await request(app.getHttpServer())
      .delete(`/api/messages/${messageId}/reactions/${encodeURIComponent('🔥')}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
  });
});
