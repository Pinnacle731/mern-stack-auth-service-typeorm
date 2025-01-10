import express from 'express';
import { Roles } from '../types';
import { canAccess } from '../middlewares/canAccess';
import authenticate from '../middlewares/authenticate';
import { validate } from '../Validator/ValidationChain';
import createUserValidatore from '../Validator/create-user-validatore';
import {
  CreateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  UpdateUser,
} from '../controllers/UserController';
import updateUserValidator from '../Validator/update-user-validator';
import listUsersValidator from '../Validator/list-users-validator';

const router = express.Router();

router.post(
  '/',
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  validate(createUserValidatore),
  CreateUser,
);

router.patch(
  '/:id',
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  validate(updateUserValidator),
  UpdateUser,
);

router.get(
  '/',
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  listUsersValidator,
  getAllUsers,
);

router.get(
  '/:id',
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  getUserById,
);

router.delete(
  '/:id',
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  deleteUser,
);

export default router;
