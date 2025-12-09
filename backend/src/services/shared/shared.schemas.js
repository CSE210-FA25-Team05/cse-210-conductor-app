export const DateType = { type: 'string', format: 'date' };
export const DateTimeType = { type: 'string', format: 'date-time' };

export const ErrorSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
  required: ['error'],
};

export const createArrayReponseSchema = (itemSchema) => ({
  type: 'array',
  items: itemSchema,
});

export const CourseUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    user_id: { type: 'number' },
    course_id: { type: 'number' },
    user_email: { type: 'string' },
    user_first_name: { type: 'string', nullable: true },
    user_last_name: { type: 'string', nullable: true },
    pronouns: { type: 'string', nullable: true },
    team_id: { type: 'number', nullable: true },
    role: { type: 'string' },
    created_at: DateTimeType,
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
