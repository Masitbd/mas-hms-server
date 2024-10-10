import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { ReportGroupController } from './reportGroup.controller';

const routes = express.Router();

routes.get(
  '/',
  auth(ENUM_USER_PEMISSION.USER),
  ReportGroupController.getAllReportGroup
);

routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_REPORT_GROUP),
  ReportGroupController.createReportGroup
);

routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  ReportGroupController.getSingleReportGroup
);

routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_REPORT_GROUP),
  ReportGroupController.updateReportGroup
);

routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_REPORT_GROUP),
  ReportGroupController.deleteReportGroup
);

export const ReportGroupRoutes = { routes };
