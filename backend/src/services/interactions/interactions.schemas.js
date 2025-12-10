'use strict';

const {
  ErrorSchema,
  DateTimeType,
  createArrayReponseSchema,
} = require('../shared/shared.schemas');

const CourseParams = {
  type: 'object',
  properties: {
    course_id: { type: 'integer' },
  },
  required: ['course_id'],
};

const ConfigOptionSchema = {
  type: 'object',
  properties: {
    value: { type: 'string' },
    color: { type: 'string' },
  },
  required: ['value', 'color'],
};

const ConfigJsonSchema = {
  type: 'object',
  properties: {
    options: { type: 'array', items: ConfigOptionSchema, minItems: 2 },
  },
  required: ['options'],
};

const InteractionConfigSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    course_id: { type: 'integer' },
    config: ConfigJsonSchema,
    is_editable: { type: 'boolean' },
    created_at: DateTimeType,
    updated_at: DateTimeType,
  },
  required: [
    'id',
    'course_id',
    'config',
    'is_editable',
    'created_at',
    'updated_at',
  ],
};

const GetInteractionConfigSchema = {
  summary: 'Get Interaction Configuration for Course',
  tags: ['Interaction'],
  params: CourseParams,
  response: {
    200: InteractionConfigSchema,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const UpdateInteractionConfigSchema = {
  summary: 'Update Interaction Configuration for Course',
  tags: ['Interaction'],
  params: CourseParams,
  body: ConfigJsonSchema,
  response: {
    200: InteractionConfigSchema,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    422: ErrorSchema,
  },
};

const CreateInteractionBody = {
  type: 'object',
  properties: {
    option: { type: 'string' },
    description: { type: 'string' },
    participants: {
      type: 'array',
      items: { type: 'integer' },
      minItems: 1,
      uniqueItems: true,
    },
  },
  required: ['option', 'participants'],
};

const InteractionParticipantSchema = {
  type: 'object',
  properties: {
    user_id: { type: 'integer' },
    first_name: { type: 'string', nullable: true },
    last_name: { type: 'string', nullable: true },
  },
  required: ['user_id', 'first_name', 'last_name'],
};

const InteractionSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    course_id: { type: 'integer' },
    author_id: { type: 'integer' },
    author_first_name: { type: 'string', nullable: true },
    author_last_name: { type: 'string', nullable: true },
    interaction_config_id: { type: 'integer' },
    value: { type: 'string' },
    description: { type: 'string', nullable: true },
    participants: {
      type: 'array',
      items: InteractionParticipantSchema,
    },
    created_at: DateTimeType,
  },
  required: [
    'id',
    'course_id',
    'author_id',
    'author_first_name',
    'author_last_name',
    'interaction_config_id',
    'value',
    'description',
    'participants',
    'created_at',
  ],
};

const CreateInteractionSchema = {
  summary: 'Create Interaction Record for Course',
  tags: ['Interaction'],
  params: CourseParams,
  body: CreateInteractionBody,
  response: {
    201: InteractionSchema,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    422: ErrorSchema,
  },
};

const UpdateInteractionBody = {
  type: 'object',
  properties: {
    option: { type: 'string' },
    description: { type: 'string' },
    participants: {
      type: 'array',
      items: { type: 'integer' },
      minItems: 1,
      uniqueItems: true,
    },
  },
};

const UpdateInteractionSchema = {
  summary: 'Update Interaction Record for Course',
  tags: ['Interaction'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      interaction_id: { type: 'integer' },
    },
    required: ['course_id', 'interaction_id'],
  },
  body: UpdateInteractionBody,
  response: {
    200: InteractionSchema,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    422: ErrorSchema,
  },
};

const DeleteInteractionSchema = {
  summary: 'Delete Interaction Record for Course',
  tags: ['Interaction'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      interaction_id: { type: 'integer' },
    },
    required: ['course_id', 'interaction_id'],
  },
  response: {
    204: { type: 'null' },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const InteractionFiltersSchema = {
  type: 'object',
  properties: {
    author_id: { type: 'integer' },
    entire_class: { type: 'boolean' },
    values: createArrayReponseSchema({ type: 'string' }),
    start_date: DateTimeType,
    end_date: DateTimeType,
  },
};

const GetInteractionsSchema = {
  summary: 'Get Interaction Records',
  tags: ['Interaction'],
  params: CourseParams,
  querystring: InteractionFiltersSchema,
  response: {
    200: {
      type: 'array',
      items: InteractionSchema,
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const InteractionStatsQuerySchema = {
  type: 'object',
  properties: {
    author_id: { type: 'integer' },
    entire_class: { type: 'boolean' },
    values: createArrayReponseSchema({ type: 'string' }),
    start_date: DateTimeType,
    end_date: DateTimeType,
    bucket: {
      type: 'string',
      enum: ['hour', 'day', 'week', 'month'],
    },
  },
};

const GetInteractionStatsSchema = {
  summary: 'Get Interaction Stats',
  tags: ['Interaction'],
  params: CourseParams,
  querystring: InteractionStatsQuerySchema,
  response: {
    200: {
      type: 'object',
      properties: {
        stats: createArrayReponseSchema({
          type: 'object',
          properties: {
            bucket: DateTimeType,
            value: { type: 'string' },
            count: { type: 'integer' },
          },
          required: ['bucket', 'value', 'count'],
        }),
      },
      required: ['stats'],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

module.exports = {
  GetInteractionConfigSchema,
  UpdateInteractionConfigSchema,
  CreateInteractionSchema,
  GetInteractionsSchema,
  GetInteractionStatsSchema,
  UpdateInteractionSchema,
  DeleteInteractionSchema,
};
