import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import type { Socket } from 'socket.io-client';
import { createTestApp } from '../utils/test-app';
import { clearTestDb } from '../utils/test-db';
import { registerAndLoginUser, TestUser } from '../utils/auth-helpers';
import { createSocketClient, waitForEvent } from '../utils/socket-helpers';
import { ServerService } from '../../src/server/server.service';
import { MemberService } from '../../src/server/member.service';
import { ChannelService } from '../../src/channel/channel/channel.service';

describe('Chat Gateway E2E', () => {
  let app: INestApplication;
  let serverService: ServerService;
  let channelService: ChannelService;
  let userAlice: TestUser;
  let userBob: TestUser;
  let serverId: string;
  let channelId: string;
  let baseUrl: string;
  const activeSockets: Socket[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    await app.listen(0);
    const address = app.getHttpServer().address();
    const port = typeof address === 'string' ? 3000 : address.port;
    baseUrl = `http://localhost:${port}`;

    serverService = app.get(ServerService);
    channelService = app.get(ChannelService);
  });

  afterAll(async () => {
    for (const socket of activeSockets) {
      if (socket.connected) socket.disconnect();
    }
    await app.close();
  });

  beforeEach(async () => {
    await clearTestDb();
    userAlice = await registerAndLoginUser(app);
    userBob = await registerAndLoginUser(app);

    const server = await serverService.create(
      { name: 'Gateway Server', visibility: 'private' },
      userAlice.id
    );
    serverId = server.id;

    // Add Bob to server
    const memberService = app.get(MemberService);
    await memberService.join(serverId, userBob.id);

    const channel = await channelService.create(
      serverId,
      { name: 'ws-chat', type: 'text' },
      userAlice.id
    );
    channelId = channel.id;
  });

  it('should connect authenticated user to chat gateway', async () => {
    const socket = createSocketClient(baseUrl, '/chat', userAlice.token);
    activeSockets.push(socket);

    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', (err) => reject(err));
    });

    expect(socket.connected).toBe(true);
  });

  it('should broadcast message to channel members', async () => {
    const socketAlice = createSocketClient(baseUrl, '/chat', userAlice.token);
    const socketBob = createSocketClient(baseUrl, '/chat', userBob.token);
    activeSockets.push(socketAlice, socketBob);

    await Promise.all([
      new Promise<void>((r) => socketAlice.on('connect', () => r())),
      new Promise<void>((r) => socketBob.on('connect', () => r())),
    ]);

    // Both join the channel
    socketAlice.emit('channel:join', { channelId });
    socketBob.emit('channel:join', { channelId });

    // Wait slightly for join room to process
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Bob listens for message:new
    const messagePromise = waitForEvent<{ content: string }>(socketBob, 'message:new');

    // Alice sends a message
    socketAlice.emit('message:send', {
      channelId,
      content: 'Realtime WebSocket message!',
    });

    const receivedMessage = await messagePromise;
    expect(receivedMessage.content).toBe('Realtime WebSocket message!');
  });

  it('should broadcast typing indicator', async () => {
    const socketAlice = createSocketClient(baseUrl, '/chat', userAlice.token);
    const socketBob = createSocketClient(baseUrl, '/chat', userBob.token);
    activeSockets.push(socketAlice, socketBob);

    await Promise.all([
      new Promise<void>((r) => socketAlice.on('connect', () => r())),
      new Promise<void>((r) => socketBob.on('connect', () => r())),
    ]);

    socketAlice.emit('channel:join', { channelId });
    socketBob.emit('channel:join', { channelId });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const typingPromise = waitForEvent<{ userId: string }>(socketBob, 'typing:start');

    socketAlice.emit('typing:start', { channelId });

    const typingData = await typingPromise;
    expect(typingData.userId).toBe(userAlice.id);
  });
});
