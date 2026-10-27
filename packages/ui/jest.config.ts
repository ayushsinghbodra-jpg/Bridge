import baseConfig from "../../jest.config.base";

export default {
  ...baseConfig,
  rootDir: ".",
  displayName: "ui",
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/src/**/*.test.ts"],
};
