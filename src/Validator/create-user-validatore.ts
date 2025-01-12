import { checkSchema } from 'express-validator';
import {
  emailValidator,
  nameValidator,
  passwordValidator,
  roleValidator,
  userNameValidator,
} from './common-validators';

export default checkSchema({
  ...userNameValidator,
  ...emailValidator,
  ...passwordValidator,
  ...nameValidator('firstName'),
  ...nameValidator('lastName'),
  ...roleValidator,
});
