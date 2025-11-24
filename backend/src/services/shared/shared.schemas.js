export const DateType = { type: 'string', format: 'date' };
export const DateTimeType = { type: 'string', format: 'date-time' };

export const ErrorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
  },
  required: ['error'],
};

export const createArrayReponseSchema = (itemSchema) => ({
  type: 'array',
  items: itemSchema,
});
