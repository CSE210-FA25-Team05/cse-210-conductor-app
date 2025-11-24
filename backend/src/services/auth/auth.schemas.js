import { ErrorSchema } from '../shared/shared.schemas.js';

export const UpdateProfileParams = {
  type: 'object',
  properties: {
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    pronouns: { type: 'string' },
  },
};

export const UserProfile = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    pronouns: { type: 'string' },
    global_role: { type: 'string' },
    is_profile_complete: { type: 'boolean' },
  },
  required: [
    'id',
    'email',
    'first_name',
    'last_name',
    'pronouns',
    'global_role',
    'is_profile_complete',
  ],
};

export const GoogleOAuthSchema = {
  summary: 'Initiate Google OAuth2 login flow',
  tags: ['Auth'],
  response: {
    302: { type: 'null' },
  },
};

export const GoogleOAuthCallbackSchema = {
  summary: 'OAuth Callback (not to be used directly by client)',
  description: 'Callback used by Google to complete OAuth2 login flow',
  tags: ['Auth'],
  response: {
    302: { type: 'null' },
  },
};

export const LogoutSchema = {
  summary: 'Logout user',
  tags: ['Auth'],
  response: {
    200: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
      },
    },
  },
};

export const GetUserProfileSchema = {
  summary: 'Fetch user profile',
  tags: ['Profile'],
  response: {
    200: UserProfile,
    401: ErrorSchema,
  },
};

export const UpdateUserProfileSchema = {
  summary: 'Update user profile',
  tags: ['Profile'],
  body: UpdateProfileParams,
  response: {
    200: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        user: UserProfile,
      },
    },
    400: ErrorSchema,
    401: ErrorSchema,
  },
};

export const GetUserProfileByIdSchema = {
  type: 'object',
  properties: {
    user_id: { type: 'number' },
  },
  required: ['user_id'],
  summary: 'Get another user profile by ID',
  description:
    'Fetch a user profile by user ID. Requires appropriate permissions.',
  tags: ['Profile'],
  response: {
    200: UserProfile,
    401: ErrorSchema,
    403: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
    404: ErrorSchema,
  },
};
