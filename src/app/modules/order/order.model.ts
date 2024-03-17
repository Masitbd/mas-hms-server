import { Schema, Types, model } from 'mongoose';
import { IDoctor } from '../doctor/doctor.interface';
import { Doctor } from '../doctor/doctor.model';
import { Test } from '../test/test.model';
import { TransactionService } from '../transaction/transaction.service';
import { IOrder } from './order.interface';

const orderSchema = new Schema<IOrder>(
  {
    uuid: { type: String },
    tests: [
      {
        test: { type: Types.ObjectId, ref: 'Test' },
        status: {
          type: String,
          default: 'pending',
          enum: ['pending', 'completed', 'delivered'],
        },
        discount: {
          type: Number,
        },
      },
    ],
    totalPrice: { type: Number, required: true },
    cashDiscount: { type: Number, required: true },
    parcentDiscount: { type: Number, required: true },
    deliveryTime: { type: String, required: true },
    status: { type: String, required: true },
    dueAmount: { type: Number, required: true },
    refBy: {
      type: Schema.Types.ObjectId,
      ref: 'doctor',
    },
    oid: { type: String, unique: true },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('save', async function (next) {
  const order: IOrder = this as IOrder;
  const lastOrder = await Order.find().sort({ oid: -1 }).limit(1);
  const oid =
    lastOrder.length > 0 ? Number(lastOrder[0].oid?.split('-')[1]) : 0;
  console.log(lastOrder);
  const newOid = 'HMS-' + String(Number(oid) + 1).padStart(7, '0');
  order.oid = newOid;
  next();
});

orderSchema.post('save', async function (document: IOrder) {
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

  if (referedDoctor?.uuid) {
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
