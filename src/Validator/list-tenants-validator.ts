import { checkSchema } from 'express-validator';

export default checkSchema(
  {
    q: {
      trim: true,
      customSanitizer: {
        options: (value: unknown) => value || '',
      },
    },
    currentPage: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);
          return parsedValue || 1;
        },
      },
    },
    perPage: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);
          return parsedValue || 6;
        },
      },
    },
  },
  ['query'],
);
