import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import type { Socket } from 'socket.io-client';
import { createTestApp } from '../utils/test-app';
import { clearTestDb } from '../utils/test-db';
import { registerAndLoginUser, TestUser } from '../utils/auth-helpers';
import { createSocketClient, waitForEvent } from '../utils/socket-helpers';
import { DmService } from '../../src/dm/dm/dm.service';

describe('DM Gateway E2E', () => {
  let app: INestApplication;
  let dmService: DmService;
  let userAlice: TestUser;
  let userBob: TestUser;
  let conversationId: string;
  let baseUrl: string;
  const activeSockets: Socket[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    await app.listen(0);
    const address = app.getHttpServer().address();
    const port = typeof address === 'string' ? 3000 : address.port;
    baseUrl = `http://localhost:${port}`;

    dmService = app.get(DmService);
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

    const conv = await dmService.createConversation(userAlice.id, 'DM', [userBob.id]);
    conversationId = conv.id;
  });

  it('should connect user to DM gateway', async () => {
    const socket = createSocketClient(baseUrl, '/dm', userAlice.token);
    activeSockets.push(socket);

    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', (err) => reject(err));
    });

    expect(socket.connected).toBe(true);
  });

  it('should deliver direct message to participant', async () => {
    const socketAlice = createSocketClient(baseUrl, '/dm', userAlice.token);
    const socketBob = createSocketClient(baseUrl, '/dm', userBob.token);
    activeSockets.push(socketAlice, socketBob);

    await Promise.all([
      new Promise<void>((r) => socketAlice.on('connect', () => r())),
      new Promise<void>((r) => socketBob.on('connect', () => r())),
    ]);

    // Join conversation
    socketAlice.emit('conversation:join', { conversationId });
    socketBob.emit('conversation:join', { conversationId });

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Bob listens for dm:new
    const dmPromise = waitForEvent<{ content: string; conversationId: string }>(socketBob, 'dm:new');

    // Alice sends DM
    socketAlice.emit('dm:send', {
      conversationId,
      content: 'Private message between Alice and Bob',
    });

    const receivedDm = await dmPromise;
    expect(receivedDm.content).toBe('Private message between Alice and Bob');
    expect(receivedDm.conversationId).toBe(conversationId);
  });
});
