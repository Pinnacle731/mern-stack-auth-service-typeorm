export const Roles = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MANAGER: 'manager',
} as const;

export const saltRounds = 10;

export const NODE_ENV_VAL = {
  DEVELOPMENT: 'dev',
  PRODUCTION: 'prod',
  TEST: 'test',
};
