import { renderHook, act } from '@testing-library/react';
import useAuth from './useAuth';
import useServer from './useServer';
import useAuthStore from '@/store/authStore';
import useServerStore from '@/store/serverStore';
import * as authService from '@/services/api/auth.service';
import * as serverService from '@/services/api/server.service';

const mockLogin = jest.fn<any>();
const mockLogout = jest.fn<any>();
const mockCreateServer = jest.fn<any>();

jest.mock('@/services/api/auth.service', () => ({
  login: (...args: any[]) => mockLogin(...args),
  logout: (...args: any[]) => mockLogout(...args),
  register: jest.fn(),
  getMe: jest.fn(),
}));

jest.mock('@/services/api/server.service', () => ({
  createServer: (...args: any[]) => mockCreateServer(...args),
  getMyServers: jest.fn(),
  updateServer: jest.fn(),
  deleteServer: jest.fn(),
  getMembers: jest.fn(),
  joinServer: jest.fn(),
  leaveServer: jest.fn(),
  createInvite: jest.fn(),
  getInviteByCode: jest.fn(),
  useInvite: jest.fn(),
  discoverServers: jest.fn(),
}));

jest.mock('@/services/websocket/socket', () => ({
  reconnectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
  getSocket: jest.fn(),
}));


describe('Frontend Custom Hooks', () => {
  beforeEach(() => {
    useAuthStore.getState().clearUser();
    useServerStore.getState().setServers([]);
    useServerStore.getState().setActiveServer(null);
    mockLogin.mockReset();
    mockLogout.mockReset();
    mockCreateServer.mockReset();
  });

  describe('useAuth hook', () => {
    it('should initialize with default unauthenticated state', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should perform login and update store state', async () => {
      const mockUser = {
        id: 'u-1',
        username: 'alice',
        email: 'alice@example.com',
        displayName: 'Alice',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      };

      mockLogin.mockResolvedValue({
        user: mockUser,
        tokens: { accessToken: 'tok1', refreshToken: 'tok2', expiresIn: 900 },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({ email: 'alice@example.com', password: 'Password123!' });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.username).toBe('alice');
    });

    it('should perform logout and clear store state', async () => {
      useAuthStore.getState().setUser({
        id: 'u-1',
        username: 'alice',
        email: 'alice@example.com',
        displayName: 'Alice',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      });

      mockLogout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('useServer hook', () => {
    it('should create server and update server store', async () => {
      const mockServer = {
        id: 'srv-1',
        name: 'React Hook Guild',
        slug: 'react-hook-guild',
        description: null,
        iconUrl: null,
        bannerUrl: null,
        visibility: 'private' as const,
        ownerId: 'u-1',
        memberCount: 1,
        createdAt: new Date().toISOString(),
      };

      mockCreateServer.mockResolvedValue(mockServer);

      const { result } = renderHook(() => useServer());

      await act(async () => {
        await result.current.createServer({ name: 'React Hook Guild' });
      });

      expect(result.current.servers.length).toBe(1);
      expect(result.current.servers[0]?.name).toBe('React Hook Guild');
    });

    it('should handle errors when server creation fails', async () => {
      mockCreateServer.mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useServer());

      await act(async () => {
        await result.current.createServer({ name: 'Failing Guild' });
      });

      expect(result.current.error).toBe('Server error');
    });
  });
});
