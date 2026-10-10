import type { Config } from 'jest';
import baseConfig from '../../jest.config.base';

const serverE2EConfig: Config = {
  ...baseConfig,
  rootDir: '.',
  testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
  testTimeout: 30_000,
  displayName: {
    name: 'server-e2e',
    color: 'green',
  },
};

export default serverE2EConfig;
