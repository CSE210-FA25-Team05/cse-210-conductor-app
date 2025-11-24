// backend/src/services/auth/auth.service.test.js

// Mock dependencies
jest.mock('../src/services/auth/auth.repo');
jest.mock('google-auth-library');

const {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
} = require('@jest/globals');
const authService = require('../src/services/auth/auth.service');
const authRepo = require('../src/services/auth/auth.repo');
const { OAuth2Client } = require('google-auth-library');

let mockOAuthClient;
let mockReply;
let mockRequest;
let originalEnv;

beforeEach(() => {
  originalEnv = { ...process.env };

  process.env.GOOGLE_CLIENT_ID = 'test-client-id';
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  process.env.GOOGLE_REDIRECT_URI =
    'http://localhost:3001/auth/oauth/google/callback';
  process.env.ALLOWED_EMAIL_SUFFIXES = '@ucsd.edu';

  // Mock OAuth2Client instance
  mockOAuthClient = {
    generateAuthUrl: jest.fn(),
    getToken: jest.fn(),
    verifyIdToken: jest.fn(),
  };

  OAuth2Client.mockImplementation(() => mockOAuthClient);

  // Mock Fastify reply object
  mockReply = {
    setCookie: jest.fn(),
  };

  // Mock Fastify request object
  mockRequest = {
    query: {
      code: 'auth-code-123',
      state: 'state-token-456',
    },
    body: {
      code: 'auth-code-123',
      state: 'state-token-456',
    },
    cookies: {
      oauth_state: 'state-token-456',
    },
  };

  // Clear all mocks
  jest.clearAllMocks();
});

afterEach(() => {
  // Restore original environment
  process.env = originalEnv;
});

describe('buildGoogleLoginUrl', () => {
  test('should set oauth_state cookie', () => {
    mockOAuthClient.generateAuthUrl.mockReturnValue('https://google.com/oauth');

    authService.buildGoogleLoginUrl(mockReply);

    expect(mockReply.setCookie).toHaveBeenCalledWith(
      'oauth_state',
      expect.any(String), // UUID
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 10 * 60, // 10 minutes
      })
    );
  });

  test('should set secure cookie in production', () => {
    process.env.NODE_ENV = 'production';
    mockOAuthClient.generateAuthUrl.mockReturnValue('https://google.com/oauth');

    authService.buildGoogleLoginUrl(mockReply);

    expect(mockReply.setCookie).toHaveBeenCalledWith(
      'oauth_state',
      expect.any(String),
      expect.objectContaining({
        secure: true,
      })
    );
  });

  test('should not set secure cookie in development', () => {
    process.env.NODE_ENV = 'development';
    mockOAuthClient.generateAuthUrl.mockReturnValue('https://google.com/oauth');

    authService.buildGoogleLoginUrl(mockReply);

    expect(mockReply.setCookie).toHaveBeenCalledWith(
      'oauth_state',
      expect.any(String),
      expect.objectContaining({
        secure: false,
      })
    );
  });
});
