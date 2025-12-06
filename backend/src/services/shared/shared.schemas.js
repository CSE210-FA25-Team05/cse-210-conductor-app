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
