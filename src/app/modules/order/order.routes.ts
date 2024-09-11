import express from 'express';
import { OrderController } from './order.controller';

const routes = express.Router();

routes.post('/', OrderController.createNewOrder);
routes.get('/', OrderController.getAllOrder);
// income
routes.post('/income-statement', OrderController.getIncomeStatement);
routes.patch('/:id', OrderController.updateOrder);
routes.get('/invoice/:oid', OrderController.getInvoice);
routes.patch('/dewCollection/:oid', OrderController.dueCollection);

export const OrderRoutes = { routes };
