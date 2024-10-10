import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DepartmentController } from './departments.controllers';
import { departmentValidation } from './departments.validations';
const routes = express.Router();
routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_DEPARTMENT),
  validateRequest(departmentValidation.createDepartmentZodSchema),
  DepartmentController.createDepartment
);
routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  DepartmentController.getSingleDepartment
);
routes.get(
  '/',
  auth(ENUM_USER_PEMISSION.USER),
  DepartmentController.getAllDepartment
);
routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_DEPARTMENT),
  validateRequest(departmentValidation.updateDepartmentZodSchema),
  DepartmentController.updateDepartment
);
routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_DEPARTMENT),
  DepartmentController.deleteDepartment
);

export const DepartmentRoutes = { routes };
