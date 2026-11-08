import type { Config } from 'jest';
import baseConfig from '../../jest.config.base';

const serverE2EConfig: Config = {
  ...baseConfig,
  rootDir: '.',
  testMatch: [
    '<rootDir>/test/e2e/**/*.e2e-spec.ts',
    '<rootDir>/test/integration/**/*.e2e-spec.ts',
  ],
  testTimeout: 30_000,
  maxWorkers: 1,
  displayName: {
    name: 'server-e2e',
    color: 'green',
  },
  setupFilesAfterEnv: [
    "<rootDir>/test/setup-e2e.ts",
  ],
};

export default serverE2EConfig;
