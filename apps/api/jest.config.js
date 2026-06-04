/* global module */
/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  // BullMQ's CJS dist depends on uuid@14 which ships ESM-only in dist-node,
  // causing a parse error in Jest's CommonJS transform pipeline.
  // Redirect to a hand-written stub so unit tests run without a live Redis.
  // E2E tests use the real package (jest-e2e.config.js has its own setup).
  moduleNameMapper: {
    '^bullmq$': '<rootDir>/__mocks__/bullmq.js',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
