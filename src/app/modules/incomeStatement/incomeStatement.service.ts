/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage } from 'mongoose';
import { Order } from '../order/order.model';
import { Refund } from '../refund/refund.model';
import { Transation } from '../transaction/transaction.model';

const getEmployeeIncomeStatementFromDB = async (
  payload: Record<string, any>
) => {
  // Default to current date if no startDate and endDate are provided
  const startDate = payload.startDate
    ? new Date(payload.startDate)
    : new Date();
  const endDate = payload.endDate ? new Date(payload.endDate) : new Date();

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
        from: 'profiles',
        localField: 'postedBy',
        foreignField: 'uuid',
        as: 'userDetails',
      },
    },
    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          groupDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          postedBy: '$postedBy',
          name: '$userDetails.name',
        },
        totalPaid: { $sum: '$paid' },
        records: {
          $push: {
            oid: '$oid',
            uuid: '$uuid',
            name: '$patient.name',
            amount: '$paid',
            date: '$createdAt',
          },
        },
      },
    },
    {
      $sort: { '_id.groupDate': -1 },
    },
    {
      $group: {
        _id: '$_id.groupDate',
        users: {
          $push: {
            postedBy: '$_id.postedBy',
            name: '$_id.name',
            totalPaid: '$totalPaid',
            records: '$records',
          },
        },
        dayTotal: { $sum: '$totalPaid' },
      },
    },
    {
      $group: {
        _id: null,
        data: {
          $push: {
            groupDate: '$_id',
            users: '$users',
            dayTotal: '$dayTotal',
          },
        },
        grandTotal: { $sum: '$dayTotal' },
      },
    },
    {
      $project: {
        _id: 0,
        records: '$data',
        grandTotal: 1,
      },
    },
  ];

  const result = await Order.aggregate(query);
  return result;
};

///

const getEmployeeIncomeStatementSummeryFromDB = async (
  payload: Record<string, any>
) => {
  // Default to current date if no startDate and endDate are provided
  const startDate = payload.startDate
    ? new Date(payload.startDate)
    : new Date();
  const endDate = payload.endDate ? new Date(payload.endDate) : new Date();
  startDate.setUTCHours(0, 0, 0, 0);

  endDate.setUTCHours(23, 59, 59, 999);

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
        from: 'profiles',
        localField: 'postedBy',
        foreignField: 'uuid',
        as: 'userDetails',
      },
    },

    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          groupDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          postedBy: '$postedBy',
          name: '$userDetails.name',
        },
        totalPaid: { $sum: '$paid' },
        uuid: { $first: '$postedBy' },
      },
    },
    {
      $sort: { '_id.groupDate': 1 }, // Sort by group date
    },
    {
      $group: {
        _id: '$_id.groupDate', // Group by date
        records: {
          $push: {
            name: '$_id.name', // Push the user's name
            totalPaid: '$totalPaid', // Include total paid amount
            uuid: '$uuid', // Include the user's UUID
          },
        },
        grandTotal: { $sum: 'totalPaid' },
      },
    },
    {
      $project: {
        _id: 0,
        groupDate: '$_id', // Rename _id to groupDate
        records: 1, // Include the records array
        grandTotal: { $sum: 'totalPaid' },
      },
    },
  ];

  const result = await Order.aggregate(query);
  return result;
};

// ? total income last 28 day

