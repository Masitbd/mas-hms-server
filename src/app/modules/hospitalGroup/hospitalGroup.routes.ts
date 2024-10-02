import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { HospitalGroupController } from './hospitalGroup.controller';
import { hospitalGrouptValidation } from './hospitalGroup.validation';

const routes = express.Router();

routes.post(
  '/create-hospitalGroup',
  auth(ENUM_USER_PEMISSION.MANAGE_HOSPITAL_GROUP),
  validateRequest(hospitalGrouptValidation.createHospitalGroupZodSchema),
  HospitalGroupController.createHospitalGroup
);
routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  HospitalGroupController.getSingleHospitalGroup
);
routes.get(
  '/',
  auth(ENUM_USER_PEMISSION.USER),
  HospitalGroupController.getAllHospitalGroup
);
routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_HOSPITAL_GROUP),
  validateRequest(hospitalGrouptValidation.updateHospitalGroupZodSchema),
  HospitalGroupController.updateHospitalGroup
);
routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_HOSPITAL_GROUP),
  HospitalGroupController.deleteHospitalGroup
);

export const HospitalGroupRoutes = { routes };
