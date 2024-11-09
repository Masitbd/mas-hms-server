import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TestController } from './test.controller';
import { TestValidtion } from './test.validator';
const routes = express.Router();

routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_TESTS),
  validateRequest(TestValidtion.testValidator),
  TestController.createNewTest
);
routes.get('/', auth(ENUM_USER_PEMISSION.USER), TestController.getAllTest);
routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  TestController.getSingleTest
);
routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_TESTS),
  validateRequest(TestValidtion.testValidatorForPatch),
  TestController.updateTest
);
routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_TESTS),
  TestController.removeTest
);

export const TestRoutes = { routes };
