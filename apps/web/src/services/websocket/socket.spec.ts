let mockToken: string | null = 'jwt-token-abc';

const mockSocketInstance = {
  connected: false,
  disconnect: jest.fn(),
};

const mockIo = jest.fn((..._args: any[]) => mockSocketInstance);

jest.mock('socket.io-client', () => ({
  __esModule: true,
  io: (...args: any[]) => mockIo(...args),
}));

jest.mock('@/services/storage/authStorage', () => ({
  __esModule: true,
  getAccessToken: () => mockToken,
  getRefreshToken: () => null,
  saveTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

import { getSocket, disconnectSocket, reconnectSocket } from './socket';
import { SOCKET_EVENTS } from './socketEvents';

describe('Frontend WebSocket Client', () => {
  beforeEach(() => {
    disconnectSocket();
    mockSocketInstance.disconnect.mockClear();
    mockIo.mockClear();
    mockToken = 'jwt-token-abc';
  });

  it('should initialize and return a Socket instance with current auth token', () => {
    const s1 = getSocket();
    expect(mockIo).toHaveBeenCalledWith(
      expect.stringContaining('/chat'),
      expect.objectContaining({
        auth: { token: 'jwt-token-abc' },
      })
    );

    // Subsequent calls return cached singleton
    const s2 = getSocket();
    expect(s1).toBe(s2);
    expect(mockIo).toHaveBeenCalledTimes(1);
  });

  it('should disconnect and clear cached socket on disconnectSocket', () => {
    getSocket();
    disconnectSocket();
    expect(mockSocketInstance.disconnect).toHaveBeenCalled();

    // Calling getSocket again creates a new socket
    getSocket();
    expect(mockIo).toHaveBeenCalledTimes(2);
  });

  it('should reconnect with fresh token on reconnectSocket', () => {
    getSocket();
    mockToken = 'refreshed-jwt-token';
    reconnectSocket();
    expect(mockSocketInstance.disconnect).toHaveBeenCalled();
    expect(mockIo).toHaveBeenCalledTimes(2);
    expect(mockIo).toHaveBeenLastCalledWith(
      expect.stringContaining('/chat'),
      expect.objectContaining({
        auth: { token: 'refreshed-jwt-token' },
      })
    );
  });

  it('should define socket event constants', () => {
    expect(SOCKET_EVENTS.CONNECT).toBe('connect');
    expect(SOCKET_EVENTS.JOIN_CHANNEL).toBe('channel:join');
    expect(SOCKET_EVENTS.RECEIVE_MESSAGE).toBe('message:new');
    expect(SOCKET_EVENTS.TYPING_START).toBe('typing:start');
  });
});

