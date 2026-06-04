import { Test } from '@nestjs/testing';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ProductImportController, IMPORT_SYNC_THRESHOLD } from './product-import.controller';
import { ProductImportService } from './product-import.service';
import { QueueService } from '../../common/queue/queue.service';

function makeRes() {
  const res: { status: jest.Mock; statusCode?: number } = {
    status: jest.fn().mockImplementation((c: number) => {
      res.statusCode = c;
      return res;
    }),
  };
  return res;
}

function makeFile(over: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    buffer: Buffer.from('x'),
    mimetype: 'text/csv',
    size: 10,
    ...over,
  } as Express.Multer.File;
}

describe('ProductImportController', () => {
  let controller: ProductImportController;
  let service: { parse: jest.Mock; processSync: jest.Mock };
  let queue: { addProductImportJob: jest.Mock; getProductImportJobStatus: jest.Mock };

  beforeEach(async () => {
    service = { parse: jest.fn(), processSync: jest.fn() };
    queue = { addProductImportJob: jest.fn(), getProductImportJobStatus: jest.fn() };
    const mod = await Test.createTestingModule({
      controllers: [ProductImportController],
      providers: [
        { provide: ProductImportService, useValue: service },
        { provide: QueueService, useValue: queue },
      ],
    }).compile();
    controller = mod.get(ProductImportController);
  });

  it('rejects a missing file', async () => {
    const res = makeRes();
    await expect(
      controller.importProducts('t1', 'u1', undefined as never, res as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an unsupported mime type', async () => {
    const res = makeRes();
    await expect(
      controller.importProducts('t1', 'u1', makeFile({ mimetype: 'image/png' }), res as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an empty file (no parsed rows)', async () => {
    service.parse.mockResolvedValue([]);
    const res = makeRes();
    await expect(
      controller.importProducts('t1', 'u1', makeFile(), res as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('runs sync for < threshold rows and returns mode=sync with 200', async () => {
    service.parse.mockResolvedValue(new Array(IMPORT_SYNC_THRESHOLD - 1).fill({ name: 'A', sku: 'A-1', price: 1 }));
    service.processSync.mockResolvedValue({ created: 1, updated: 0, skipped: 0, errors: [] });
    const res = makeRes();
    const out = await controller.importProducts('t1', 'u1', makeFile(), res as never);
    expect(out).toMatchObject({ mode: 'sync', created: 1, skipped: 0 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(queue.addProductImportJob).not.toHaveBeenCalled();
  });

  it('enqueues for >= threshold rows and returns mode=async with 202 + jobId + total', async () => {
    const rows = new Array(IMPORT_SYNC_THRESHOLD).fill({ name: 'A', sku: 'A-1', price: 1 });
    service.parse.mockResolvedValue(rows);
    queue.addProductImportJob.mockResolvedValue({ id: 'job-9' });
    const res = makeRes();
    const out = await controller.importProducts('t1', 'u1', makeFile(), res as never);
    expect(out).toEqual({ mode: 'async', jobId: 'job-9', total: IMPORT_SYNC_THRESHOLD });
    expect(res.status).toHaveBeenCalledWith(202);
    expect(service.processSync).not.toHaveBeenCalled();
  });

  it('returns 503 when enqueue fails (Redis down) for >= threshold rows', async () => {
    const rows = new Array(IMPORT_SYNC_THRESHOLD).fill({ name: 'A', sku: 'A-1', price: 1 });
    service.parse.mockResolvedValue(rows);
    queue.addProductImportJob.mockRejectedValue(new Error('redis down'));
    const res = makeRes();
    await expect(
      controller.importProducts('t1', 'u1', makeFile(), res as never),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('delegates status reads to the queue', async () => {
    queue.getProductImportJobStatus.mockResolvedValue({ status: 'active', progress: null, result: null });
    const out = await controller.importStatus('job-9');
    expect(queue.getProductImportJobStatus).toHaveBeenCalledWith('job-9');
    expect(out.status).toBe('active');
  });
});
