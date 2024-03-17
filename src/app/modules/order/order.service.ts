import { IOrder } from './order.interface';
import { Order } from './order.model';

const postOrder = async (params: IOrder) => {
  const result = await Order.create(params);
  return result;
};
const fetchAll = async () => {
  const result = await Order.find().populate('refBy');
  return result;
};
export const OrderService = { postOrder, fetchAll };
