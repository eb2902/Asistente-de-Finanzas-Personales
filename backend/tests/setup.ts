import { vi } from 'vitest';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '24h';
process.env.NODE_ENV = 'test';

// Mock logger to reduce noise in tests
vi.mock('../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

// No need for jest.setTimeout - Vitest handles timeouts differently
// Test timeout is configured in vitest.config.ts
