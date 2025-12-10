// backend/src/services/teams/teams.schemas.js
'use strict';

const {
  createArrayReponseSchema,
  ErrorSchema,
} = require('../shared/shared.schemas.js');

const TeamMemberRef = {
  type: 'object',
  properties: {
    id: { type: 'integer' }, // user id
    role: { type: 'string', nullable: true },
  },
  required: ['id'],
};

const TeamInfo = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    course_id: { type: 'number' },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
  },
  required: ['id', 'course_id', 'name', 'description'],
};

const CreateTeamBody = {
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

const UpdateTeamBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
  },
};

const AddMembersBody = {
  // Accept an array of {id, role}
  type: 'array',
  items: TeamMemberRef,
};

const UpdateMembersBody = {
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

const RemoveMembersBody = {
  type: 'object',
  properties: {
    ids: {
      type: 'array',
      items: { type: 'integer' },
    },
  },
  required: ['ids'],
};

// Shape returned by mapUserAndEnrollmentToCourseUser()
const TeamMemberDetails = {
  type: 'object',
  properties: {
    id: { type: 'integer' }, // enrollment id
    user_id: { type: 'integer' },
    course_id: { type: 'integer' },
    user_email: { type: 'string' },
    user_first_name: { type: 'string' },
    user_last_name: { type: 'string' },
    pronouns: { type: 'string', nullable: true },
    team_id: { type: 'integer', nullable: true },
    role: { type: 'string', nullable: true },
    created_at: { type: 'string', format: 'date-time' },
  },
  required: [
    'id',
    'user_id',
    'course_id',
    'user_email',
    'user_first_name',
    'user_last_name',
    'pronouns',
    'team_id',
    'role',
    'created_at',
  ],
};

const ListTeamsSchema = {
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

const GetTeamSchema = {
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

const GetTeamMembersSchema = {
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
        members: createArrayReponseSchema(TeamMemberDetails),
      },
      required: ['members'],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const CreateTeamSchema = {
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

const UpdateTeamSchema = {
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

const DeleteTeamSchema = {
  summary: 'Delete a team',
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
    204: { type: 'null' },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const AddMembersSchema = {
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

const UpdateMembersSchema = {
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

const RemoveMembersSchema = {
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

module.exports = {
  TeamMemberRef,
  TeamInfo,
  CreateTeamBody,
  UpdateTeamBody,
  AddMembersBody,
  UpdateMembersBody,
  RemoveMembersBody,
  ListTeamsSchema,
  GetTeamSchema,
  GetTeamMembersSchema,
  CreateTeamSchema,
  UpdateTeamSchema,
  DeleteTeamSchema,
  AddMembersSchema,
  UpdateMembersSchema,
  RemoveMembersSchema,
};
