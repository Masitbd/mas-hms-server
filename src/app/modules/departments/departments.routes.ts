import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { DepartmentController } from './departments.controllers';
import { departmentValidation } from './departments.validations';
const router = express.Router();

router.post(
  '/create-department',
  validateRequest(departmentValidation.createDepartmentZodSchema),
  DepartmentController.createNewDepartment
);
router.get('/:id', DepartmentController.getSingleDepartment);
router.get('/', DepartmentController.getAllDepartment);
router.patch('/:id', DepartmentController.updateDepartment);
router.delete('/:id', DepartmentController.removeDepartment);

export const DepartmentRoutes = router;
