// backend/src/teams/teams.schemas.js
import {
  createArrayReponseSchema,
  ErrorSchema,
} from '../shared/shared.schemas.js';

export const TeamMemberRef = {
  type: 'object',
  properties: {
    id: { type: 'integer' },        // user id
    role: { type: 'string', nullable: true },
  },
  required: ['id'],
};

export const TeamInfo = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    course_id: { type: 'number' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
  },
  required: ['id', 'course_id', 'name', 'description'],
};

export const CreateTeamBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    members: {
      type: 'array',
      items: TeamMemberRef,
      nullable: true,
    },
  },
  required: ['name'],
};

export const UpdateTeamBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
  },
};

export const AddMembersBody = {
  // Accept an array of {id, role}
  type: 'array',
  items: TeamMemberRef,
};

export const UpdateMembersBody = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      role: { type: 'string' },
    },
    required: ['id', 'role'],
  },
};

export const RemoveMembersBody = {
  type: 'object',
  properties: {
    ids: {
      type: 'array',
      items: { type: 'integer' },
    },
  },
  required: ['ids'],
};

export const ListTeamsSchema = {
  summary: 'Get all teams for a course',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
    },
    required: ['course_id'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        teams: createArrayReponseSchema(TeamInfo),
      },
      required: ['teams'],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const GetTeamSchema = {
  summary: 'Get a team by ID',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      team_id: { type: 'integer' },
    },
    required: ['course_id', 'team_id'],
  },
  response: {
    200: TeamInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const GetTeamMembersSchema = {
  summary: 'Get members of a team',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      team_id: { type: 'integer' },
    },
    required: ['course_id', 'team_id'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        members: createArrayReponseSchema({
          type: 'object',
          additionalProperties: true, // enrollment + nested user
        }),
      },
      required: ['members'],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const CreateTeamSchema = {
  summary: 'Create a new team',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
    },
    required: ['course_id'],
  },
  body: CreateTeamBody,
  response: {
    201: TeamInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const UpdateTeamSchema = {
  summary: 'Update a team',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      team_id: { type: 'integer' },
    },
    required: ['course_id', 'team_id'],
  },
  body: UpdateTeamBody,
  response: {
    200: TeamInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const AddMembersSchema = {
  summary: 'Add members to a team',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      team_id: { type: 'integer' },
    },
    required: ['course_id', 'team_id'],
  },
  body: AddMembersBody,
  response: {
    204: { type: 'null' },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const UpdateMembersSchema = {
  summary: 'Update roles of team members',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      team_id: { type: 'integer' },
    },
    required: ['course_id', 'team_id'],
  },
  body: UpdateMembersBody,
  response: {
    204: { type: 'null' },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const RemoveMembersSchema = {
  summary: 'Remove members from a team',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      team_id: { type: 'integer' },
    },
    required: ['course_id', 'team_id'],
  },
  body: RemoveMembersBody,
  response: {
    204: { type: 'null' },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};
