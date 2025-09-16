import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { MarginController } from './reportMargin.controller';
const routes = express.Router();

routes.post('/', auth(ENUM_USER_PEMISSION.USER), MarginController.CreateMargin);
routes.get('/', auth(ENUM_USER_PEMISSION.USER), MarginController.getMargin);

export const ReportMarginsRoutes = { routes };
