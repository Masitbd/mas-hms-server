import express from 'express';

import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DoctorControllers } from './doctor.controller';
import { DoctorValidation } from './doctor.validation';

const routes = express.Router();

routes.get('/', auth(ENUM_USER_PEMISSION.USER), DoctorControllers.getDoctor);

routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  DoctorControllers.getSingleDoctor
);

routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_DOCTORS),
  DoctorControllers.createDoctor
);

routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_DOCTORS),
  validateRequest(DoctorValidation.DoctorValidatorForUpdate),
  DoctorControllers.updateDoctor
);

routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_DOCTORS),
  DoctorControllers.deleteDoctor
);

export const DoctorRoutes = {
  routes,
};
