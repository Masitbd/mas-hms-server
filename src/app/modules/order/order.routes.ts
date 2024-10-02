import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { OrderController } from './order.controller';
const routes = express.Router();

routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_ORDER),
  OrderController.createNewOrder
);

routes.get(
  '/order-posted-by',
  auth(ENUM_USER_PEMISSION.USER),
  OrderController.getOrderPostedBy
);
// income
routes.post(
  '/income-statement',
  auth(ENUM_USER_PEMISSION.USER),
  OrderController.getIncomeStatement
);
// due detials
routes.get(
  '/due-details',
  auth(ENUM_USER_PEMISSION.USER),
  OrderController.getDueDetails
);
routes.get('/', auth(ENUM_USER_PEMISSION.USER), OrderController.getAllOrder);
routes.get('/:oid', auth(ENUM_USER_PEMISSION.USER), OrderController.getSIngle);
routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_ORDER),
  OrderController.updateOrder
);
routes.get(
  '/invoice/:oid',
  auth(ENUM_USER_PEMISSION.USER),
  OrderController.getInvoice
);
routes.patch(
  '/dewCollection/:oid',
  auth(ENUM_USER_PEMISSION.MANAGE_ORDER),
  OrderController.dueCollection
);
routes.post(
  '/statusChange/:oid',
  auth(ENUM_USER_PEMISSION.MANAGE_ORDER),
  OrderController.statusChanger
);

export const OrderRoutes = { routes };
