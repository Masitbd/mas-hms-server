import { Schema, Types, model } from 'mongoose';
import { IDoctor } from '../doctor/doctor.interface';
import { Doctor } from '../doctor/doctor.model';
import { Test } from '../test/test.model';
import { TransactionService } from '../transaction/transaction.service';
import { IOrder } from './order.interface';

const orderSchema = new Schema<IOrder>(
  {
    tests: [
      {
        SL: Number,
        test: { type: Types.ObjectId, ref: 'Test' },
        status: {
          type: String,
          default: 'pending',
          enum: ['pending', 'completed', 'delivered'],
        },
        discount: {
          type: Number,
        },
        deliveryTime: Date,
        remark: String,
      },
    ],
    totalPrice: { type: Number, required: true },
    cashDiscount: { type: Number, required: true },
    parcentDiscount: { type: Number, required: true },
    deliveryTime: { type: String, required: true },
    status: { type: String, required: true },
    dueAmount: { type: Number, required: true },
    paid: { type: Number, required: true },
    vat: { type: Number },
    refBy: {
      type: Schema.Types.ObjectId,
      ref: 'doctor',
    },
    oid: { type: String, unique: true },
    patientType: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const orderSchemaForUnregistered = new Schema({
  patient: {
    name: { type: String, required: true },
    age: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    consultant: { type: Schema.Types.ObjectId, ref: 'doctor' },
  },
});
const orderSchemaForRegistered = new Schema({
  uuid: { type: String },
});
orderSchema.pre('save', async function (next) {
  const order: IOrder = this as IOrder;
  const lastOrder = await Order.find().sort({ oid: -1 }).limit(1);
  const oid =
    lastOrder.length > 0 ? Number(lastOrder[0].oid?.split('-')[1]) : 0;

  const newOid = 'HMS-' + String(Number(oid) + 1).padStart(7, '0');
  order.oid = newOid;
  next();
});

orderSchema.post('save', async function (doc: IOrder) {
  const order = doc;
  if (order.paid > 0) {
    TransactionService.postTransaction({
      amount: order.paid,
      description: 'Payment for order',
      transactionType: 'debit',
      ref: order._id,
    });
  }
});
orderSchema.post('findOneAndUpdate', async function (document: IOrder) {
  const order = document;
  const testIds = order.tests;

  const result = await Test.aggregate([
    {
      $match: {
        _id: {
          $in: testIds.map(data => data.test),
        },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'departmentInfo',
      },
    },
    {
      $unwind: '$departmentInfo',
    },
    {
      $project: {
        price: 1,
        commissionType: '$departmentInfo.isCommissionFiexed',
        fixedCommission: '$departmentInfo.fixedCommission',
        percentageCommission: '$departmentInfo.commissionParcentage',
      },
    },
    {
      $group: {
        _id: null,
        totalFixedCommission: {
          $sum: {
            $cond: [{ $eq: ['$commissionType', true] }, '$fixedCommission', 0],
          },
        },
        totalPercentageCommission: {
          $sum: {
            $cond: [
              { $eq: ['$commissionType', false] },
              {
                $multiply: [
                  '$price',
                  { $divide: ['$percentageCommission', 100] },
                ],
              },
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalCommission: {
          $add: ['$totalFixedCommission', '$totalPercentageCommission'],
        },
      },
    },
  ]);
  const referedDoctor: IDoctor | null = await Doctor.findOne({
    _id: order.refBy,
  });

  if (referedDoctor?.uuid && order.dueAmount === 0) {
    TransactionService.postTransaction({
      uuid: referedDoctor.uuid,
      amount: Math.ceil(result[0].totalCommission),
      description: 'Account credited for patient commission',
      transactionType: 'credit',
      ref: order._id,
    });
  }
});

export const Order = model('order', orderSchema);
export const OrderForRegistered = Order.discriminator(
  'ForRegistered',
  orderSchemaForRegistered
);
export const OrderForUnregistered = Order.discriminator(
  'ForUnregistered',
  orderSchemaForUnregistered
);
