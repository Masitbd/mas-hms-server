import fs from 'fs';
import httpStatus from 'http-status';
import { PipelineStage } from 'mongoose';
import path from 'path';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { PDFGeneratorV2 } from '../../../utils/PdfGenerator.v2';
import { Account } from '../account/account.model';
import { IDoctor } from '../doctor/doctor.interface';
import { Doctor } from '../doctor/doctor.model';
import { ITest } from '../test/test.interfacs';
import { Test } from '../test/test.model';
import { TransactionService } from '../transaction/transaction.service';
import { orderSearchAbleFields } from './order.constant';
import { FilterableFieldsSubset, IOrder } from './order.interface';
import { Order, OrderForRegistered, OrderForUnregistered } from './order.model';

const postOrder = async (params: IOrder) => {
  const order: IOrder = params;
  const lastOrder = await Order.find().sort({ oid: -1 }).limit(1);
  const oid =
    lastOrder.length > 0 ? Number(lastOrder[0].oid?.split('-')[1]) : 0;

  const newOid = 'HMS-' + String(Number(oid) + 1).padStart(7, '0');
  order.oid = newOid;
  if (params.patientType === 'registered') {
    const result = await OrderForRegistered.create(order);
    return result;
  } else {
    const result = await OrderForUnregistered.create(order);
    return result;
  }
};
const fetchAll = async ({
  filterableField,
  paginationOption,
}: {
  filterableField: FilterableFieldsSubset;
  paginationOption: IPaginationOptions;
}) => {
  const { searchTerm, ...otherFilterOption } = filterableField;

  const sortBy = paginationOption.sortBy
    ? paginationOption.sortBy
    : 'createdAt';
  const sortOrder = paginationOption.sortOrder
    ? Number(paginationOption.sortOrder)
    : -1;

  const sortOption: Record<string, 1 | -1> = { [sortBy]: sortOrder as 1 | -1 };

  const { limit, page, skip } = paginationHelpers.calculatePagination({
    page: paginationOption.page,
    limit: paginationOption.limit,
    sortBy: sortBy,
    sortOrder: sortOrder as unknown as string,
  });

  const condition = [];
  if (searchTerm) {
    condition.push({
      $or: orderSearchAbleFields.map(field => {
        return {
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
        };
      }),
    });
  }
  if (otherFilterOption) {
    Object.keys(otherFilterOption).map((field: string) => {
      if (field == 'minTotalPrice') {
        condition.push({
          totalPrice: { $gte: Number(otherFilterOption[field]) },
        });
        return;
      }
      if (field == 'maxTotalPrice') {
        condition.push({
          totalPrice: { $lte: Number(otherFilterOption[field]) },
        });
        return;
      }
      if (field == 'minDueAmount') {
        condition.push({
          dueAmount: { $lte: Number(otherFilterOption[field]) },
        });
        return;
      }
      if (field == 'maxDueAmount') {
        condition.push({
          dueAmount: { $lte: Number(otherFilterOption[field]) },
        });
        return;
      }
      if (field == 'patientType') {
        if (otherFilterOption.patientType == ('' || 'all')) {
          return;
        }
        condition.push({
          patientType: otherFilterOption[field],
        });
        return;
      } else {
        condition.push({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [field]: (otherFilterOption as any)[field],
        });
      }
    });
  }
  const isCondition = condition.length > 0 ? { $and: condition } : {};

  const result = await Order.aggregate([
    {
      $lookup: {
        from: 'patients',
        localField: 'uuid',
        foreignField: 'uuid',
        as: 'patientDataFromUUID',
      },
    },
    {
      $addFields: {
        patientData: {
          $cond: {
            if: { $eq: ['$patientType', 'registered'] },
            then: { $arrayElemAt: ['$patientDataFromUUID', 0] },
            else: '$patient',
          },
        },
      },
    },
    {
      $unset: ['patientDataFromUUID', 'patient'],
    },
    {
      $lookup: {
        from: 'doctors',
        localField: 'refBy',
        foreignField: '_id',
        as: 'refBy',
      },
    },
    {
      $unwind: {
        path: '$refBy',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $unwind: '$tests' },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'testData',
      },
    },
    {
      $unwind: {
        path: '$testData',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $group: {
        _id: '$_id',
        uuid: { $first: '$uuid' },
        patient: { $first: '$patientData' },
        totalPrice: { $first: '$totalPrice' },
        cashDiscount: { $first: '$cashDiscount' },
        parcentDiscount: { $first: '$parcentDiscount' },
        deliveryTime: { $first: '$deliveryTime' },
        status: { $first: '$status' },
        dueAmount: { $first: '$dueAmount' },
        paid: { $first: '$paid' },
        vat: { $first: '$vat' },
        refBy: { $first: '$refBy' },
        consultant: { $first: '$consultant' },
        oid: { $first: '$oid' },
        patientType: { $first: '$patientType' },
        tests: {
          $push: {
            SL: '$tests.SL',
            test: '$testData',
            status: '$tests.status',
            discount: '$tests.discount',
            remark: '$tests.remark',
            deliveryTime: '$tests.deliveryTime',
          },
        },
        createdAt: { $first: '$createdAt' },
      },
    },
    {
      $match: isCondition,
    },
    {
      $sort: sortOption,
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);
  const totalDoc = await Order.estimatedDocumentCount();

  return {
    data: result,
    page: page,
    limit: limit,
    skip: skip,
    totalData: totalDoc,
  };
};

const orderPatch = async (param: { id: string; data: Partial<IOrder> }) => {
  const result = await Order.findOneAndUpdate({ _id: param.id }, param.data, {
    new: true,
  });
  return result;
};

const fetchIvoice = async (params: string) => {
  const order = await Order.aggregate([
    {
      $match: {
        oid: params,
      },
    },
    {
      $lookup: {
        from: 'patients',
        localField: 'uuid',
        foreignField: 'uuid',
        as: 'patientDataFromUUID',
      },
    },
    {
      $addFields: {
        patientData: {
          $cond: {
            if: { $eq: ['$patientType', 'registered'] },
            then: { $arrayElemAt: ['$patientDataFromUUID', 0] },
            else: '$patient',
          },
        },
      },
    },
    {
      $unset: ['patientDataFromUUID', 'patient'],
    },
    {
      $lookup: {
        from: 'doctors',
        localField: 'refBy',
        foreignField: '_id',
        as: 'refBy',
      },
    },
    {
      $unwind: {
        path: '$refBy',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $unwind: '$tests' },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'testData',
      },
    },
    {
      $unwind: {
        path: '$testData',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $group: {
        _id: '$_id',
        uuid: { $first: '$uuid' },
        patient: { $first: '$patientData' },
        totalPrice: { $first: '$totalPrice' },
        cashDiscount: { $first: '$cashDiscount' },
        parcentDiscount: { $first: '$parcentDiscount' },
        deliveryTime: { $first: '$deliveryTime' },
        status: { $first: '$status' },
        dueAmount: { $first: '$dueAmount' },
        paid: { $first: '$paid' },
        vat: { $first: '$vat' },
        refBy: { $first: '$refBy' },
        consultant: { $first: '$consultant' },

        oid: { $first: '$oid' },
        patientType: { $first: '$patientType' },
        tests: {
          $push: {
            test: '$testData',
            status: '$tests.status',
            discount: '$tests.discount',
            remark: '$tests.remark',
            deliveryTime: '$tests.deliveryTime',
          },
        },
        createdAt: { $first: '$createdAt' },
      },
    },
  ]);

  const dataBinding = await {
    items: order[0].tests.map((test: { test: ITest }) => {
      return {
        name: test.test.label,
        price: test.test.price,
      };
    }),

    isWatermark: order[0].dueAmount > 0,
    oid: params,
    name: order[0].patient.name,
    phone: order[0].patient.phone,
    total: order[0].totalPrice,
    createdAt: new Date(order[0].createdAt).toLocaleDateString(),
    paid: order[0].paid,
  };

  const templateHtml = fs.readFileSync(
    path.resolve(__dirname, './template.html'),
    'utf8'
  );
  const bufferResult = await PDFGeneratorV2({
    data: dataBinding,
    templateHtml: templateHtml,
    options: {
      format: 'A4',
      printBackground: true,
      margin: {
        left: '0px',
        top: '0px',
        right: '0px',
        bottom: '0px',
      },
    },
  });
  return bufferResult;
};

const dueCollection = async (params: { amount: number }, oid: string) => {
  const doesExists = await Order.findOne({ oid: oid });
  const doesAccountExists = await Account.find({ title: 'Order' });

  const lastAccount = await Account.find().sort({ uuid: -1 }).limit(1);
  const uuidLast =
    lastAccount.length > 0 ? Number(lastAccount[0].uuid?.split('-')[1]) : 0;
  const newUUid = 'D-' + String(Number(uuidLast) + 1).padStart(5, '0');
  let uuid = null;

  if (!doesAccountExists.length) {
    const result = await Account.create({
      balance: 0,
      balanceType: 'debit',
      title: 'Order',
      uuid: newUUid,
    });
    if (result.uuid) {
      uuid = result.uuid;
    } else {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create account'
      );
    }
  }
  if (!doesExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const dueAmount = doesExists.dueAmount - params.amount;
  const paid = doesExists.paid + params.amount;

  if (dueAmount === 0) {
    const testIds = doesExists.tests;
    const commissionAmount = await Test.aggregate([
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
              $cond: [
                { $eq: ['$commissionType', true] },
                '$fixedCommission',
                0,
              ],
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
      _id: doesExists.refBy,
    });
    if (referedDoctor?.account_id) {
      await TransactionService.postTransaction({
        uuid: referedDoctor.account_number,
        amount: Math.ceil(commissionAmount[0].totalCommission),
        description: 'Account credited for patient commission',
        transactionType: 'credit',
        ref: doesExists._id,
      });
    }
  }

  if (uuid ?? doesAccountExists.length > 0) {
    await TransactionService.postTransaction({
      amount: params.amount,
      description: 'Collected due amount',
      transactionType: 'debit',
      uuid: uuid ?? doesAccountExists[0].uuid,
      ref: doesExists._id,
    });
  }

  const result = Order.findOneAndUpdate(
    { oid: oid },
    { dueAmount: dueAmount, paid: paid },
    { new: true }
  );
  return result;
};

//  get due bills details

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDueBillsDetailFromDB = async (query: Record<string, any>) => {
  const { oid } = query;
  const result = await Order.aggregate([
    // Match the order based on the 'oid'
    { $match: { oid } },

    {
      $lookup: {
        from: 'doctors',
        localField: 'refBy',
        foreignField: '_id',
        as: 'refBy',
      },
    },

    { $unwind: { path: '$refBy', preserveNullAndEmptyArrays: true } },

    // Lookup the 'tests.test' field to populate test details
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'testDetails',
      },
    },

    // Lookup patient details if the uuid exists
    {
      $lookup: {
        from: 'patients',
        localField: 'uuid',
        foreignField: 'uuid',
        as: 'patientFromUUID',
      },
    },

    {
      $project: {
        _id: 1,
        oid: 1,
        totalPrice: 1,
        cashDiscount: 1,
        parcentDiscount: 1,

        status: 1,
        dueAmount: 1,
        paid: 1,
        vat: 1,
        refBy: { name: 1 },
        patientData: {
          name: {
            $cond: {
              if: {
                $gt: [{ $size: { $ifNull: ['$patientFromUUID', []] } }, 0],
              }, // Check if patient data by uuid
              then: { $arrayElemAt: ['$patientFromUUID.name', 0] }, // Extract name from patientFromUUID
              else: '$patient.name', // if no uuid set main patient object name here
            },
          },
        },
        testDetails: { label: 1, price: 1 }, // Include only 'label' and 'price' from test details

        __t: 1,
        createdAt: 1,
      },
    },
  ]);

  return result;
};

