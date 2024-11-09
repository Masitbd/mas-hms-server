import httpStatus from 'http-status';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { ITest } from '../test/test.interfacs';
import { Test } from '../test/test.model';
import { ITestsFromOrder } from '../testReportGenerate/report.interface';
import { IVacuumTube } from '../vacuumTube/vacuumTube.interfaces';
import { IOrder } from './order.interface';

export const discountCalculatorPipeline = (oid: string) => {
  return [
    {
      $match: {
        oid: oid,
      },
    },
    {
      $unwind: '$tests', // Unwind the tests array
    },
    {
      $lookup: {
        from: 'tests', // The collection name with test prices
        localField: 'tests.test', // The field with test IDs
        foreignField: '_id', // The field in the `tests` collection with test IDs
        as: 'testDetails', // Output field name for test details
      },
    },
    {
      $unwind: '$testDetails', // Unwind the testDetails array
    },
    {
      $addFields: {
        'tests.discount': { $toDouble: '$tests.discount' },
        'testDetails.price': { $toDouble: '$testDetails.price' },
      },
    },
    {
      $project: {
        _id: 1,
        'tests.test': 1,
        'tests.discount': 1,
        'testDetails.price': 1,
        'tests.status': 1,
        cashDiscount: 1,
        discountAmount: {
          $cond: {
            if: { $gt: ['$tests.discount', 0] },
            then: {
              $multiply: [
                '$testDetails.price',
                { $divide: ['$tests.discount', 100] },
              ],
            },
            else: {
              $cond: {
                if: { $gt: ['$parcentDiscount', 0] },
                then: {
                  $multiply: [
                    '$testDetails.price',
                    { $divide: ['$parcentDiscount', 100] },
                  ],
                },
                else: 0,
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        totalDiscountAmount: { $sum: '$discountAmount' },
        cashDiscount: { $first: '$cashDiscount' },
      },
    },
    {
      $sort: {
        totalDiscountAmount: -1, // Optional: Sort by total discount amount in descending order
      },
    },
  ];
};

export const grossCommissionAmountPipeline = (testIds: ITestsFromOrder[]) => {
  return [
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
  ];
};

export const orderAggregationPipeline = (
  isCondition: any,
  sortOption: any,
  skip: any,
  limit: any
) => {
  return [
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
        // refBy: { $first: '$refBy' },
        // consultant: { $first: '$consultant' },
        oid: { $first: '$oid' },
        patientType: { $first: '$patientType' },
        // tests: { $first: '$tests' },
        createdAt: { $first: '$createdAt' },
        postedBy: { $first: '$postedBy' },
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
  ];
};
export const inWords = (num: number): string | undefined => {
  const a = [
    '',
    'one ',
    'two ',
    'three ',
    'four ',
    'five ',
    'six ',
    'seven ',
    'eight ',
    'nine ',
    'ten ',
    'eleven ',
    'twelve ',
    'thirteen ',
    'fourteen ',
    'fifteen ',
    'sixteen ',
    'seventeen ',
    'eighteen ',
    'nineteen ',
  ];

  const b = [
    '',
    '',
    'twenty ',
    'thirty ',
    'forty ',
    'fifty ',
    'sixty ',
    'seventy ',
    'eighty ',
    'ninety ',
  ];

  function getTens(num: number): string {
    return num < 20 ? a[num] : b[Math.floor(num / 10)] + a[num % 10];
  }

  function getHundreds(num: number): string {
    return num > 0
      ? a[Math.floor(num / 100)] +
          'hundred ' +
          (num % 100 ? getTens(num % 100) : '')
      : '';
  }

  function getSection(num: number, name: string): string {
    return num > 0 ? getTens(num) + name + ' ' : '';
  }

  if (num === 0) return 'zero only';

  let str = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  str += getSection(crore, 'crore');
  str += getSection(lakh, 'lakh');
  str += thousand > 0 ? getTens(thousand) + 'thousand ' : '';
  str += getHundreds(hundred);
  str += remainder > 0 ? (str ? 'and ' : '') + getTens(remainder) : '';

  return str.trim() + 'only';
};

export const totalPriceCalculator = async (order: IOrder) => {
  // const order = await Order.findById(params);
  const tests = order?.tests || [];
  const cashDiscount = order?.cashDiscount;
  const parcentDiscount = order?.parcentDiscount || 0;
  let discountBasedOnParcent = 0;
  let totalTestPrice = 0;
  let discountGivenByDoctor = 0;
  let tubePrice = 0;
  let vat = 0;

  const tubes: IVacuumTube[] = [];
  if (!tests || !tests.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Request Does not have any tests'
    );
  }

  const testIds: Types.ObjectId[] = tests?.map(
    (test: { test: any }) => new Types.ObjectId(test.test) as Types.ObjectId
  );

  const aggregatedTest = await Test.find({ _id: { $in: testIds } })
    .populate('department')
    .populate('testTube')
    .populate('department');

  tests.forEach(
    (test: {
      SL: number;
      status: string;
      discount: number;
      ramark?: string;
      delivaryDate?: string;
      test: ITest | Types.ObjectId;
    }) => {
      const mTest = aggregatedTest.find((ltest: ITest) =>
        ltest._id?.equals(test.test as Types.ObjectId)
      );

      if (mTest?._id) {
        totalTestPrice += mTest.price;
        if (test.discount) {
          discountGivenByDoctor += Number(
            ((mTest.price * test.discount) / 100).toFixed(2)
          );
        } else {
          if (parcentDiscount) {
            discountBasedOnParcent += Number(
              ((mTest.price * parcentDiscount) / 100).toFixed(2)
            );
          }
        }

        if (mTest.hasTestTube && mTest.testTube.length) {
          mTest.testTube.forEach((tTube: any) => {
            const doexExists = tubes.find(
              (tube: IVacuumTube) => tube.value == tTube.value
            );
            if (!doexExists) {
              tubes.push(tTube);
              tubePrice += tTube.price;
            }
          });
        }
      }
    }
  );
  if (order.vat) {
    vat = Number(
      (
        ((totalTestPrice +
          tubePrice -
          discountBasedOnParcent -
          discountGivenByDoctor -
          cashDiscount) *
          order.vat) /
        100
      ).toFixed(2)
    );
  }

  return {
    totalTestPrice: totalTestPrice,
    tubePrice: tubePrice,
    cashDiscount: cashDiscount,
    discountGivenByDoctor,
    discountBasedOnParcent,
    vat,
  };
};
