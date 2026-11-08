import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Logger, LogLevel } from './index';

describe('Logger Utility', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Log level Filtering', () => {
    it('should log messages at or above the configured log level', () => {
      const logger = new Logger({ level: 'info' });
      logger.debug('This is a debug message');
      logger.info('This is an info message');
      logger.warn('This is a warning message');
      logger.error('This is an error message');

      expect(consoleSpy).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'), 'This is an info message');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'), 'This is a warning message');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), 'This is an error message');
    });

    it('should suppress messages below the configured log level', () => {
      const logger = new Logger({ level: 'warn' });
      logger.debug('This is a debug message');
      logger.info('This is an info message');
      logger.warn('This is a warning message');
      logger.error('This is an error message');

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'), 'This is a warning message');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), 'This is an error message');
    });

    it('should log all messages when level is debug', () => {
      const logger = new Logger({ level: 'debug' });
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(consoleSpy).toHaveBeenCalledTimes(4);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'), 'debug msg');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'), 'info msg');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'), 'warn msg');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), 'error msg');
    });

    it('should only log error when level is error', () => {
      const logger = new Logger({ level: 'error' });
      logger.debug('debug msg');
      logger.info('info msg');
      logger.warn('warn msg');
      logger.error('error msg');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), 'error msg');
    });

    it('should default to info level when no options provided', () => {
      const logger = new Logger();
      logger.debug('debug msg');
      logger.info('info msg');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'), 'info msg');
    });
  });

  describe('Context and Metadata Handling', () => {
    it('should include context tag in log prefix when context is provided', () => {
      const logger = new Logger({ level: 'info', context: 'AuthService' });
      logger.info('User logged in');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[INFO\]\s+\[AuthService\]/),
        'User logged in'
      );
    });

    it('should pass additional metadata arguments to console.log', () => {
      const logger = new Logger({ level: 'info' });
      const meta = { userId: '123', ip: '127.0.0.1' };
      logger.info('User action', meta, 'extra-tag');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'User action',
        meta,
        'extra-tag'
      );
    });
  });
});
