import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Server AnalyticsService', () => {
  let service: AnalyticsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      analyticsEvent: {
        createMany: (jest.fn() as any).mockResolvedValue({ count: 1 }),
      },
    };

    service = new AnalyticsService(mockPrisma as unknown as PrismaService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should buffer events and flush them to Prisma', async () => {
    service.track('test_action', { userId: 'u-1', payload: { foo: 'bar' } });

    await service.flush();

    expect(mockPrisma.analyticsEvent.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: 'u-1',
          name: 'test_action',
          payload: JSON.stringify({ foo: 'bar' }),
        }),
      ],
    });
  });

  it('should restore buffer if Prisma fails during flush', async () => {
    mockPrisma.analyticsEvent.createMany.mockRejectedValue(new Error('DB disconnect'));

    service.track('event_fails');
    await service.flush();

    // Event should be restored into buffer
    mockPrisma.analyticsEvent.createMany.mockResolvedValue({ count: 1 });
    await service.flush();

    expect(mockPrisma.analyticsEvent.createMany).toHaveBeenCalledTimes(2);
  });
});
