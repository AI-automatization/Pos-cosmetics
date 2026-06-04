/**
 * Unit tests for GlobalExceptionFilter — focused on the MulterError branch.
 * The filter requires ArgumentsHost + Response mocks; we keep them minimal.
 */
import { HttpStatus } from '@nestjs/common';
import { MulterError } from 'multer';
import { GlobalExceptionFilter } from './global-exception.filter';

function makeHost(jsonFn: jest.Mock, statusFn: jest.Mock) {
  const response = {
    status: statusFn.mockReturnValue({ json: jsonFn }),
  };
  return {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({
        url: '/test',
        method: 'POST',
        headers: {},
      }),
    }),
  } as never;
}

function makeFilter() {
  const logger = {
    logWithContext: jest.fn(),
  } as never;
  const requestContext = {
    getRequestId: () => null,
  } as never;
  return new GlobalExceptionFilter(logger, requestContext);
}

describe('GlobalExceptionFilter — MulterError branch', () => {
  it('maps LIMIT_FILE_SIZE to 413 PAYLOAD_TOO_LARGE', () => {
    const filter = makeFilter();
    const jsonFn = jest.fn();
    const statusFn = jest.fn();
    const host = makeHost(jsonFn, statusFn);

    const err = new MulterError('LIMIT_FILE_SIZE');
    filter.catch(err, host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'MULTER_LIMIT_FILE_SIZE',
          message: 'Fayl hajmi juda katta',
        }),
      }),
    );
  });

  it('maps any other MulterError code to 400 BAD_REQUEST', () => {
    const filter = makeFilter();
    const jsonFn = jest.fn();
    const statusFn = jest.fn();
    const host = makeHost(jsonFn, statusFn);

    const err = new MulterError('LIMIT_FILE_COUNT');
    filter.catch(err, host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'MULTER_LIMIT_FILE_COUNT',
          message: 'Fayl yuklashda xatolik',
        }),
      }),
    );
  });
});
