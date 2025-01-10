import express from 'express';
import {
  deleteTenant,
  getAllTenants,
  getTenantById,
  tenantCreate,
  updateTenant,
} from '../controllers/TenantsController';
import tenantsValidator from '../Validator/tenants-validator';
import { validate } from '../Validator/ValidationChain';
import authenticate from '../middlewares/authenticate';
import { Roles } from '../types';
import { canAccess } from '../middlewares/canAccess';
import listUsersValidator from '../Validator/list-users-validator';

const router = express.Router();

router.post(
  '/',
  authenticate,
  canAccess([Roles.ADMIN]),
  validate(tenantsValidator),
  tenantCreate,
);
router.patch(
  '/:id',
  authenticate,
  canAccess([Roles.ADMIN]),
  validate(tenantsValidator),
  updateTenant,
);
router.get('/', listUsersValidator, getAllTenants);
router.get('/:id', authenticate, canAccess([Roles.ADMIN]), getTenantById);
router.delete('/:id', authenticate, canAccess([Roles.ADMIN]), deleteTenant);

export default router;
