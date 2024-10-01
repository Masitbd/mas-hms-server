/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { createCanvas } from 'canvas';
import fs from 'fs';
import httpStatus from 'http-status';
import JsBarcode from 'jsbarcode';
import mongoose, { PipelineStage, Types } from 'mongoose';
import path from 'path';
import { ENUM_TEST_STATUS } from '../../../enums/testStatusEnum';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { PDFGeneratorV2 } from '../../../utils/PdfGenerator.v2';
import { Account } from '../account/account.model';
import { CompanyInfo } from '../componayInfo/companyInfo.model';
import { IDepartment } from '../departments/departments.interfaces';
import { Doctor } from '../doctor/doctor.model';
import { Miscellaneous } from '../miscellaneous/miscellaneous.model';
import { Refund } from '../refund/refund.model';
import { ReportGroup } from '../reportGroup/reportGroup.model';
import { ITest } from '../test/test.interfacs';
import { Transation } from '../transaction/transaction.model';
import { TransactionService } from '../transaction/transaction.service';
import { IVacuumTube } from '../vacuumTube/vacuumTube.interfaces';
import { VacuumTube } from '../vacuumTube/vacuumTube.models';
import { orderSearchAbleFields } from './order.constant';
import {
  FilterableFieldsSubset,
  IOrder,
  ITestsFromOrder,
} from './order.interface';
import { Order, OrderForRegistered, OrderForUnregistered } from './order.model';
import {
  discountCalculatorPipeline,
  orderAggregationPipeline,
  totalPriceCalculator,
} from './order.utils';

