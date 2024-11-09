import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { ReportTypeController } from './reportTypeController';
const routes = express.Router();
routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_REPORT_TYPE),
  ReportTypeController.postNewReportType
);
routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_REPORT_TYPE),
  ReportTypeController.updateReportType
);
routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  ReportTypeController.getSingleReportType
);
routes.get(
  '/',
  auth(ENUM_USER_PEMISSION.USER),
  ReportTypeController.getAllReportType
);

export const reportTypeRoutes = { routes };
