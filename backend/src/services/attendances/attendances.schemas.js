import { ErrorSchema } from '../shared/shared.schemas.js';

export const CreateAttendanceParams = {
  type: 'object',
  properties: {
    user_id: { type: 'integer' },
    code: { type: 'string', nullable: true }, // Required for students, optional for professors/TAs
    update_reason: { type: 'string', nullable: true },
  },
  required: ['user_id'],
};

export const UpdateAttendanceParams = {
  type: 'object',
  properties: {
    update_reason: { type: 'string', nullable: true },
  },
};
export const AttendanceInfo = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    course_id: { type: 'number' },
    lecture_id: { type: 'number' },
    user_id: { type: 'number' },
    updated_by: { type: 'number', nullable: true },
    update_reason: { type: 'string', nullable: true },
  },
  required: ['id', 'course_id', 'lecture_id', 'user_id'],
};

export const CreateAttendanceSchema = {
  summary: 'Create a new attendance record',
  tags: ['Attendances'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      lecture_id: { type: 'integer' },
    },
    required: ['course_id', 'lecture_id'],
  },
  body: CreateAttendanceParams,
  response: {
    201: AttendanceInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    409: ErrorSchema,
  },
};

export const UpdateAttendanceSchema = {
  summary: 'Update an attendance record',
  tags: ['Attendances'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      lecture_id: { type: 'integer' },
      attendance_id: { type: 'integer' },
    },
    required: ['course_id', 'lecture_id', 'attendance_id'],
  },
  body: UpdateAttendanceParams,
  response: {
    200: AttendanceInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const DeleteAttendanceSchema = {
  summary: 'Delete an attendance record',
  tags: ['Attendances'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      lecture_id: { type: 'integer' },
      attendance_id: { type: 'integer' },
    },
    required: ['course_id', 'lecture_id', 'attendance_id'],
  },
  body: false,
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      required: ['message'],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};
