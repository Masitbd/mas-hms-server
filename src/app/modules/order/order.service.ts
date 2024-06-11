import fs from 'fs';
import path from 'path';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { PDFGeneratorV2 } from '../../../utils/PdfGenerator.v2';
import { ITest } from '../test/test.interfacs';
import { orderSearchAbleFields } from './order.constant';
import { FilterableFieldsSubset, IOrder } from './order.interface';
import { Order, OrderForRegistered, OrderForUnregistered } from './order.model';

const postOrder = async (params: IOrder) => {
  if (params.patientType === 'registered') {
    const result = await OrderForRegistered.create(params);
    return result;
  } else {
    const result = await OrderForUnregistered.create(params);
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

  // const bufferResult = await GeneratePdf({
  //   data: dataBinding,
  //   templateHtml: templateHtml,
  //   options: {
  //     format: 'A4',
  //     printBackground: true,
  //     margin: {
  //       left: '0px',
  //       top: '0px',
  //       right: '0px',
  //       bottom: '0px',
  //     },
  //   },
  // });
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
export const OrderService = { postOrder, fetchAll, orderPatch, fetchIvoice };
