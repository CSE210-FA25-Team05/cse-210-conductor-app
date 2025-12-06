// backend/src/services/teams/teams.schemas.js
'use strict';

const {
  createArrayReponseSchema,
  ErrorSchema,
  CourseUserSchema,
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

// TA assignment body: { ids: [ta_user_id, ...] }
const TAIdsBody = {
  type: 'object',
  properties: {
    ids: {
      type: 'array',
      items: { type: 'integer' },
    },
  },
  required: ['ids'],
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
        members: createArrayReponseSchema(CourseUserSchema),
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

// =========================================
// TA assignment schemas
// =========================================

const GetTeamTAsSchema = {
  summary: 'Get TAs assigned to a team',
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
        tas: createArrayReponseSchema({
          // ta_teams record + nested users
          type: 'object',
          additionalProperties: true,
        }),
      },
      required: ['tas'],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const AssignTeamTAsSchema = {
  summary: 'Assign TAs to a team',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      team_id: { type: 'integer' },
    },
    required: ['course_id', 'team_id'],
  },
  body: TAIdsBody,
  response: {
    204: { type: 'null' },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const RemoveTeamTAsSchema = {
  summary: 'Remove TAs from a team',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      team_id: { type: 'integer' },
    },
    required: ['course_id', 'team_id'],
  },
  body: TAIdsBody,
  response: {
    204: { type: 'null' },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const GetTeamsForTASchema = {
  summary: 'Get teams assigned to a TA in a course',
  tags: ['Teams'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      ta_user_id: { type: 'integer' },
    },
    required: ['course_id', 'ta_user_id'],
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

module.exports = {
  TeamMemberRef,
  TeamInfo,
  CreateTeamBody,
  UpdateTeamBody,
  AddMembersBody,
  UpdateMembersBody,
  RemoveMembersBody,
  TAIdsBody,
  ListTeamsSchema,
  GetTeamSchema,
  GetTeamMembersSchema,
  CreateTeamSchema,
  UpdateTeamSchema,
  DeleteTeamSchema,
  AddMembersSchema,
  UpdateMembersSchema,
  RemoveMembersSchema,
  GetTeamTAsSchema,
  AssignTeamTAsSchema,
  RemoveTeamTAsSchema,
  GetTeamsForTASchema,
};
