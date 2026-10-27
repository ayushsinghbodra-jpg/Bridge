import baseConfig from "../../jest.config.base";

export default {
  ...baseConfig,
  rootDir: ".",
  displayName: "contracts",
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/src/**/*.test.ts"],
};
