import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { VacuumTubeControllers } from './vacuumTube.controllers';
import { VacuumTubeValidation } from './vacuumTube.validatorst';
const routes = express.Router();

routes.get(
  '/',
  auth(ENUM_USER_PEMISSION.USER),
  VacuumTubeControllers.getAllVacuumTube
);

routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  VacuumTubeControllers.getSingleVacuumTube
);

routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_ORDER, ENUM_USER_PEMISSION.MANAGE_TESTS),
  validateRequest(VacuumTubeValidation.VacuumTubeValidator),
  VacuumTubeControllers.createVacuumTube
);

routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_ORDER, ENUM_USER_PEMISSION.MANAGE_TESTS),
  validateRequest(VacuumTubeValidation.VacuumTubeValidatorForUpdate),
  VacuumTubeControllers.updateVacuumTube
);

routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_ORDER, ENUM_USER_PEMISSION.MANAGE_TESTS),
  VacuumTubeControllers.deleteVacuumTube
);

export const VacuumRoutes = {
  routes,
};
