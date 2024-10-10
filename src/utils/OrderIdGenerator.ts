import { Order } from '../app/modules/order/order.model';

export const orderIdGenerator = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(2, 4);
  const month = date.getMonth().toString().padStart(2, '0');
  const dateData = year + month;
  const lastOrder = await Order.find().sort({ createdAt: -1 }).limit(1);

  //   If this is the first order than the first order id will be 1
  if (lastOrder.length == 0) {
    return 'H' + dateData + '0000001';
  }

  //   IF the date data is not same than the id will be 1
  const lastOrderOid = lastOrder[0]?.oid;
  const lastOrderDateData = lastOrderOid?.slice(1, 5);
  if (dateData !== lastOrderDateData) {
    return 'H' + dateData + '0000001';
  }

  //   IF the date data is same than the id will be next number
  const lastSerialNumber = lastOrderOid?.slice(5);
  const nextSerialNumber =
    'H' + dateData + (Number(lastSerialNumber) + 1).toString().padStart(7, '0');
  return nextSerialNumber;
};