const postOrder = async (params: IOrder) => {
  const date = new Date();
  const month = date.getMonth().toString().padStart(2, '0');
  const year = date.getUTCFullYear().toString().slice(2, 4);

  const order: IOrder = params;
  const lastOrder = await Order.find().sort({ createdAt: -1 }).limit(1);
  const oid =
    lastOrder.length > 0 ? Number(lastOrder[0].oid?.split('-')[2]) : 0;

  const newOid =
    'H-' + month + year + '-' + String(Number(oid) + 1).padStart(7, '0');
  order.oid = newOid;

  // evaluating total price
  const {
    totalTestPrice,
    vat,
    tubePrice,
    discountBasedOnParcent,
    discountGivenByDoctor,
  } = await totalPriceCalculator(params);
  order.tubePrice = tubePrice;
  order.totalPrice = totalTestPrice + tubePrice;
  order.dueAmount =
    order.discountedBy == 'free'
      ? 0
      : totalTestPrice +
        tubePrice -
        discountBasedOnParcent -
        discountGivenByDoctor -
        order.cashDiscount -
        order.paid +
        vat;

  let result;
  if (params.patientType === 'registered') {
    result = await OrderForRegistered.create(order);
  } else {
    result = await OrderForUnregistered.create(order);
  }

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

  if (doesAccountExists.length && doesAccountExists[0].uuid)
    uuid = doesAccountExists[0].uuid;
  if (order.paid > 0) {
    await TransactionService.postTransaction({
      amount: order.paid,
      description: 'Payment for order',
      transactionType: 'debit',
      ref: result._id,
      uuid: uuid as string,
      postedBy: params.postedBy,
    });
  }

  // if (order.dueAmount == 0) {
  //   const testIds = order.tests;

  //   const result = await Test.aggregate(
  //     grossCommissionAmountPipeline(testIds as unknown as ITestsFromOrder[])
  //   );
  //   const referedDoctor: IDoctor | null = await Doctor.findOne({
  //     _id: order.refBy,
  //   });

  //   if (
  //     referedDoctor?.account_id &&
  //     order.dueAmount === 0 &&
  //     result[0].totalCommission > 0
  //   ) {
  //     TransactionService.postTransaction({
  //       uuid: referedDoctor.account_number,
  //       amount: Math.ceil(result[0].totalCommission),
  //       description: 'Account credited for patient commission',
  //       transactionType: 'credit',
  //       ref: order._id,
  //     });
  //   }
  // }

  return result;
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

  const result = await Order.aggregate(
    orderAggregationPipeline(isCondition, sortOption, skip, limit)
  );
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
    // Unwind testTube array for lookup
    {
      $lookup: {
        from: 'vacuumtubes',
        localField: 'testData.testTube',
        foreignField: '_id',
        as: 'testTubes',
      },
    },
    // Regroup to reassemble testTubes array
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
        discountedBy: { $first: '$discountedBy' },
        tests: {
          $push: {
            test: {
              $mergeObjects: [
                '$testData',
                {
                  testTubes: {
                    $cond: {
                      if: { $ne: ['$testData.testTube', null] },
                      then: {
                        $map: {
                          input: {
                            $filter: {
                              input: '$testTubes',
                              as: 'tube',
                              cond: {
                                $in: ['$$tube._id', '$testData.testTube'],
                              },
                            },
                          },
                          as: 'tube',
                          in: '$$tube',
                        },
                      },
                      else: [],
                    },
                  },
                },
              ],
            },
            status: '$tests.status',
            discount: '$tests.discount',
            remark: '$tests.remark',
            deliveryTime: '$tests.deliveryTime',
            SL: '$tests.SL',
          },
        },
        createdAt: { $first: '$createdAt' },
      },
    },
  ]);

  const transactions = await Transation.find({
    ref: order[0]._id,
    description: 'Collected due amount',
  });
  let modifiedTransaction: string | any[] = [];
  if (transactions.length > 0) {
    modifiedTransaction = transactions.map((t, i) => ({
      amount: t?.amount,
      SL: i + 1,
      date: new Date(t?.createdAt as Date).toLocaleDateString(),
    }));
  }
  const testTubes: any[] = [];
  const items: any[] = [];
  let consultant = null;
  let totalTestTubePrice = 0;
  // eslint-disable-next-line no-unused-vars
  const discountOnTestTube = 0;
  const refundTestAmount = 0;
  const totalDiscount = await Order.aggregate(
    discountCalculatorPipeline(params) as PipelineStage[]
  );
  order[0].tests.map(
    (test: {
      test: { testTubes: IVacuumTube[] } & ITest;
      status: string;
      SL: string;
      discount: number;
    }) => {
      if (test.test.hasTestTube) {
        test.test.testTubes.forEach((tube: IVacuumTube) => {
          if (testTubes.length) {
            const doesTubeExists = testTubes.find(
              (tubef: IVacuumTube) => tubef.label == tube.label
            );

            if (doesTubeExists) {
              return;
            } else {
              testTubes.push(tube);
              totalTestTubePrice += tube.price;
            }
          } else {
            testTubes.push(tube);
            totalTestTubePrice += tube.price;
          }
        });
      }
      items.push({
        name: test.test.label,
        price: test.test.price,
        status: test.status == ENUM_TEST_STATUS.REFUNDED,
        discount: test?.discount || 0,
        SL: test?.SL,
      });
    }
  );

  if (testTubes.length > 0) {
    let SL = items[items.length - 1].SL + 1;
    testTubes.forEach((tube: IVacuumTube) => {
      items.push({
        name: tube.label,
        price: tube.price,
        status: false,
        SL: SL,
      });
      SL++;
    });
  }

  if (order[0]?.consultant) {
    const result = await Doctor.findById(order[0].consultant);
    consultant = result?.title + ' ' + result?.name;
  }

  // Featching refund data
  const refundData = await Refund.aggregate([
    {
      $match: {
        oid: order[0].oid,
      },
    },
    {
      $group: {
        _id: '$oid',

        discount: { $sum: '$discount' },
        grossAmount: { $sum: '$grossAmount' },
        netAmount: { $sum: '$netAmount' },
        remainingRefund: { $sum: '$remainingRefund' },
        refundApplied: { $sum: '$refundApplied' },
      },
    },
  ]);
  let netRefundAmount = 0;
  let grossRefundAmount = 0;
  let remainingRefund = 0;
  let refundApplied = 0;
  if (refundData.length) {
    netRefundAmount = refundData[0].netAmount;
    grossRefundAmount = refundData[0].grossAmount;
    remainingRefund = Math.ceil(refundData[0].remainingRefund);
    refundApplied = Math.ceil(refundData[0].refundApplied);
  }

  // For Vat
  let vatAmount = 0;
  if (order[0].vat) {
    vatAmount = Math.floor(
      ((order[0].totalPrice -
        order[0].cashDiscount -
        (totalDiscount.length ? totalDiscount[0].totalDiscountAmount : 0)) *
        order[0].vat) /
        100
    );
  }
  // for barcode

  const barcodeDoc = createCanvas(20, 20);
  JsBarcode(barcodeDoc, order[0].oid, {
    height: 20,
    width: 1,
    displayValue: false,
  });
  const barcodeUrl = barcodeDoc.toDataURL('image/png');

  // for margin or company Info
  const companyInfo = await CompanyInfo.findOne({ default: true });
  const defaultMargin = await Miscellaneous.findOne({ title: 'margin' });
  let marginValue = [0, 0, 0, 0];
  if (marginValue) {
    const md = defaultMargin?.value?.split(',').map(m => Number(m));
    marginValue = md as number[];
  }

  const dataBinding = await {
    items: items,
    isFree: order[0].discountedBy == 'free',
    isWatermark: order[0].dueAmount > 0,
    oid: params,
    name: order[0].patient.name,
    phone: order[0].patient.phone,
    total: order[0].totalPrice,
    uuid: order[0]?.uuid,
    sex: order[0].patient.gender,
    age: order[0].patient.age,
    address: order[0].patient.address,
    consultant,

    createdAt: new Date(order[0].createdAt).toLocaleDateString(),
    paid: Math.ceil(order[0].paid),
    tt: modifiedTransaction.length > 0,
    tds: modifiedTransaction,
    discount:
      order[0].discountedBy !== 'free'
        ? totalDiscount.length
          ? Math.ceil(
              totalDiscount[0].totalDiscountAmount +
                totalDiscount[0].cashDiscount
            )
          : 0
        : order[0].totalPrice,
    netPrice:
      order[0].discountedBy !== 'free'
        ? Math.ceil(
            order[0].totalPrice -
              (totalDiscount.length
                ? totalDiscount[0].totalDiscountAmount
                : 0) -
              order[0].cashDiscount +
              vatAmount
          )
        : 0,

    dueAmount:
      order[0].discountedBy !== 'free' ? Math.ceil(order[0].dueAmount) : 0,
    parcentDiscount: order[0].parcentDiscount || 0,
    img: barcodeUrl,
    remainingRefund,
    refundApplied,
    vat: order[0].vat,
    vatAmount: Math.ceil(vatAmount),
    companyInfo: {
      name: companyInfo?.name,
      address: companyInfo?.address,
      photoUrl: companyInfo?.photoUrl,
      phone: companyInfo?.phone,
    },
    marginValue: companyInfo
      ? { top: 0, right: 0, left: 0, bottom: 0 }
      : {
          top: marginValue[1] ?? 0,
          right: marginValue[2] ?? 0,
          left: marginValue[0] ?? 0,
          bottom: marginValue[3] ?? 0,
        },
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

const fetchSingle = async (params: string) => {
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
    {
      $lookup: {
        from: 'doctors',
        localField: 'consultant',
        foreignField: '_id',
        as: 'consultant',
      },
    },
    {
      $unwind: {
        path: '$consultant',
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
      $lookup: {
        from: 'specimens',
        localField: 'testData.specimen',
        foreignField: '_id',
        as: 'testData.specimen',
      },
    },
    {
      $lookup: {
        from: 'reporttypes',
        localField: 'testData.resultFields',
        foreignField: '_id',
        as: 'testData.resultFields',
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
        discountedBy: { $first: '$discountedBy' },

        oid: { $first: '$oid' },
        patientType: { $first: '$patientType' },
        tests: {
          $push: {
            test: '$testData',
            status: '$tests.status',
            discount: '$tests.discount',
            remark: '$tests.remark',
            deliveryTime: '$tests.deliveryTime',
            SL: '$tests.SL',
          },
        },
        createdAt: { $first: '$createdAt' },
      },
    },
  ]);

  // featching the refund data for the order
  const refundData = await Refund.aggregate([
    {
      $match: {
        oid: params,
      },
    },
    {
      $group: {
        _id: null,
        grossAmount: { $sum: '$grossAmount' },
        netAmount: { $sum: '$netAmount' },
        refundApplied: { $sum: '$refundApplied' },
        remainingRefund: { $sum: '$remainingRefund' },
        vat: { $sum: '$refundAppvatlied' },
      },
    },
  ]);

  if (refundData.length) {
    order[0] = Object.assign({}, order[0], { refundData: refundData[0] });
  }

  if (!order.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  // for tubes
  const tests = order[0].tests;
  const tubes: string[] = [];
  if (order[0].tests.length) {
    tests.forEach((test: ITestsFromOrder) => {
      if ('hasTestTube' in test.test)
        if (test.test.hasTestTube)
          test.test.testTube.forEach((id: Types.ObjectId) => {
            if (!tubes.includes(id.toString())) {
              tubes.push(id.toString());
            }
          });
    });
  }

  const tubesFromDB = await VacuumTube.find({ _id: { $in: tubes } });

  if (tests.length && tubesFromDB.length) {
    tubesFromDB.forEach((element: IVacuumTube) => {
      tests.push({
        status: 'tube',
        discount: 0,
        remark: '',
        deliveryTime: new Date().toLocaleDateString(),
        SL: tests.length + 1,
        test: element,
      });
    });

    order[0].tests = tests;
  }

  // const orderForCalculation = await Order.findOne({ oid: params });
  // const result = await totalPriceCalculator(orderForCalculation as IOrder);

  return order;
};

const dueCollection = async (
  params: { amount: number },
  oid: string,
  user: string
) => {
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

  if (uuid ?? doesAccountExists.length > 0) {
    await TransactionService.postTransaction({
      amount: params.amount,
      description: 'Collected due amount',
      transactionType: 'debit',
      uuid: uuid ?? doesAccountExists[0].uuid,
      ref: doesExists._id,
      postedBy: user,
    });
  }

  const result = Order.findOneAndUpdate(
    { oid: oid },
    { dueAmount: dueAmount, paid: paid },
    { new: true }
  );
  return result;
};

const singleOrderstatusChanger = async (params: {
  reportGroup: string;
  oid: string;
  status: string;
  user: string;
}) => {
  const order = await Order.findOne({ oid: params.oid })
    .populate('tests.test')
    .populate('tests.test.department');
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  const reportGroup = await ReportGroup.findOne({
    label: params.reportGroup,
  }).populate('department');
  if (!reportGroup) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Report Group not found');
  }
  let commission = 0;
  let discount = 0;
  const discountedBy = order.discountedBy;
  const department = reportGroup.department as unknown as IDepartment;
  if (order.dueAmount !== 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Dew Amount remaining. Cannot change status'
    );
  }

  order.tests.forEach((test: ITestsFromOrder) => {
    if (
      'reportGroup' in test.test &&
      reportGroup._id.equals(test.test.reportGroup) &&
      test.status !== 'refunded'
    ) {
      if (test.status == 'delivered') {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Test report had already delivered. Now status cannot be changed'
        );
      }
      test.status = params.status;
      if (
        'isCommissionFiexed' in reportGroup.department &&
        !reportGroup.department.isCommissionFiexed
      ) {
        commission += Math.ceil(
          (test.test.price * Number(department.commissionParcentage)) / 100
        );
      }
      if (department.isCommissionFiexed) {
        commission += commission + Number(department.fixedCommission);
      }
      if (test.discount) {
        discount += Math.ceil((test.test.price * Number(test.discount)) / 100);
        return;
      }
      if (order.parcentDiscount) {
        discount += Math.ceil(
          (test.test.price * Number(order.parcentDiscount)) / 100
        );
        return;
      } else return;
    }
  });

  switch (discountedBy) {
    case 'system':
      break;

    case 'doctor':
      commission -= discount;
      break;

    case 'both':
      commission -= Math.ceil(discount / 2);
      break;
    case 'free':
      commission = 0;
      break;
    default:
      break;
  }

  if (commission && order.refBy) {
    const doctor = await Doctor.findOne({ _id: order.refBy });
    if (doctor) {
      await TransactionService.postTransaction({
        amount: commission,
        description: `Commission For ${department.label}`,
        transactionType: 'credit',
        ref: order._id,
        uuid: doctor.account_number,
        postedBy: params.user,
      });
    }
  }
  const result = await order.save();
  return result;
};

