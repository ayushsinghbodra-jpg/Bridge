import { describe, expect, it } from '@jest/globals';
import { formatDate, timeAgo } from './date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('should format date with valid locale string', () => {
      const d = new Date('2023-01-01T12:34:56Z');
      const formatted = formatDate(d);
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/2023/);
    });
  });

  describe('timeAgo', () => {
    it('should return correct time ago for seconds', () => {
      expect(timeAgo(new Date(Date.now() - 30 * 1000))).toBe('30 seconds ago');
    });

    it('should return correct time ago for minutes', () => {
      expect(timeAgo(new Date(Date.now() - 5 * 60 * 1000))).toBe('5 minutes ago');
    });

    it('should return correct time ago for hours', () => {
      expect(timeAgo(new Date(Date.now() - 3 * 3600 * 1000))).toBe('3 hours ago');
    });

    it('should return correct time ago for days', () => {
      expect(timeAgo(new Date(Date.now() - 2 * 86400 * 1000))).toBe('2 days ago');
    });
  });
});