const getLastTwentyEightDaysPaidAmountFromDB = async () => {
  try {
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - 30);
    startDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
    // ? total income of paid amount

    const totalIncomeResult = await Order.aggregate([
      { $group: { _id: null, totalIncome: { $sum: '$paid' } } },
    ]);
    const totalIncome = totalIncomeResult[0]?.totalIncome || 0;

    // ! total due

    const totalDueResult = await Order.aggregate([
      { $group: { _id: null, totalDue: { $sum: '$dueAmount' } } },
    ]);
    const totalDue = totalDueResult[0]?.totalDue || 0;

    //? today total paid
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0); // Start of today
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    const todayTotalPaidResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          todayTotalPaid: { $sum: '$paid' },
        },
      },
    ]);
    const todayTotalPaid = todayTotalPaidResult[0]?.todayTotalPaid || 0;

    //? today total due collection

    const todayTotalDuePaidResult = await Transation.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd },
          description: 'Collected due amount',
        },
      },
      {
        $group: {
          _id: null,
          todayTotalDuePaid: { $sum: '$amount' },
        },
      },
    ]);

    const todayTotalDuePaid =
      todayTotalDuePaidResult[0]?.todayTotalDuePaid || 0;

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: '%d-%m-%Y',
              date: '$createdAt',
              timezone: 'UTC',
            },
          },
          dailyIncome: { $sum: '$paid' },
        },
      },
      // Step 3: Sort by day to have a chronological list
      { $sort: { _id: 1 } },
    ]);

    const firstPeriodIncome = result
      .slice(0, 14)
      .reduce((acc, day) => acc + day.dailyIncome, 0);
    const secondPeriodIncome = result
      .slice(14)
      .reduce((acc, day) => acc + day.dailyIncome, 0);

    // Calculate the percentage change
    const percentageChange =
      firstPeriodIncome > 0
        ? ((secondPeriodIncome - firstPeriodIncome) / totalIncome) * 100
        : null;
    const trendType =
      typeof percentageChange === 'number' && percentageChange > 0
        ? 'increase'
        : 'decrease';

    return {
      totalIncome,
      todayTotalPaid,
      todayTotalDuePaid,
      totalDue,
      dailyBreakdown: result.map(day => ({
        date: day._id,
        income: day.dailyIncome,
      })),
      trend: {
        type: trendType,
        percentageChange:
          percentageChange !== null ? percentageChange.toFixed(2) : 'N/A',
        firstPeriodIncome,
        secondPeriodIncome,
      },
    };
  } catch (error) {
    throw new Error('Something went wrong');
  }
};

//! Due Bill Collection Statement
const getDueCollectionStatementFromDB = async (query: Record<string, any>) => {
  const { oid } = query;

  const fromDate = new Date(query.startDate);
  const toDate = new Date(query.endDate);
  fromDate.setUTCHours(0, 0, 0, 0);

  toDate.setUTCHours(23, 59, 59, 999);
  // Initialize the match stage with an empty filter
  const match: Record<string, any> = {};

  // Apply OID filter if provided
  if (oid) {
    match.oid = oid;
  }

  // Apply date range filter if provided

  match.createdAt = {
    $gte: fromDate,
    $lte: toDate,
  };
  match.description = 'Collected due amount';

  const result = await Transation.aggregate([
    // Apply the match filter for oid, refBy, or date range
    { $match: match },

    {
      $lookup: {
        from: 'orders',
        localField: 'ref',
        foreignField: '_id',
        as: 'orderInfo',
      },
    },

    { $unwind: { path: '$orderInfo', preserveNullAndEmptyArrays: true } },

    // Lookup the 'tests.test' field to populate test details
    {
      $lookup: {
        from: 'users',
        localField: 'postedBy',
        foreignField: 'uuid',
        as: 'employeeDetails',
      },
    },

    {
      $unwind: { path: '$employeeDetails', preserveNullAndEmptyArrays: true },
    },

    // Project required fields
    {
      $project: {
        oid: '$orderInfo.oid',
        totalPrice: '$orderInfo.totalPrice',
        cashDiscount: '$orderInfo.cashDiscount',
        parcentDiscount: '$orderInfo.parcentDiscount',
        totalDiscount: {
          $add: [
            '$orderInfo.cashDiscount',
            {
              $divide: [
                {
                  $multiply: [
                    '$orderInfo.totalPrice',
                    '$orderInfo.parcentDiscount',
                  ],
                },
                100,
              ],
            },
          ],
        },
        // <div className="py-1 ps-1">
        //         {dueBill?.totalPaid - dueBill.amount}
        //       </div>
        //       <div className="py-1 ps-1">
        //         {dueBill?.totalDue + dueBill?.amount}
        //       </div>
        amount: 1,
        totalPaid: { $subtract: ['$orderInfo.paid', '$amount'] },

        totalDue: { $add: ['$orderInfo.dueAmount', '$amount'] },
        dueAmount: '$orderInfo.dueAmount',
        totalAmount: '$totalAmount',
        patientData: '$orderInfo.patient',
        // testDetails: '$testDetails',
        createdAt: 1,
      },
    },

    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        records: { $push: '$$ROOT' },
        groupTotalCollection: { $sum: '$amount' }, // optional aggregate sum
        grouptotaDueCollection: { $sum: '$totalPaid' }, // optional sum
        grouptotaDueAmount: { $sum: '$totalDue' }, // optional sum
        groupDueAmount: { $sum: '$dueAmount' }, // optional sum
        grouptotaBill: { $sum: '$totalPrice' }, // optional sum
        grouptotaDiscount: { $sum: '$totalDiscount' }, // optional sum
      },
    },
    {
      $group: {
        _id: null,
        groupDate: { $push: '$$ROOT' },
        grandTotalCollection: { $sum: '$groupTotalCollection' },
        grandTotalDueCollection: { $sum: '$grouptotaDueCollection' },
        grandTotalDueAmount: { $sum: '$grouptotaDueAmount' },
        grandDueAmount: { $sum: '$groupDueAmount' },
        grandTotalBill: { $sum: '$grouptotaBill' },
        grandTotalDiscount: { $sum: '$grouptotaDiscount' },
      },
    },

    {
      $sort: { createdAt: -1 },
    },
  ]);

  return result;
};

