import { checkSchema } from 'express-validator';
import {
  roleValidator,
  tenantIdUpdateValidator,
  emailValidator,
  nameValidator,
  userNameValidator,
} from './common-validators';

export default checkSchema({
  ...userNameValidator,
  ...emailValidator,
  ...nameValidator('firstName'),
  ...nameValidator('lastName'),
  ...roleValidator,
  ...tenantIdUpdateValidator,
});
