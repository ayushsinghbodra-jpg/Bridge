process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-must-be-at-least-32-chars-long';
process.env.DATABASE_URL = 'postgresql://bridge:password@localhost:5432/bridge_test';

// Reset mocks between unit tests
beforeEach(() => {
  jest.clearAllMocks();
});
