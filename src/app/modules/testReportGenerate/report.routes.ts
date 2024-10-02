import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { ReportContorller } from './report.controller';
const routes = express.Router();

routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_LAB_REPORTS),
  ReportContorller.create
);
routes.patch(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_LAB_REPORTS),
  ReportContorller.update
);
routes.get('/:oid', auth(ENUM_USER_PEMISSION.USER), ReportContorller.getSingle);
routes.get('/', auth(ENUM_USER_PEMISSION.USER), ReportContorller.getAll);

export const ReportRoutes = { routes };
