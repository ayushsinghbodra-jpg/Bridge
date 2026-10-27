import baseConfig from "../../jest.config.base";

export default {
  ...baseConfig,
  rootDir: ".",
  displayName: "utils",
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/src/**/*.test.ts"],
};
