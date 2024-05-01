import express from 'express';
import { OrderController } from './order.controller';
const routes = express.Router();

routes.post('/', OrderController.createNewOrder);
routes.get('/', OrderController.getAllOrder);
routes.patch('/:id', OrderController.updateOrder);
routes.get('/invoice/:oid', OrderController.getInvoice);

export const OrderRoutes = { routes };