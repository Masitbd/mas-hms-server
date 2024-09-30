import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { EmployeeRegistrationController } from './employeeRegistration.controller';
import { EmployeeRegistrationValidation } from './employeeRegistration.validation';

const routes = express.Router();

routes.post(
  '/create-employee',
  validateRequest(EmployeeRegistrationValidation.EmployeeValidator),
  EmployeeRegistrationController.createNewEmployeeRegistration
);
routes.get('/', EmployeeRegistrationController.getAllEmplloyeeRegistration);
routes.get(
  '/:id',
  EmployeeRegistrationController.getSingleEmployeeRegistration
);
routes.patch(
  '/:id',
  validateRequest(EmployeeRegistrationValidation.EmployeeValidatorForPatch),
  EmployeeRegistrationController.updateEmployeeRegistration
);
routes.delete(
  '/:id',
  EmployeeRegistrationController.removeEmployeeRegistration
);
export const EmployeeRegistrationRoutes = { routes };
