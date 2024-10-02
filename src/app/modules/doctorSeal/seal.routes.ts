import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { DoctorSealController } from './seal.controller';

const routes = express.Router();
routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_DOCTORS_SEAL),
  DoctorSealController.createDoctorSeal
);
routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_DOCTORS_SEAL),
  DoctorSealController.updateDoctorSeal
);
routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_DOCTORS_SEAL),
  DoctorSealController.deleteDoctorSeal
);
routes.get(
  '/',
  auth(ENUM_USER_PEMISSION.USER),
  DoctorSealController.getAllDoctorSeal
);
routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  DoctorSealController.getSingleDoctorSeal
);

export const DoctorSealRoutes = { routes };
