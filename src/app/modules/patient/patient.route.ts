import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PatientController } from './patient.controller';
import { PatientValidation } from './patient.validator';
const routes = express.Router();
routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_PATIENT),
  validateRequest(PatientValidation.PatientValidator),
  PatientController.createNewPatient
);
routes.patch(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_PATIENT),
  validateRequest(PatientValidation.PatientValidatorForPatch),
  PatientController.updatePatient
);
routes.get('/:id', auth(ENUM_USER_PEMISSION.USER), PatientController.getSingle);
routes.get('/', auth(ENUM_USER_PEMISSION.USER), PatientController.getAll);
export const PatientRoute = { routes };