// ! get refund statement

const getRefundStatementFromDB = async (query: Record<string, any>) => {
  const startDate = query.startDate ? new Date(query.startDate) : new Date();
  const endDate = query.endDate ? new Date(query.endDate) : new Date();
  startDate.setUTCHours(0, 0, 0, 0);

  endDate.setUTCHours(23, 59, 59, 999);

  // pipleline

  const pipeline: PipelineStage[] = [
    // match
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
        from: 'orders',
        localField: 'oid',
        foreignField: 'oid',
        as: 'orderInfo',
      },
    },
    {
      $unwind: {
        path: '$orderInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    //

    {
      $addFields: {
        refundedTests: {
          $filter: {
            input: '$orderInfo.tests',
            as: 'test',
            cond: { $eq: ['$$test.status', 'refunded'] },
          },
        },
      },
    },

    // 👇 Unwind only the refunded tests
    {
      $unwind: {
        path: '$refundedTests',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 👇 Lookup details of refunded tests from `tests` collection
    {
      $lookup: {
        from: 'tests',
        localField: 'refundedTests.test',
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
                { $gt: [{ $ifNull: ['$orderInfo.tests.discount', 0] }, 0] },
                { $gt: [{ $ifNull: ['$orderInfo.parcentDiscount', 0] }, 0] },
              ],
            },
            then: {
              $cond: {
                if: { $gt: [{ $ifNull: ['$orderInfo.tests.discount', 0] }, 0] },
                then: {
                  $divide: [
                    {
                      $multiply: [
                        '$testDetails.price',
                        { $ifNull: ['$orderInfo.tests.discount', 0] },
                      ],
                    },
                    100,
                  ],
                },
                else: {
                  $divide: [
                    {
                      $multiply: [
                        '$orderInfo.totalPrice',
                        { $ifNull: ['$orderInfo.parcentDiscount', 0] },
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

        cd: { $ifNull: ['$orderInfo.cashDiscount', 0] },

        vatAmount: {
          $cond: {
            if: { $gt: ['$orderInfo.vat', 0] },
            then: {
              $multiply: [
                {
                  $subtract: [
                    '$orderInfo.totalPrice', // DB থেকে আসা totalPrice
                    {
                      $add: [{ $ifNull: ['$cd', 0] }, { $ifNull: ['$pd', 0] }],
                    },
                  ],
                },
                { $divide: ['$orderInfo.vat', 100] },
              ],
            },
            else: 0,
          },
        },

        // 👉 নতুন ফিল্ড: vat সহ total
        priceWithVat: {
          $add: ['$orderInfo.totalPrice', { $ifNull: ['$vatAmount', 0] }],
        },
      },
    },

    {
      $addFields: {
        pd: {
          $cond: {
            if: {
              $or: [
                { $gt: [{ $ifNull: ['$orderInfo.tests.discount', 0] }, 0] },
                { $gt: [{ $ifNull: ['$orderInfo.parcentDiscount', 0] }, 0] },
              ],
            },
            then: {
              $cond: {
                if: { $gt: [{ $ifNull: ['$orderInfo.tests.discount', 0] }, 0] },
                then: {
                  $divide: [
                    {
                      $multiply: [
                        '$testDetails.price',
                        { $ifNull: ['$orderInfo.tests.discount', 0] },
                      ],
                    },
                    100,
                  ],
                },
                else: {
                  $divide: [
                    {
                      $multiply: [
                        '$orderInfo.totalPrice',
                        { $ifNull: ['$orderInfo.parcentDiscount', 0] },
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

        cd: { $ifNull: ['$orderInfo.cashDiscount', 0] },

        vatAmount: {
          $cond: {
            if: { $gt: ['$orderInfo.vat', 0] },
            then: {
              $multiply: [
                {
                  $subtract: [
                    '$orderInfo.totalPrice', // DB থেকে আসা totalPrice
                    {
                      $add: [{ $ifNull: ['$cd', 0] }, { $ifNull: ['$pd', 0] }],
                    },
                  ],
                },
                { $divide: ['$orderInfo.vat', 100] },
              ],
            },
            else: 0,
          },
        },

        // 👉 নতুন ফিল্ড: vat সহ total
        priceWithVat: {
          $add: ['$orderInfo.totalPrice', { $ifNull: ['$vatAmount', 0] }],
        },
      },
    },
    {
      $group: {
        _id: {
          groupDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
        },
        totalPrice: { $first: '$orderInfo.totalPrice' }, // শুধু DB থেকে totalPrice
        totalTestPrice: { $sum: '$testDetails.price' },
        testDetails: { $push: '$testDetails' },
        discountedPrice: { $first: '$discountedPrice' },
        vat: { $first: '$vatAmount' },
        priceWithVat: { $first: '$priceWithVat' }, // আলাদা করে রাখলাম
        finalPrice: { $first: '$finalPrice' },
        dueAmount: { $first: '$dueAmount' },
        paid: { $first: '$paid' },
        uuid: { $first: '$uuid' },

        records: {
          $push: {
            oid: '$orderInfo.oid',
            uuid: '$orderInfo.uuid',
            totalPrice: '$orderInfo.totalPrice', // DB value
            refundAmount: '$netAmount',
            vat: '$vatAmount',
            priceWithVat: '$priceWithVat',
            finalPrice: '$finalPrice',
            cashDiscount: '$cd',
            parcentDiscountAmount: '$pd',
            totalDis: {
              $add: [{ $ifNull: ['$cd', 0] }, { $ifNull: ['$pd', 0] }],
            },
            totalAmount: {
              $subtract: [
                '$priceWithVat', // DB totalPrice + vat
                { $add: [{ $ifNull: ['$cd', 0] }, { $ifNull: ['$pd', 0] }] },
              ],
            },
            paid: { $subtract: ['$amount', '$refundAmount'] },
          },
        },
      },
    },

    { $addFields: { 'records.totalTestPrice': '$totalTestPrice' } },

    {
      $sort: { createDeflate: -1 },
    },
    {
      $group: {
        _id: '$_id.groupDate',

        records: { $push: { $first: '$records' } },
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

  const result = await Refund.aggregate(pipeline);
  return result;
};

export const incomeStatementServices = {
  getEmployeeIncomeStatementFromDB,
  getEmployeeIncomeStatementSummeryFromDB,
  getLastTwentyEightDaysPaidAmountFromDB,
  getDueCollectionStatementFromDB,
  getRefundStatementFromDB,
};
