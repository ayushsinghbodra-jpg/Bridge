import { describe, expect, it } from '@jest/globals';
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateServerName,
  validateChannelName,
  isValidUrl,
} from './validation';

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('not-an-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should return true for valid usernames between 3 and 20 chars', () => {
      expect(validateUsername('testuser')).toBe(true);
      expect(validateUsername('abc')).toBe(true);
      expect(validateUsername('User_123')).toBe(true);
    });

    it('should return false for invalid usernames', () => {
      expect(validateUsername('ab')).toBe(false); // too short
      expect(validateUsername('a'.repeat(21))).toBe(false); // too long
      expect(validateUsername('user name')).toBe(false); // spaces not allowed
      expect(validateUsername('user@name')).toBe(false); // special chars
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid passwords with letters and numbers (min 8 chars)', () => {
      expect(validatePassword('testpassword1')).toBe(true);
      expect(validatePassword('P@ssword123')).toBe(false); // regex requires [A-Za-z\d]{8,} without symbols
      expect(validatePassword('Secret1234')).toBe(true);
    });

    it('should return false for passwords without numbers or too short', () => {
      expect(validatePassword('testpassword')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('pass1')).toBe(false);
    });
  });

  describe('validateServerName', () => {
    it('should return true for valid server names (3 to 50 chars)', () => {
      expect(validateServerName('testserver')).toBe(true);
      expect(validateServerName('My Awesome Server')).toBe(true);
    });

    it('should return false for invalid server names', () => {
      expect(validateServerName('ab')).toBe(false);
      expect(validateServerName('a'.repeat(51))).toBe(false);
      expect(validateServerName('Server!@#')).toBe(false);
    });
  });

  describe('validateChannelName', () => {
    it('should return true for valid channel names', () => {
      expect(validateChannelName('testchannel')).toBe(true);
      expect(validateChannelName('general discussion')).toBe(true);
    });

    it('should return false for invalid channel names', () => {
      expect(validateChannelName('ab')).toBe(false);
      expect(validateChannelName('a'.repeat(51))).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000/api')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });
});
