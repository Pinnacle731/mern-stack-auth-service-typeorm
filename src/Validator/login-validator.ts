import { checkSchema } from 'express-validator';
import {
  emailValidator,
  passwordValidator,
  userNameValidator,
} from './common-validators';

export default checkSchema({
  ...userNameValidator,
  ...emailValidator,
  ...passwordValidator,
});
