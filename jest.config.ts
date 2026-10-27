import type {Config} from '@jest/types';
const baseConfig : Config.InitialOptions = {
    projects : [
        "<rootDir>/apps/server/jest.config.ts",
        "<rootDir>/apps/server/jest-e2e.config.ts",
        "<rootDir>/apps/web/jest.config.ts",
        "<rootDir>/packages/*/jest.config.ts",
    ],
  maxWorkers: 1,
};
export default baseConfig;