import { checkSchema } from 'express-validator';

export default checkSchema({
  userName: {
    in: ['body'],
    trim: true,
    optional: false,
    notEmpty: {
      errorMessage: 'Username is required',
    },
    matches: {
      options: [/^[a-zA-Z0-9]+$/],
      errorMessage: 'Username must only contain alphanumeric characters',
    },
    isString: {
      errorMessage: 'Username must be a string',
    },
    isLength: {
      options: { min: 3, max: 15 },
      errorMessage: 'Username must be between 3 and 15 characters',
    },
  },
  email: {
    in: ['body'], // Specify the field location in the request
    trim: true,
    notEmpty: {
      errorMessage: 'Email is Required',
    },
    isEmail: {
      errorMessage: 'Invalid email format', // Custom error message
    },
    optional: false, // Make the email field required
    matches: {
      options: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/], // Custom regex for email
      errorMessage: 'Email does not match the required format',
    },
  },
  password: {
    in: ['body'],
    optional: false,
    trim: true,
    notEmpty: {
      errorMessage: 'Password is required',
    },
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long',
    },
    matches: {
      options: [/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_])/],
      errorMessage:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  },
});
