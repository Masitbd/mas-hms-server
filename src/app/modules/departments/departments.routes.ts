import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { DepartmentController } from './departments.controllers';
import { departmentValidation } from './departments.validations';
const routes = express.Router();
routes.post(
  '/',
  validateRequest(departmentValidation.createDepartmentZodSchema),
  DepartmentController.createDepartment
);
routes.get('/:id', DepartmentController.getSingleDepartment);
routes.get('/', DepartmentController.getAllDepartment);
routes.patch(
  '/:id',
  validateRequest(departmentValidation.updateDepartmentZodSchema),
  DepartmentController.updateDepartment
);
routes.delete('/:id', DepartmentController.deleteDepartment);

export const DepartmentRoutes = { routes };
