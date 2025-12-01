import {
  createArrayReponseSchema,
  DateType,
  DateTimeType,
  ErrorSchema,
} from '../shared/shared.schemas.js';

export const CreateLectureParams = {
  type: 'object',
  properties: {
    lecture_date: DateType,
  },
  required: ['lecture_date'],
};

export const UpdateLectureParams = {
  type: 'object',
  properties: {
    lecture_date: DateType,
    regenerate_code: { type: 'boolean' },
  },
};

export const LectureInfo = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    course_id: { type: 'number' },
    lecture_date: DateType,
    code: { type: 'string', nullable: true },
    code_generated_at: DateTimeType,
    code_expires_at: DateTimeType,
  },
  required: ['id', 'course_id', 'lecture_date'], // code is optional (can be null before activation)
};

export const GetAllLecturesSchema = {
  summary: 'Get all lectures for a course',
  tags: ['Lectures'],
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
        lectures: createArrayReponseSchema(LectureInfo),
      },
      required: ['lectures'],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const GetLectureSchema = {
  summary: 'Get a lecture by ID',
  tags: ['Lectures'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      lecture_id: { type: 'integer' },
    },
    required: ['course_id', 'lecture_id'],
  },
  response: {
    200: LectureInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const CreateLectureSchema = {
  summary: 'Create a new lecture',
  tags: ['Lectures'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
    },
    required: ['course_id'],
  },
  body: CreateLectureParams,
  response: {
    201: LectureInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const UpdateLectureSchema = {
  summary: 'Update a lecture',
  tags: ['Lectures'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      lecture_id: { type: 'integer' },
    },
    required: ['course_id', 'lecture_id'],
  },
  body: UpdateLectureParams,
  response: {
    200: LectureInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const DeleteLectureSchema = {
  summary: 'Delete a lecture',
  tags: ['Lectures'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      lecture_id: { type: 'integer' },
    },
    required: ['course_id', 'lecture_id'],
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

export const ActivateAttendanceSchema = {
  summary: 'Activate attendance for a lecture (generate code and start 5-minute timer)',
  tags: ['Lectures'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
      lecture_id: { type: 'integer' },
    },
    required: ['course_id', 'lecture_id'],
  },
  body: false,
  response: {
    200: LectureInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    409: ErrorSchema,
  },
};
