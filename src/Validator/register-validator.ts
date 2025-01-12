import { checkSchema } from 'express-validator';
import {
  emailValidator,
  nameValidator,
  passwordValidator,
  userNameValidator,
} from './common-validators';

export default checkSchema({
  ...userNameValidator,
  ...nameValidator('firstName'),
  ...nameValidator('lastName'),
  ...emailValidator,
  ...passwordValidator,
});
