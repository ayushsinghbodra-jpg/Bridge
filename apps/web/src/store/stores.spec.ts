import { describe, it, expect, beforeEach } from '@jest/globals';
import useAuthStore from './authStore';
import useServerStore from './serverStore';
import useChannelStore from './channelStore';
import useMessageStore from './messageStore';
import useSocketStore from './socketStore';
import type { User, ServerResponse, ChannelResponse, Message } from '@bridge/types';

describe('Frontend Zustand Stores', () => {
  beforeEach(() => {
    useAuthStore.getState().clearUser();
    useServerStore.getState().setServers([]);
    useServerStore.getState().setActiveServer(null);
    useChannelStore.getState().setChannels([]);
    useMessageStore.getState().clearMessages();
    useSocketStore.getState().reset();
  });

  describe('useAuthStore', () => {
    it('should manage authenticated user state', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      const mockUser: User = {
        id: 'u-1',
        username: 'alice',
        email: 'alice@example.com',
        displayName: 'Alice',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      };

      useAuthStore.getState().setUser(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.username).toBe('alice');

      useAuthStore.getState().clearUser();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should track initialization state', () => {
      expect(useAuthStore.getState().isInitialized).toBe(false);
      useAuthStore.getState().setInitialized();
      expect(useAuthStore.getState().isInitialized).toBe(true);
    });
  });

  describe('useServerStore', () => {
    const mockServer: ServerResponse = {
      id: 'srv-1',
      name: 'Test Server',
      slug: 'test-server',
      description: null,
      iconUrl: null,
      bannerUrl: null,
      visibility: 'private',
      ownerId: 'u-1',
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };

    it('should add, update, and remove servers in list', () => {
      useServerStore.getState().addServer(mockServer);
      expect(useServerStore.getState().servers.length).toBe(1);

      useServerStore.getState().setActiveServer(mockServer);
      expect(useServerStore.getState().activeServer?.id).toBe('srv-1');

      const updatedServer = { ...mockServer, name: 'Renamed Server' };
      useServerStore.getState().updateServerInList(updatedServer);
      expect(useServerStore.getState().servers[0]?.name).toBe('Renamed Server');
      expect(useServerStore.getState().activeServer?.name).toBe('Renamed Server');

      useServerStore.getState().removeServer('srv-1');
      expect(useServerStore.getState().servers.length).toBe(0);
      expect(useServerStore.getState().activeServer).toBeNull();
    });

    it('should manage pagination for discover servers', () => {
      useServerStore.getState().setDiscoverServers([mockServer], 'cursor-1');
      expect(useServerStore.getState().discoverServers.length).toBe(1);
      expect(useServerStore.getState().discoverHasMore).toBe(true);

      const secondServer = { ...mockServer, id: 'srv-2' };
      useServerStore.getState().appendDiscoverServers([secondServer], null);
      expect(useServerStore.getState().discoverServers.length).toBe(2);
      expect(useServerStore.getState().discoverHasMore).toBe(false);
    });
  });

  describe('useChannelStore', () => {
    const mockChannel: ChannelResponse = {
      id: 'ch-1',
      name: 'general',
      serverId: 'srv-1',
      topic: null,
      postion: 0,
      createdAt: new Date().toISOString(),
      type: 'text',
    };

    it('should add, set active, and remove channels', () => {
      useChannelStore.getState().addChannel(mockChannel);
      expect(useChannelStore.getState().channels.length).toBe(1);

      useChannelStore.getState().setActiveChannel(mockChannel);
      expect(useChannelStore.getState().activeChannel?.id).toBe('ch-1');

      useChannelStore.getState().removeChannel('ch-1');
      expect(useChannelStore.getState().channels.length).toBe(0);
      expect(useChannelStore.getState().activeChannel).toBeNull();
    });
  });

  describe('useMessageStore', () => {
    const mockMessage: Message = {
      id: 'msg-1',
      channelId: 'ch-1',
      content: 'Hello store!',
      replyTo: null,
      editedAt: null,
      deleted: false,
      createdAt: new Date().toISOString(),
      author: { id: 'u-1', username: 'alice', displayName: 'Alice', avatarUrl: null },
    };

    it('should add message with deduplication', () => {
      useMessageStore.getState().addMessage(mockMessage);
      expect(useMessageStore.getState().messages.length).toBe(1);

      // Duplicate add should be ignored
      useMessageStore.getState().addMessage(mockMessage);
      expect(useMessageStore.getState().messages.length).toBe(1);
    });

    it('should remove message and clear messages', () => {
      useMessageStore.getState().addMessage(mockMessage);
      useMessageStore.getState().removeMessage('msg-1');
      expect(useMessageStore.getState().messages.length).toBe(0);

      useMessageStore.getState().addMessage(mockMessage);
      useMessageStore.getState().clearMessages();
      expect(useMessageStore.getState().messages.length).toBe(0);
      expect(useMessageStore.getState().hasMore).toBe(true);
    });
  });

  describe('useSocketStore', () => {
    it('should manage socket connection status', () => {
      expect(useSocketStore.getState().isConnected).toBe(false);
      useSocketStore.getState().setConnected(true);
      expect(useSocketStore.getState().isConnected).toBe(true);

      useSocketStore.getState().reset();
      expect(useSocketStore.getState().isConnected).toBe(false);
      expect(useSocketStore.getState().socket).toBeNull();
    });
  });
});
