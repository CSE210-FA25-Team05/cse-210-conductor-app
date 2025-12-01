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
    user_first_name: { type: 'string' },
    user_last_name: { type: 'string' },
    pulse_config_id: { type: 'integer' },
    value: { type: 'string' },
    description: { type: 'string' },
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

const GetPulsesSchema = {
  summary: 'Get Pulse Records for User in Course',
  tags: ['Pulse'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
    },
    required: ['course_id'],
  },
  querystring: {
    type: 'object',
    properties: {
      team_id: { type: 'integer' },
      user_id: { type: 'integer' },
      entire_class: { type: 'boolean' },
      values: createArrayReponseSchema({ type: 'string' }),
    },
  },
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

module.exports = {
  GetPulseConfigSchema,
  UpdatePulseConfigSchema,
  CreatePulseSchema,
  GetPulsesSchema,
};
