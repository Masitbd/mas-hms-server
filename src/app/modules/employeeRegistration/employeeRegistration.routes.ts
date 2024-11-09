import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { EmployeeRegistrationController } from './employeeRegistration.controller';
import { EmployeeRegistrationValidation } from './employeeRegistration.validation';

const routes = express.Router();

routes.post(
  '/create-employee',
  auth(ENUM_USER_PEMISSION.MANAGE_EMPLOYEE),
  validateRequest(EmployeeRegistrationValidation.EmployeeValidator),
  EmployeeRegistrationController.createNewEmployeeRegistration
);
routes.get(
  '/',
  auth(ENUM_USER_PEMISSION.USER),
  EmployeeRegistrationController.getAllEmplloyeeRegistration
);
routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  EmployeeRegistrationController.getSingleEmployeeRegistration
);
routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_EMPLOYEE),
  validateRequest(EmployeeRegistrationValidation.EmployeeValidatorForPatch),
  EmployeeRegistrationController.updateEmployeeRegistration
);
routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_EMPLOYEE),
  EmployeeRegistrationController.removeEmployeeRegistration
);
export const EmployeeRegistrationRoutes = { routes };
