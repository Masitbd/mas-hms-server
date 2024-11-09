import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { MiscellaneousController } from './miscellaneous.controller';

const routes = express.Router();

routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.USER),
  MiscellaneousController.create
);
routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  MiscellaneousController.getSingle
);
routes.get('/', MiscellaneousController.getAll);
// marging data
routes.get(
  '/page/margin-data',
  auth(ENUM_USER_PEMISSION.USER),
  MiscellaneousController.getMarginData
);
routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  MiscellaneousController.update
);
routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  MiscellaneousController.remove
);

export const MiscellaneousRoutes = { routes };
