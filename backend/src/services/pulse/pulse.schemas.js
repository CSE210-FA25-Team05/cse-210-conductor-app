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

const PulseConfigSchema = {
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

const GetPulseConfigSchema = {
  summary: 'Get Pulse Configuration for Course',
  tags: ['Pulse'],
  params: CourseParams,
  response: {
    200: PulseConfigSchema,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const UpdatePulseConfigSchema = {
  summary: 'Update Pulse Configuration for Course',
  tags: ['Pulse'],
  params: CourseParams,
  body: ConfigJsonSchema,
  response: {
    200: PulseConfigSchema,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    422: ErrorSchema,
  },
};

const CreatePulseBody = {
  type: 'object',
  properties: {
    option: { type: 'string' },
    description: { type: 'string' },
  },
  required: ['option'],
};

const PulseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    course_id: { type: 'integer' },
    user_id: { type: 'integer' },
    team_id: { type: 'integer', nullable: true },
    user_first_name: { type: 'string', nullable: true },
    user_last_name: { type: 'string', nullable: true },
    pulse_config_id: { type: 'integer' },
    value: { type: 'string' },
    description: { type: 'string', nullable: true },
    created_at: DateTimeType,
  },
  required: [
    'id',
    'course_id',
    'user_id',
    'team_id',
    'user_first_name',
    'user_last_name',
    'pulse_config_id',
    'value',
    'description',
    'created_at',
  ],
};

const CreatePulseSchema = {
  summary: 'Create Pulse Record for Course',
  tags: ['Pulse'],
  params: CourseParams,
  body: CreatePulseBody,
  response: {
    201: PulseSchema,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const PulseFiltersSchema = {
  type: 'object',
  properties: {
    team_id: { type: 'integer' },
    user_id: { type: 'integer' },
    entire_class: { type: 'boolean' },
    values: createArrayReponseSchema({ type: 'string' }),
    start_date: DateTimeType,
    end_date: DateTimeType,
  },
};

const GetPulsesSchema = {
  summary: 'Get Pulse Records',
  tags: ['Pulse'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
    },
    required: ['course_id'],
  },
  querystring: PulseFiltersSchema,
  response: {
    200: {
      type: 'array',
      items: PulseSchema,
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

const PulseStatsQuerySchema = {
  type: 'object',
  properties: {
    team_id: { type: 'integer' },
    user_id: { type: 'integer' },
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

const GetPulseStatsSchema = {
  summary: 'Get Pulse Stats',
  tags: ['Pulse'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
    },
    required: ['course_id'],
  },
  querystring: PulseStatsQuerySchema,
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
  GetPulseConfigSchema,
  UpdatePulseConfigSchema,
  CreatePulseSchema,
  GetPulsesSchema,
  GetPulseStatsSchema,
};
