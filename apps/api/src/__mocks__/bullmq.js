// Manual mock for BullMQ — prevents ESM/uuid parse errors in Jest unit tests.
// Real BullMQ (CJS) pulls in uuid@14 which ships ESM-only in dist-node.
// Integration tests and the actual runtime use the real package via NestJS DI.
const EventEmitter = require('events');

class Queue extends EventEmitter {
  constructor() { super(); }
  add() { return Promise.resolve({ id: 'mock-job-id' }); }
  getJob() { return Promise.resolve(null); }
  getWaitingCount() { return Promise.resolve(0); }
  getActiveCount() { return Promise.resolve(0); }
  getCompletedCount() { return Promise.resolve(0); }
  getFailedCount() { return Promise.resolve(0); }
  getDelayedCount() { return Promise.resolve(0); }
  getFailed() { return Promise.resolve([]); }
  close() { return Promise.resolve(); }
  on() { return this; }
}

class Worker extends EventEmitter {
  constructor() { super(); }
  close() { return Promise.resolve(); }
  on() { return this; }
}

module.exports = { Queue, Worker };
