import {
  createArrayReponseSchema,
  DateTimeType,
  DateType,
  ErrorSchema,
} from '../shared/shared.schemas.js';

export const CreateLectureParams = {
  type: 'object',
  properties: {
    lecture_date: DateType,
    code: { type: 'string', nullable: true },
  },
  required: ['lecture_date'],
};

export const UpdateLectureParams = {
  type: 'object',
  properties: {
    lecture_date: DateType,
    code: { type: 'string', nullable: true },
  },
};

export const LectureInfo = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    course_id: { type: 'number' },
    lecture_date: DateType,
    code: { type: 'string', nullable: true },
    created_at: DateTimeType,
    updated_at: DateTimeType,
    deleted_at: { type: 'string', format: 'date-time', nullable: true },
  },
  required: ['id', 'course_id', 'lecture_date', 'created_at', 'updated_at'],
};

export const GetAllLecturesSchema = {
  summary: 'Get all lectures for a course',
  tags: ['Lectures'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
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
      course_id: { type: 'number' },
      lecture_id: { type: 'number' },
    },
    required: ['course_id', 'lecture_id'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        lecture: LectureInfo,
      },
      required: ['lecture'],
    },
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
      course_id: { type: 'number' },
    },
    required: ['course_id'],
  },
  body: CreateLectureParams,
  response: {
    201: {
      type: 'object',
      properties: {
        lecture: LectureInfo,
      },
      required: ['lecture'],
    },
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
      course_id: { type: 'number' },
      lecture_id: { type: 'number' },
    },
    required: ['course_id', 'lecture_id'],
  },
  body: UpdateLectureParams,
  response: {
    200: {
      type: 'object',
      properties: {
        lecture: LectureInfo,
      },
      required: ['lecture'],
    },
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
