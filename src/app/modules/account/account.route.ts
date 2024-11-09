import express from 'express';
import { AccountController } from './account.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';

const routes = express.Router();

routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  AccountController.getSingelAccount
);

export const AccountRoute = { routes };
