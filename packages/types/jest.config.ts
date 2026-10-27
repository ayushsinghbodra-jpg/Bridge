import baseConfig from "../../jest.config.base";

export default {
  ...baseConfig,
  rootDir: ".",
  displayName: "types",
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/src/**/*.test.ts"],
};
