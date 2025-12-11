import {
  createArrayReponseSchema,
  DateTimeType,
  DateType,
  ErrorSchema,
} from '../shared/shared.schemas.js';

export const JournalEntryType = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    user_id: { type: 'number' },
    course_id: { type: 'number' },
    title: { type: 'string' },
    content: { type: 'string' },
    created_at: DateTimeType,
    updated_at: DateTimeType,
  },
  required: ['id', 'user_id', 'course_id', 'title', 'content'],
};

const JournalFiltersSchema = {
  type: 'object',
  properties: {
    user_id: { type: 'integer' },
    team_id: { type: 'integer' },
    entire_class: { type: 'boolean' },
    start_date: DateTimeType,
    end_date: DateTimeType,
  },
};

export const GetJournalByCourseSchema = {
  summary: 'Get all journal entries for a specific course',
  tags: ['Journals'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
    },
    required: ['course_id'],
  },
  querystring: JournalFiltersSchema,
  response: {
    200: createArrayReponseSchema(JournalEntryType),
    400: ErrorSchema,
  },
};

export const GetJournalByIdSchema = {
  summary: 'Get a journal entry by its ID',
  tags: ['Journals'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
      journal_id: { type: 'number' },
    },
    required: ['course_id', 'journal_id'],
  },
  response: {
    200: JournalEntryType,
    400: ErrorSchema,
  },
};

export const GetJournalsByUserSchema = {
  summary: '(Deprecated) Get journal entries for a specific user in a course',
  tags: ['Journals'],
  params: {
    type: 'object',
    properties: {
      user_id: { type: 'number' },
      course_id: { type: 'number' },
    },
    required: ['user_id', 'course_id'],
  },
  response: {
    200: createArrayReponseSchema(JournalEntryType),
    400: ErrorSchema,
  },
};

export const CreateJournalSchema = {
  summary: 'Create a new journal entry',
  tags: ['Journals'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
    },
    required: ['course_id'],
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      content: { type: 'string' },
      user_id: { type: 'number' },
    },
    required: ['title', 'content', 'user_id'],
  },
  response: {
    201: JournalEntryType,
    400: ErrorSchema,
  },
};

export const UpdateJournalSchema = {
  summary: 'Update an existing journal entry',
  tags: ['Journals'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
      journal_id: { type: 'number' },
    },
    required: ['course_id', 'journal_id'],
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      content: { type: 'string' },
    },
    required: ['title', 'content'],
  },
  response: {
    200: JournalEntryType,
    400: ErrorSchema,
  },
};

export const DeleteJournalSchema = {
  summary: 'Delete a journal entry',
  tags: ['Journals'],
  params: {
    type: 'object',
    properties: {
      course_id: { type: 'number' },
      journal_id: { type: 'number' },
    },
    required: ['course_id', 'journal_id'],
  },
  response: {
    204: { type: 'null' },
    400: ErrorSchema,
  },
};

export const journalSchemas = {
  GetJournalByCourseSchema,
  GetJournalByIdSchema,
  GetJournalsByUserSchema,
  CreateJournalSchema,
  UpdateJournalSchema,
  DeleteJournalSchema,
};