// investigation income

const getIncomeStatementFromDB = async (payload: {
  startDate: string;
  endDate: string;
}) => {
  // Convert and format dates

  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);
  startDate.setUTCHours(0, 0, 0, 0);

  endDate.setUTCHours(23, 59, 59, 999);

  // const query = [
  //   {
  //     $match: {
  //       createdAt: {
  //         $gte: startDate,
  //         $lte: endDate,
  //       },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'tests',
  //       localField: 'tests.test',
  //       foreignField: '_id',
  //       as: 'testDetails',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$testDetails', // unwind to get each test
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: {
  //         oid: '$oid',
  //         groupDate: {
  //           $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
  //         },
  //       },
  //       totalPrice: { $first: '$totalPrice' },
  //       totalTestPrice: { $sum: '$testDetails.price' },
  //       cashDiscount: { $first: '$cashDiscount' },
  //       parcentDiscount: { $first: '$parcentDiscount' },
  //       dueAmount: { $first: '$dueAmount' },
  //       paid: { $first: '$paid' },
  //       vat: { $first: '$vat' },
  //       uuid: { $first: '$uuid' }, // Keep uuid if needed
  //       records: {
  //         $push: {
  //           oid: '$oid',
  //           uuid: '$uuid',
  //           totalPrice: '$totalPrice',
  //           totalTestPrice: { $sum: '$testDetails.price' },
  //           cashDiscount: '$cashDiscount',
  //           parcentDiscount: '$parcentDiscount',
  //           dueAmount: '$dueAmount',
  //           paid: '$paid',
  //           vat: '$vat',
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $sort: { oid: -1 }, // Sort by oid
  //   },
  //   {
  //     $group: {
  //       _id: '$_id.groupDate',

  //       records: {
  //         $push: {
  //           $first: '$records',
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       groupDate: '$_id',

  //       records: 1,
  //     },
  //   },
  // ];

  const query = [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $unwind: {
        path: '$tests', // Unwind the tests array from the order collection
        preserveNullAndEmptyArrays: true,
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
        path: '$testDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        pd: {
          $cond: {
            if: {
              $or: [
                { $gt: [{ $ifNull: ['$tests.discount', 0] }, 0] }, // Test-level discount
                { $gt: [{ $ifNull: ['$parcentDiscount', 0] }, 0] }, // Overall percent discount
              ],
            },
            then: {
              $cond: {
                if: { $gt: [{ $ifNull: ['$tests.discount', 0] }, 0] }, // If test-level discount exists
                then: {
                  $divide: [
                    {
                      $multiply: [
                        '$testDetails.price',
                        { $ifNull: ['$tests.discount', 0] },
                      ],
                    },
                    100,
                  ],
                },
                else: {
                  $divide: [
                    {
                      $multiply: [
                        '$testDetails.price',
                        { $ifNull: ['$parcentDiscount', 0] },
                      ],
                    },
                    100,
                  ],
                },
              },
            },
            else: 0, // No discount exists
          },
        },

        // Cash Discount (cd) applied to the test price
        cd: { $ifNull: ['$cashDiscount', 0] },

        // Total Discount: Sum of cash discount (cd) and percent discount (pd)
        // totalDiscount: {
        //   $sum: [{ $ifNull: ['$pd', 0] }, { $ifNull: ['$cd', 0] }],
        // },

        vatAmount: {
          $cond: {
            if: { $gt: ['$vat', 0] }, // Check if VAT exists
            then: {
              $multiply: [
                {
                  $subtract: [
                    '$totalPrice',
                    {
                      $add: [
                        { $ifNull: ['$cd', 0] }, // Ensure cashDiscount is treated properly
                        { $ifNull: ['$pd', 0] }, // Ensure parcentDiscountAmount is treated properly
                      ],
                    },
                  ], // Net amount after discount
                },
                { $divide: ['$vat', 100] }, // Calculate VAT amount
              ],
            },
            else: 0, // No VAT to add
          },
        },
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
        totalDiscount: { $sum: '$totalDiscount' }, // Sum of all discounts
        discountedPrice: { $first: '$discountedPrice' },
        vat: { $first: '$vatAmount' }, // VAT in amount
        finalPrice: { $first: '$finalPrice' }, // Total after adding VAT
        dueAmount: { $first: '$dueAmount' },
        paid: { $first: '$paid' },
        uuid: { $first: '$uuid' },
        records: {
          $push: {
            oid: '$oid',
            uuid: '$uuid',
            totalPrice: '$totalPrice',
            totalTestPrice: { $sum: '$testDetails.price' },

            vat: '$vatAmount',
            finalPrice: '$finalPrice',
            cashDiscount: '$cd',
            parcentDiscountAmount: '$pd',

            totalDis: {
              $add: [
                { $ifNull: ['$cd', 0] }, // Ensure cashDiscount is treated properly
                { $ifNull: ['$pd', 0] }, // Ensure parcentDiscountAmount is treated properly
              ],
            },

            totalAmount: {
              $subtract: [
                {
                  $add: [
                    { $toDouble: { $ifNull: ['$totalPrice', 0] } }, // Use totalPrice directly
                    { $ifNull: ['$vatAmount', 0] }, // Ensure VAT is treated properly
                  ],
                },
                {
                  $add: [
                    { $ifNull: ['$cd', 0] }, // Ensure cashDiscount is treated properly
                    { $ifNull: ['$pd', 0] }, // Ensure parcentDiscountAmount is treated properly
                  ],
                },
              ],
            },

            paid: '$paid',
          },
        },
      },
    },
    {
      $sort: { oid: -1 },
    },
    {
      $group: {
        _id: '$_id.groupDate',
        records: {
          $push: { $first: '$records' },
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

  const result = await Order.aggregate(query as PipelineStage[]);
  return result;
};

//  get due bills details

// eslint-disable-next-line @typescript-eslint/no-explicit-any

const getDueBillsDetailFromDB = async (query: Record<string, any>) => {
  const { oid, refBy, startDate, endDate } = query;

  const fromDate = new Date(startDate);
  const toDate = new Date(endDate);
  // startDate.setUTCHours(0, 0, 0, 0);

  toDate.setUTCHours(23, 59, 59, 999);
  // Initialize the match stage with an empty filter
  const match: Record<string, any> = {};

  // Apply OID filter if provided
  if (oid) {
    match.oid = oid;
  }

  if (refBy) {
    match.refBy = new mongoose.Types.ObjectId(refBy);
  }

  // Apply date range filter if provided
  if (startDate && endDate) {
    match.createdAt = {
      $gte: fromDate,
      $lte: toDate,
    };
  }

  const result = await Order.aggregate([
    // Apply the match filter for oid, refBy, or date range
    { $match: match },

    {
      $lookup: {
        from: 'doctors',
        localField: 'refBy',
        foreignField: '_id',
        as: 'refDoctor',
      },
    },

    { $unwind: { path: '$refDoctor', preserveNullAndEmptyArrays: true } },

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
      $addFields: {
        pd: {
          $cond: {
            if: {
              $or: [
                {
                  $gt: [
                    { $ifNull: [{ $arrayElemAt: ['$tests.discount', 0] }, 0] },
                    0,
                  ],
                },
                { $gt: [{ $ifNull: ['$parcentDiscount', 0] }, 0] },
              ],
            },
            then: {
              $cond: {
                if: {
                  $gt: [
                    { $ifNull: [{ $arrayElemAt: ['$tests.discount', 0] }, 0] },
                    0,
                  ],
                },
                then: {
                  $divide: [
                    {
                      $multiply: [
                        { $arrayElemAt: ['$testDetails.price', 0] }, // Get first price from testDetails
                        {
                          $ifNull: [
                            { $arrayElemAt: ['$tests.discount', 0] },
                            0,
                          ],
                        },
                      ],
                    },
                    100,
                  ],
                },
                else: {
                  $divide: [
                    {
                      $multiply: [
                        { $arrayElemAt: ['$testDetails.price', 0] }, // Get first price from testDetails
                        { $ifNull: ['$parcentDiscount', 0] },
                      ],
                    },
                    100,
                  ],
                },
              },
            },
            else: 0,
          },
        },

        cd: { $ifNull: ['$cashDiscount', 0] },

        vatAmount: {
          $cond: {
            if: { $gt: ['$vat', 0] },
            then: {
              $multiply: [
                {
                  $subtract: [
                    '$totalPrice',
                    {
                      $add: [{ $ifNull: ['$cd', 0] }, { $ifNull: ['$pd', 0] }],
                    },
                  ],
                },
                { $divide: ['$vat', 100] },
              ],
            },
            else: 0,
          },
        },
      },
    },

    // Project required fields
    {
      $project: {
        _id: 1,
        oid: 1,
        totalPrice: 1,
        cashDiscount: 1,
        parcentDiscount: '$pd',
        totalAmount: {
          $subtract: [
            {
              $add: [
                { $toDouble: { $ifNull: ['$totalPrice', 0] } }, // Use totalPrice directly
                { $ifNull: ['$vatAmount', 0] }, // Ensure VAT is treated properly
              ],
            },
            {
              $add: [
                { $ifNull: ['$cd', 0] }, // Ensure cashDiscount is treated properly
                { $ifNull: ['$pd', 0] }, // Ensure parcentDiscountAmount is treated properly
              ],
            },
          ],
        },
        paid: 1,
        vat: 1,
        refDoctor: { name: 1 }, // Include only the doctor's name
        patientData: {
          name: {
            $cond: {
              if: {
                $gt: [{ $size: { $ifNull: ['$patientFromUUID', []] } }, 0],
              }, // Check if patient data by uuid
              then: { $arrayElemAt: ['$patientFromUUID.name', 0] }, // Extract name from patientFromUUID
              else: '$patient.name', // If no uuid, use the main patient object name
            },
          },
        },
        testDetails: { label: 1, price: 1 }, // Include only 'label' and 'price' from test details
        __t: 1,
        createdAt: 1,
      },
    },

    // Group the results by refBy.name
    {
      $group: {
        _id: '$refDoctor.name', // Group by doctor name (refBy)
        records: {
          $push: {
            oid: '$oid',
            totalPrice: '$totalPrice',
            cashDiscount: '$cashDiscount',
            parcentDiscount: '$parcentDiscount',
            dueAmount: '$dueAmount',
            paid: '$paid',
            totalAmount: '$totalAmount',
            patientData: '$patientData',
            testDetails: '$testDetails',
            createdAt: '$createdAt',
          },
        },
      },
    },

    // Rename the _id field to refBy for clarity
    {
      $project: {
        _id: 0, // Exclude _id
        refBy: '$_id', // Rename _id to refBy
        records: 1, // Include the records array
      },
    },
  ]);

  return result;
};

export const OrderService = {
  postOrder,
  fetchAll,
  orderPatch,
  fetchIvoice,
  dueCollection,
  fetchSingle,
  singleOrderstatusChanger,
  getIncomeStatementFromDB,
  getDueBillsDetailFromDB,
};
