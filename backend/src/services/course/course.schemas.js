import {
  createArrayReponseSchema,
  DateTimeType,
  DateType,
  ErrorSchema,
} from '../shared/shared.schemas.js';

export const JoinCodeType = { type: 'string', minLength: 6, maxLength: 6 };

export const CreateCourseParams = {
  type: 'object',
  properties: {
    course_code: { type: 'string' },
    course_name: { type: 'string' },
    term: { type: 'string' },
    section: { type: 'string', default: '1' },
    join_code: JoinCodeType,
    start_date: DateType,
    end_date: DateType,
  },
  required: ['course_code', 'course_name', 'term', 'start_date', 'end_date'],
};

export const UpdateCourseParams = {
  type: 'object',
  properties: {
    course_code: { type: 'string' },
    course_name: { type: 'string' },
    term: { type: 'string' },
    section: { type: 'string' },
    join_code: JoinCodeType,
    start_date: DateType,
    end_date: DateType,
  },
};

export const CourseInfo = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    course_code: { type: 'string' },
    course_name: { type: 'string' },
    term: { type: 'string' },
    section: { type: 'string' },
    join_code: JoinCodeType,
    start_date: DateType,
    end_date: DateType,
  },
  required: [
    'id',
    'course_code',
    'course_name',
    'term',
    'section',
    'join_code',
    'start_date',
    'end_date',
  ],
};

export const AddEnrollmentParams = {
  type: 'object',
  properties: {
    user_id: { type: 'number' },
    team_id: { type: 'number', nullable: true },
    role: { type: 'string', default: 'student' },
  },
  required: ['user_id'],
};

export const UpdateEnrollmentParams = {
  type: 'object',
  properties: {
    role: { type: 'string' },
  },
  required: ['role'],
};

export const EnrollmentInfo = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    user_id: { type: 'number' },
    course_id: { type: 'number' },
    team_id: { type: 'number' },
    role: { type: 'string' },
    created_at: DateTimeType,
  },
  required: ['id', 'user_id', 'course_id', 'team_id', 'created_at', 'role'],
};

export const GetAllCoursesSchema = {
  summary: 'Get all courses',
  tags: ['Courses'],
  response: {
    200: createArrayReponseSchema(CourseInfo),
    401: ErrorSchema,
  },
};

export const GetCourseSchema = {
  summary: 'Get a course with id',
  tags: ['Courses'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
    },
  },
  response: {
    200: CourseInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const GetCourseUsersSchema = {
  summary: 'Get a list of users in a course',
  tags: ['Courses'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
    },
  },
  response: {
    200: createArrayReponseSchema(EnrollmentInfo),
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const GetCourseUserSchema = {
  summary: 'Get a user in a course',
  tags: ['Courses'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
      user_id: { type: 'number' },
    },
  },
  response: {
    200: EnrollmentInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const CreateCourseSchema = {
  summary: 'Create a course',
  tags: ['Courses'],
  body: CreateCourseParams,
  response: {
    201: CourseInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    409: ErrorSchema,
  },
};

export const UpdateCourseSchema = {
  summary: 'Update a course with id',
  tags: ['Courses'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
    },
  },
  body: UpdateCourseParams,
  response: {
    200: CourseInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    409: ErrorSchema,
  },
};

export const DeleteCourseSchema = {
  summary: 'Delete a course with id',
  tags: ['Courses'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const AddUserInCourseSchema = {
  summary: 'Add a user in a course',
  tags: ['Courses'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    properties: {
      user_id: { type: 'number' },
    },
    required: ['user_id'],
  },
  response: {
    201: EnrollmentInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const JoinCourseSchema = {
  summary: 'Join a course using the course code',
  tags: ['Courses'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
    },
  },
  body: {
    type: 'object',
    properties: {
      join_code: JoinCodeType,
      user_id: { type: 'number' },
    },
    required: ['join_code'],
  },
  response: {
    200: EnrollmentInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const UpdateUserInCourseSchema = {
  summary: 'Update user enrollment in a course',
  tags: ['Courses'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
      user_id: { type: 'number' },
    },
  },
  body: UpdateEnrollmentParams,
  response: {
    200: EnrollmentInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    422: ErrorSchema,
  },
};

export const RemoveUserFromCourseSchema = {
  summary: 'Remove a user from a course',
  tags: ['Courses'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
      user_id: { type: 'number' },
    },
  },
  response: {
    204: { type: 'null' },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};
