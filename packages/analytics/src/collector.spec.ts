import { describe, it, expect, jest } from '@jest/globals';
import { AnalyticsCollector } from './collector';
import { AnalyticsTransport, TrackedEvent } from './type';

describe('Analytics Collector', () => {
  describe('track', () => {
    it('should add an event to the buffer', () => {
      const collector = new AnalyticsCollector({
        transports: [],
        bufferSize: 2,
        flushIntervals: 0,
        globalProperties: { appVersion: '1.0.0' },
      });

      collector.track('testEvent', { userId: 'user123', payload: { key: 'value' } });

      expect(collector.getBufferSize()).toBe(1);
    });
  });

  describe('flush', () => {
    it('should send events to transports and clear the buffer', async () => {
      const mockTransport: AnalyticsTransport = {
        send: jest.fn<(event: TrackedEvent) => Promise<void>>().mockResolvedValue(undefined),
      };

      const collector = new AnalyticsCollector({
        transports: [mockTransport],
        bufferSize: 5,
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
  });
});
