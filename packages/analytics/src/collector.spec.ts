import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AnalyticsCollector } from './collector';
import { AnalyticsTransport, TrackedEvent } from './type';
import { ConsoleTransport } from './transports/console';
import { InMemoryTransport } from './transports/in-memory';

describe('Analytics Collector', () => {
  describe('track and buffer management', () => {
    it('should add an event to the buffer with global properties', () => {
      const collector = new AnalyticsCollector({
        transports: [],
        bufferSize: 10,
        flushIntervals: 0,
        globalProperties: { appVersion: '1.0.0', env: 'test' },
      });

      collector.track('testEvent', { userId: 'user123', payload: { custom: 'data' } });

      expect(collector.getBufferSize()).toBe(1);
    });

    it('should automatically flush when buffer size is reached', async () => {
      const mockTransport: AnalyticsTransport = {
        send: jest.fn<(event: TrackedEvent) => Promise<void>>().mockResolvedValue(undefined),
      };

      const collector = new AnalyticsCollector({
        transports: [mockTransport],
        bufferSize: 2,
        flushIntervals: 0,
        globalProperties: {},
      });

      collector.track('event1');
      collector.track('event2');

      // Allow microtask to resolve flush
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockTransport.send).toHaveBeenCalledTimes(2);
      expect(collector.getBufferSize()).toBe(0);
    });
  });

  describe('flush', () => {
    it('should send events to transports and clear the buffer', async () => {
      const mockTransport: AnalyticsTransport = {
        send: jest.fn<(event: TrackedEvent) => Promise<void>>().mockResolvedValue(undefined),
      };

      const collector = new AnalyticsCollector({
        transports: [mockTransport],
        bufferSize: 10,
        flushIntervals: 0,
        globalProperties: {},
      });

      collector.track('testEvent1');
      collector.track('testEvent2');

      await collector.flush();

      expect(mockTransport.send).toHaveBeenCalledTimes(2);
      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'testEvent1' }),
      );
      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'testEvent2' }),
      );
      expect(collector.getBufferSize()).toBe(0);
    });

    it('should handle transport errors gracefully without throwing', async () => {
      const faultyTransport: AnalyticsTransport = {
        send: jest.fn<(event: TrackedEvent) => Promise<void>>().mockRejectedValue(new Error('Network error')),
      };

      const collector = new AnalyticsCollector({
        transports: [faultyTransport],
        bufferSize: 10,
        flushIntervals: 0,
        globalProperties: {},
      });

      collector.track('errorEvent');
      await expect(collector.flush()).resolves.not.toThrow();
      expect(collector.getBufferSize()).toBe(0);
    });

    it('should no-op when flushing an empty buffer', async () => {
      const mockTransport: AnalyticsTransport = {
        send: jest.fn<(event: TrackedEvent) => Promise<void>>().mockResolvedValue(undefined),
      };
      const collector = new AnalyticsCollector({
        transports: [mockTransport],
        bufferSize: 10,
        flushIntervals: 0,
      });

      await collector.flush();
      expect(mockTransport.send).not.toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('should clear timer and flush on shutdown', async () => {
      const inMemory = new InMemoryTransport();
      const collector = new AnalyticsCollector({
        transports: [inMemory],
        bufferSize: 10,
        flushIntervals: 10000,
      });

      collector.track('shutdownEvent');
      await collector.shutdown();

      expect(inMemory.event.length).toBe(1);
      expect(collector.getBufferSize()).toBe(0);
    });
  });

  describe('Transports', () => {
    it('InMemoryTransport should collect, flush and clear events', async () => {
      const transport = new InMemoryTransport();
      const event: TrackedEvent = {
        id: '1',
        name: 'test',
        userId: 'u1',
        serverId: null,
        payload: {},
        createdAt: new Date(),
      };

      await transport.send(event);
      expect(transport.event.length).toBe(1);
      expect(transport.event[0].name).toBe('test');

      await transport.flush();
      expect(transport.event.length).toBe(1);

      await transport.clear();
      expect(transport.event.length).toBe(0);
    });

    it('ConsoleTransport should log event details to console', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const transport = new ConsoleTransport('[custom-tag]');
      const event: TrackedEvent = {
        id: 'evt-1',
        name: 'user_signed_in',
        userId: 'u-123',
        serverId: 's-456',
        payload: { ip: '127.0.0.1' },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };

      await transport.send(event);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[custom-tag] user_signed_in',
        expect.objectContaining({
          userId: 'u-123',
          serverId: 's-456',
          id: 'evt-1',
        })
      );
      consoleSpy.mockRestore();
    });
  });
});
