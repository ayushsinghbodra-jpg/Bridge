import type { Config } from 'jest';
import baseConfig from '../../jest.config.base';

const serverConfig: Config = {
  ...baseConfig,
  rootDir: '.',
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts',
  ],
  displayName : {
    name : 'server',
    color : 'blue', 
  },
  setupFilesAfterEnv: [
    "<rootDir>/test/setup.ts",
  ],
};

export default serverConfig;