/// investigation income

const getIncomeStatementFromDB = async (payload: {
  startDate: string;
  endDate: string;
}) => {
  // Convert and format dates
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  startDate.setHours(0, 0, 0, 0);

  endDate.setHours(23, 59, 59, 999);

  const query: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $lookup: {
        from: 'tests',
        localField: 'tests.test',
        foreignField: '_id',
        as: 'testDetails',
      },
    },
    {
      $unwind: {
        path: '$testDetails', // unwind to get each test
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          oid: '$oid',
          groupDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
        },
        totalPrice: { $first: '$totalPrice' },
        totalTestPrice: { $sum: '$testDetails.price' },
        cashDiscount: { $first: '$cashDiscount' },
        parcentDiscount: { $first: '$parcentDiscount' },
        dueAmount: { $first: '$dueAmount' },
        paid: { $first: '$paid' },
        vat: { $first: '$vat' },
        uuid: { $first: '$uuid' }, // Keep uuid if needed
        records: {
          $push: {
            oid: '$oid',
            uuid: '$uuid',
            totalPrice: '$totalPrice',
            totalTestPrice: { $sum: '$testDetails.price' },
            cashDiscount: '$cashDiscount',
            parcentDiscount: '$parcentDiscount',
            dueAmount: '$dueAmount',
            paid: '$paid',
            vat: '$vat',
          },
        },
      },
    },
    {
      $sort: { oid: -1 }, // Sort by oid
    },
    {
      $group: {
        _id: '$_id.groupDate',

        records: {
          $push: {
            $first: '$records',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        groupDate: '$_id',

        records: 1,
      },
    },
  ];

  const result = await Order.aggregate(query);
  return result;
};

export const OrderService = {
  postOrder,
  fetchAll,
  orderPatch,
  fetchIvoice,
  dueCollection,
  getIncomeStatementFromDB,
  getDueBillsDetailFromDB,
};
