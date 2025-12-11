'use strict';

/**
 * Development Backdoor Routes
 *
 * ⚠️ WARNING: These endpoints bypass all authentication and authorization checks.
 * DO NOT use these in production!
 *
 * These routes are for development and testing purposes only.
 */

const {
  GlobalRoles,
  isValidEnumValue,
} = require('../services/shared/shared.enums');

// eslint-disable-next-line no-unused-vars
module.exports = async function backdoorRoutes(fastify, options) {
  const prisma = fastify.db;
  /**
   * Update user's global role by email
   * POST /backdoor/users/update-role
   * Body: { email: string, role: string }
   */
  fastify.post(
    '/backdoor/users/update-role',
    {
      schema: {
        description:
          '⚠️ DEVELOPMENT BACKDOOR: Update user global role by email (NO AUTH REQUIRED)',
        tags: ['Backdoor'],
        body: {
          type: 'object',
          required: ['email', 'role'],
          properties: {
            email: { type: 'string', format: 'email' },
            role: {
              type: 'string',
              enum: Object.values(GlobalRoles),
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  previous_role: { type: 'string' },
                  new_role: { type: 'string' },
                },
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { email, role } = request.body;

        // Validate role
        if (!isValidEnumValue(GlobalRoles, role)) {
          return reply.code(400).send({
            error: 'Invalid role',
            message: `Role must be one of: ${Object.values(GlobalRoles).join(', ')}`,
          });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedRole = role.toLowerCase().trim();

        // Check if user exists
        const user = await prisma.users.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            global_role: true,
          },
        });

        if (!user) {
          return reply.code(404).send({
            error: 'User not found',
            message: `User with email "${normalizedEmail}" not found`,
          });
        }

        // Update user role
        const updatedUser = await prisma.users.update({
          where: { email: normalizedEmail },
          data: { global_role: normalizedRole },
          select: {
            id: true,
            email: true,
            global_role: true,
          },
        });

        return reply.send({
          success: true,
          message: 'User role updated successfully',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            previous_role: user.global_role || 'student',
            new_role: updatedUser.global_role,
          },
        });
      } catch (error) {
        console.error('Backdoor update role error:', error);
        return reply.code(500).send({
          error: 'Internal server error',
          message: error.message,
        });
      }
    }
  );

  /**
   * Create a new user
   * POST /backdoor/users
   * Body: { email: string, first_name?: string, last_name?: string, global_role?: string }
   */
  fastify.post(
    '/backdoor/users',
    {
      schema: {
        description:
          '⚠️ DEVELOPMENT BACKDOOR: Create a new user (NO AUTH REQUIRED)',
        tags: ['Backdoor'],
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            pronouns: { type: 'string' },
            global_role: {
              type: 'string',
              enum: Object.values(GlobalRoles),
              default: GlobalRoles.STUDENT,
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              user: {
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
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
          409: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { email, first_name, last_name, pronouns, global_role } =
          request.body;

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await prisma.users.findUnique({
          where: { email: normalizedEmail },
        });

        if (existingUser) {
          return reply.code(409).send({
            error: 'User already exists',
            message: `User with email "${normalizedEmail}" already exists`,
          });
        }

        // Validate role if provided
        const role = global_role
          ? global_role.toLowerCase().trim()
          : GlobalRoles.STUDENT;
        if (!isValidEnumValue(GlobalRoles, role)) {
          return reply.code(400).send({
            error: 'Invalid role',
            message: `Role must be one of: ${Object.values(GlobalRoles).join(', ')}`,
          });
        }

        // Determine if profile is complete
        const isProfileComplete = !!(first_name && last_name);

        // Create user
        const user = await prisma.users.create({
          data: {
            email: normalizedEmail,
            first_name: first_name || null,
            last_name: last_name || null,
            pronouns: pronouns || null,
            global_role: role,
            is_profile_complete: isProfileComplete,
          },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            pronouns: true,
            global_role: true,
            is_profile_complete: true,
          },
        });

        return reply.code(201).send({
          success: true,
          message: 'User created successfully',
          user,
        });
      } catch (error) {
        console.error('Backdoor create user error:', error);
        if (error.code === 'P2002') {
          return reply.code(409).send({
            error: 'User already exists',
            message: 'A user with this email already exists',
          });
        }
        return reply.code(500).send({
          error: 'Internal server error',
          message: error.message,
        });
      }
    }
  );

  /**
   * Get user info by email
   * GET /backdoor/users/:email
   */
  fastify.get(
    '/backdoor/users/:email',
    {
      schema: {
        description:
          '⚠️ DEVELOPMENT BACKDOOR: Get user info by email (NO AUTH REQUIRED)',
        tags: ['Backdoor'],
        params: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  global_role: { type: 'string' },
                  is_profile_complete: { type: 'boolean' },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const email = request.params.email.toLowerCase().trim();

        const user = await prisma.users.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            global_role: true,
            is_profile_complete: true,
          },
        });

        if (!user) {
          return reply.code(404).send({
            error: 'User not found',
            message: `User with email "${email}" not found`,
          });
        }

        return reply.send({
          success: true,
          user,
        });
      } catch (error) {
        console.error('Backdoor get user error:', error);
        return reply.code(500).send({
          error: 'Internal server error',
          message: error.message,
        });
      }
    }
  );
};
