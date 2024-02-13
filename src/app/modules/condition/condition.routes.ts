import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ConditionController } from './condition.controller';
import { ConditionValidation } from './conditon.validation';
const routes = express.Router();

routes.post(
  '/',
  validateRequest(ConditionValidation.conditionValidator),
  ConditionController.createNewCondition
);
routes.get('/', ConditionController.getAllCondition);

routes.get('/:id', ConditionController.getSingleCondition);

routes.patch(
  '/:id',
  validateRequest(ConditionValidation.conditionValidator),
  ConditionController.updateCondition
);

routes.delete('/:id', ConditionController.removeCondition);

export const ConditionRoutes = { routes };
