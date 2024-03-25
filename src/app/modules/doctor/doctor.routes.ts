import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { DoctorControllers } from './doctor.controller';
import { DoctorValidation } from './doctor.validation';

const routes = express.Router();

routes.get('/', DoctorControllers.getDoctor);

routes.get('/:id', DoctorControllers.getSingleDoctor);

routes.post(
  '/',
  // validateRequest(DoctorValidation.DoctorValidator),
  DoctorControllers.createDoctor
);

routes.patch(
  '/:id',
  validateRequest(DoctorValidation.DoctorValidatorForUpdate),
  DoctorControllers.updateDoctor
);

routes.delete('/:id', DoctorControllers.deleteDoctor);

export const DoctorRoutes = {
  routes,
};
