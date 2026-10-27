import baseConfig from "../../jest.config.base";

export default {
  ...baseConfig,
  rootDir: ".",
  displayName: "config",
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/src/**/*.test.ts"],
};
