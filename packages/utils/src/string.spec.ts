import { describe, it, expect } from '@jest/globals';
import { truncate, slugify } from './string';

describe('string utils', () => {
  describe('truncate', () => {
    it('should return original text if length is smaller than limit', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate and append ellipses if length exceeds limit', () => {
      expect(truncate('hello world', 5)).toBe('hello...');
    });
  });

  describe('slugify', () => {
    it('should convert strings into clean slugs', () => {
      expect(slugify('General Chat')).toBe('general-chat');
      expect(slugify('Welcome & Rules!')).toBe('welcome-rules');
    });
  });
});
