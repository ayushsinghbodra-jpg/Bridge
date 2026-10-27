import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Logger, LogLevel } from './index';
describe ('Logger Utility' , () => {
  describe('Log level FIltering', () => {
    let logger : Logger;
    let consoleSpy: ReturnType<typeof jest.spyOn>;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });
  
    it('should log messages at or above the configured log level', () => {
      logger = new Logger({ level: 'info' });
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
      logger = new Logger({ level: 'warn' });
      logger.debug('This is a debug message');
      logger.info('This is an info message');
      logger.warn('This is a warning message');
      logger.error('This is an error message');

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'), 'This is a warning message');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), 'This is an error message');
    });
  })
})