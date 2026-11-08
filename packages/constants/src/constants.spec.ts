import { describe, it, expect } from '@jest/globals';
import { SOCKET_EVENTS, ROLES, ROLE_PERMISSIONS, API_ROUTES } from './index';

describe('Shared Constants', () => {
  describe('SOCKET_EVENTS', () => {
    it('should define all required core socket events', () => {
      expect(SOCKET_EVENTS.CONNECTION).toBe('connection');
      expect(SOCKET_EVENTS.DISCONNECT).toBe('disconnect');
      expect(SOCKET_EVENTS.SEND_MESSAGE).toBe('send_message');
      expect(SOCKET_EVENTS.RECEIVE_MESSAGE).toBe('receive_message');
      expect(SOCKET_EVENTS.JOIN_SERVER).toBe('join_server');
      expect(SOCKET_EVENTS.LEAVE_SERVER).toBe('leave_server');
      expect(SOCKET_EVENTS.USER_TYPING).toBe('user_typing');
      expect(SOCKET_EVENTS.STOP_TYPING).toBe('stop_typing');
    });

    it('should have unique socket event values', () => {
      const values = Object.values(SOCKET_EVENTS);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });
  });

  describe('ROLES and ROLE_PERMISSIONS', () => {
    it('should export standard role definitions', () => {
      expect(ROLES.OWNER).toBe('owner');
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.MODERATOR).toBe('moderator');
      expect(ROLES.MEMBER).toBe('member');
    });

    it('should define valid permissions array for each defined role', () => {
      expect(ROLE_PERMISSIONS.ADMIN).toContain('create_server');
      expect(ROLE_PERMISSIONS.ADMIN).toContain('manage_roles');
      expect(ROLE_PERMISSIONS.MODERATOR).toContain('kick_user');
      expect(ROLE_PERMISSIONS.MODERATOR).not.toContain('manage_roles');
      expect(ROLE_PERMISSIONS.MEMBER).toEqual(['send_message']);
      expect(ROLE_PERMISSIONS.OWNER).toEqual(ROLE_PERMISSIONS.ADMIN);
    });
  });

  describe('API_ROUTES', () => {
    it('should define valid route prefixes starting with /api', () => {
      const checkRoutes = (obj: Record<string, any>) => {
        for (const [key, val] of Object.entries(obj)) {
          if (typeof val === 'string') {
            expect(val.startsWith('/api')).toBe(true);
          } else if (typeof val === 'object' && val !== null) {
            checkRoutes(val);
          }
        }
      };

      checkRoutes(API_ROUTES);
    });

    it('should define core authentication, user, server, channel and message routes', () => {
      expect(API_ROUTES.AUTH.LOGIN).toBe('/api/login');
      expect(API_ROUTES.AUTH.REGISTER).toBe('/api/register');
      expect(API_ROUTES.USER.GET_USER).toBe('/api/user');
      expect(API_ROUTES.SERVER.CREATE_SERVER).toBe('/api/servers/create');
      expect(API_ROUTES.CHANNEL.CREATE_CHANNEL).toBe('/api/channel/create');
      expect(API_ROUTES.MESSAGE.SEND).toBe('/api/messages');
    });
  });
});
