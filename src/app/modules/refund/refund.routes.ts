import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { RefundController } from './refund.controller';

const routes = express.Router();
routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_ORDER),
  RefundController.create
);
routes.get('/', auth(ENUM_USER_PEMISSION.USER), RefundController.getAll);

export const RefundRoutes = { routes };
