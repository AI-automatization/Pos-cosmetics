import { runProductImportJob } from '../product-import.worker';
import type { PrismaClient } from '@prisma/client';

function makePrisma() {
  return {
    unit: { findMany: jest.fn().mockResolvedValue([]) },
    category: { findMany: jest.fn().mockResolvedValue([]) },
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
    },
  };
}

describe('runProductImportJob', () => {
  it('processes rows and reports progress via job.updateProgress', async () => {
    const prisma = makePrisma();
    const updateProgress = jest.fn().mockResolvedValue(undefined);
    const job = {
      id: 'job-1',
      data: {
        tenantId: 't1',
        userId: 'u1',
        rows: [{ name: 'A', sku: 'A-1', price: 10 }],
      },
      updateProgress,
    };

    const summary = await runProductImportJob(prisma as unknown as PrismaClient, job as never);

    expect(summary.created).toBe(1);
    expect(prisma.product.create).toHaveBeenCalledTimes(1);
    // final progress report always fires
    expect(updateProgress).toHaveBeenCalled();
    const lastArg = updateProgress.mock.calls[updateProgress.mock.calls.length - 1][0];
    expect(lastArg).toMatchObject({ processed: 1, total: 1 });
  });

  it('propagates an engine throw so BullMQ marks the job failed', async () => {
    const prisma = makePrisma();
    prisma.unit.findMany.mockRejectedValue(new Error('db down'));
    const job = {
      id: 'job-2',
      data: { tenantId: 't1', userId: 'u1', rows: [{ name: 'A', sku: 'A-1', price: 10 }] },
      updateProgress: jest.fn(),
    };
    await expect(
      runProductImportJob(prisma as unknown as PrismaClient, job as never),
    ).rejects.toThrow('db down');
  });
});
