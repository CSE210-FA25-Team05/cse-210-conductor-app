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
  required: [
    'id',
    'course_id',
    'lecture_id',
    'user_id',
    'updated_by',
    'update_reason',
  ],
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

export const GetAttendancesSchema = {
  summary: 'Get all attendances for a lecture',
  tags: ['Attendances'],
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
        attendances: {
          type: 'array',
          items: AttendanceInfo,
        },
      },
      required: ['attendances'],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const GetAttendanceStatsSchema = {
  summary: 'Get attendance statistics for a lecture',
  tags: ['Attendances'],
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
        total_enrolled: { type: 'number' },
        total_present: { type: 'number' },
        attendance_percentage: { type: 'number' },
      },
      required: ['total_enrolled', 'total_present', 'attendance_percentage'],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const CreateAttendanceByCodeParams = {
  type: 'object',
  properties: {
    code: { type: 'string' },
  },
  required: ['code'],
};

export const CreateAttendanceByCodeSchema = {
  summary: 'Create attendance by code (simplified flow for students)',
  tags: ['Attendances'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'integer' },
    },
    required: ['course_id'],
  },
  body: CreateAttendanceByCodeParams,
  response: {
    201: AttendanceInfo,
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    409: ErrorSchema,
    410: ErrorSchema,
  },
};

export const GetStudentAttendanceStatsSchema = {
  summary: 'Get student attendance statistics for a course',
  tags: ['Attendances'],
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
      start_time: { type: 'string', format: 'date' },
      end_time: { type: 'string', format: 'date' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            total_lectures: { type: 'number' },
            present: { type: 'number' },
            absent: { type: 'number' },
            attendance_percentage: { type: 'number' },
          },
          required: [
            'total_lectures',
            'present',
            'absent',
            'attendance_percentage',
          ],
        },
        lectures: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lecture_id: { type: 'number' },
              lecture_date: { type: 'string' },
              attended: { type: 'boolean' },
              attendance_id: { type: ['number', 'null'] },
              attendance_created_at: { type: ['string', 'null'] },
            },
            required: [
              'lecture_id',
              'lecture_date',
              'attended',
              'attendance_id',
              'attendance_created_at',
            ],
          },
        },
      },
      required: ['summary', 'lectures'],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};

export const GetCourseAttendanceStatsSchema = {
  summary:
    'Get attendance statistics for a course (student view or class-wide for professors/TAs)',
  tags: ['Attendances'],
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
      start_time: { type: 'string', format: 'date' },
      end_time: { type: 'string', format: 'date' },
    },
  },
  response: {
    200: {
      oneOf: [
        // Student response
        {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                total_lectures: { type: 'number' },
                present: { type: 'number' },
                absent: { type: 'number' },
                attendance_percentage: { type: 'number' },
              },
              required: [
                'total_lectures',
                'present',
                'absent',
                'attendance_percentage',
              ],
            },
            lectures: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  lecture_id: { type: 'number' },
                  lecture_date: { type: 'string' },
                  attended: { type: 'boolean' },
                  attendance_id: { type: ['number', 'null'] },
                  attendance_created_at: { type: ['string', 'null'] },
                },
                required: [
                  'lecture_id',
                  'lecture_date',
                  'attended',
                  'attendance_id',
                  'attendance_created_at',
                ],
              },
            },
          },
          required: ['summary', 'lectures'],
        },
        // Professor/TA response
        {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                total_lectures: { type: 'number' },
                total_enrolled: { type: 'number' },
                total_attendances: { type: 'number' },
                total_possible_attendances: { type: 'number' },
                overall_attendance_percentage: { type: 'number' },
                average_lecture_attendance: { type: 'number' },
              },
              required: [
                'total_lectures',
                'total_enrolled',
                'total_attendances',
                'total_possible_attendances',
                'overall_attendance_percentage',
                'average_lecture_attendance',
              ],
            },
            trend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  lecture_id: { type: 'number' },
                  lecture_date: { type: 'string' },
                  total_enrolled: { type: 'number' },
                  total_present: { type: 'number' },
                  attendance_percentage: { type: 'number' },
                },
                required: [
                  'lecture_id',
                  'lecture_date',
                  'total_enrolled',
                  'total_present',
                  'attendance_percentage',
                ],
              },
            },
          },
          required: ['summary', 'trend'],
        },
      ],
    },
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
  },
};
