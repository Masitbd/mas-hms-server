/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage } from 'mongoose';
import { Order } from '../order/order.model';
import { Refund } from '../refund/refund.model';
import { Transation } from '../transaction/transaction.model';
import { buildRefundedGroups } from './IncomeSummery.helpers';
import { applyRefundsToDaySummery, DaySummery } from './incomeSummery.utils';

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
        paid: { $ne: 0 },
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
  const refunds = await Refund.aggregate([
    {
      $match: {
        createdAt: {
          $lte: endDate,
          $gte: startDate,
        },
      },
    },
    {
      $group: {
        _id: '$oid',
        refundApplied: { $sum: '$refundApplied' },
        remainingRefund: { $sum: '$remainingRefund' },
      },
    },
  ]);

  const { daySummery: updated } = applyRefundsToDaySummery(
    result as unknown as DaySummery,
    refunds
  );
  return updated;
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

  const orderData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        paid: { $ne: 0 },
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
      $project: {
        oid: 1,
        paid: 1,
        createdAt: 1,
        postedBy: 1,
        userDetails: {
          name: 1,
          uuid: 1,
        },
      },
    },
  ]);
  const refunds = await Refund.aggregate([
    {
      $match: {
        createdAt: {
          $lte: endDate,
          $gte: startDate,
        },
      },
    },
    {
      $group: {
        _id: '$oid',
        refundApplied: { $sum: '$refundApplied' },
        remainingRefund: { $sum: '$remainingRefund' },
      },
    },
  ]);

  const testResult = buildRefundedGroups(orderData, refunds, {
    grandTotalFromSum: true,
  });
  return testResult;
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

  // const pipeline: PipelineStage[] = [
  //   // match
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
  //       from: 'orders',
  //       localField: 'oid',
  //       foreignField: 'oid',
  //       as: 'orderInfo',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$orderInfo',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   //

  //   {
  //     $addFields: {
  //       refundedTests: {
  //         $filter: {
  //           input: '$orderInfo.tests',
  //           as: 'test',
  //           cond: { $eq: ['$$test.status', 'refunded'] },
  //         },
  //       },
  //     },
  //   },

  //   // 👇 Unwind only the refunded tests
  //   {
  //     $unwind: {
  //       path: '$refundedTests',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },

  //   // 👇 Lookup details of refunded tests from `tests` collection
  //   {
  //     $lookup: {
  //       from: 'tests',
  //       localField: 'refundedTests.test',
  //       foreignField: '_id',
  //       as: 'testDetails',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$testDetails',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },

  //   // ? calculate discount to add field
  //   {
  //     $addFields: {
  //       pd: {
  //         $cond: {
  //           if: {
  //             $or: [
  //               { $gt: [{ $ifNull: ['$refundedTests.discount', 0] }, 0] },
  //               { $gt: [{ $ifNull: ['$orderInfo.parcentDiscount', 0] }, 0] },
  //             ],
  //           },
  //           then: {
  //             $cond: {
  //               if: { $gt: [{ $ifNull: ['$refundedTests.discount', 0] }, 0] },
  //               then: {
  //                 $divide: [
  //                   {
  //                     $multiply: [
  //                       '$testDetails.price',
  //                       { $ifNull: ['$refundedTests.discount', 0] },
  //                     ],
  //                   },
  //                   100,
  //                 ],
  //               },
  //               else: {
  //                 $divide: [
  //                   {
  //                     $multiply: [
  //                       '$orderInfo.totalPrice',
  //                       { $ifNull: ['$orderInfo.parcentDiscount', 0] },
  //                     ],
  //                   },
  //                   100,
  //                 ],
  //               },
  //             },
  //           },
  //           else: 0,
  //         },
  //       },

  //       cd: { $ifNull: ['$orderInfo.cashDiscount', 0] },

  //       vatAmount: {
  //         $cond: {
  //           if: { $gt: ['$orderInfo.vat', 0] },
  //           then: {
  //             $multiply: [
  //               {
  //                 $subtract: [
  //                   '$orderInfo.totalPrice',
  //                   {
  //                     $add: [{ $ifNull: ['$cd', 0] }, { $ifNull: ['$pd', 0] }],
  //                   },
  //                 ],
  //               },
  //               { $divide: ['$orderInfo.vat', 100] },
  //             ],
  //           },
  //           else: 0,
  //         },
  //       },

  //       priceWithVat: {
  //         $add: ['$orderInfo.totalPrice', { $ifNull: ['$vatAmount', 0] }],
  //       },
  //     },
  //   },

  //   // Group by each refund entry (no early $first)
  //   // {
  //   //   $group: {
  //   //     _id: {
  //   //       groupDate: {
  //   //         $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
  //   //       },
  //   //       oid: '$orderInfo.oid',
  //   //       refundId: '$_id', // ensure each refund stays unique
  //   //     },
  //   //     totalPrice: { $first: '$orderInfo.totalPrice' },
  //   //     totalTestPrice: { $sum: '$testDetails.price' },
  //   //     vat: { $first: '$vatAmount' },
  //   //     priceWithVat: { $first: '$priceWithVat' },
  //   //     cashDiscount: { $first: '$cd' },
  //   //     parcentDiscountAmount: { $first: '$pd' },
  //   //     refundAmount: { $first: '$netAmount' },
  //   //     testName: { $first: '$testDetails.label' },
  //   //   },
  //   // },

  //   // // Now group by date — keep all refund records separate
  //   // {
  //   //   $group: {
  //   //     _id: '$_id.groupDate',
  //   //     records: {
  //   //       $push: {
  //   //         oid: '$_id.oid',
  //   //         refundId: '$_id.refundId',
  //   //         totalPrice: '$totalPrice',
  //   //         totalTestPrice: '$totalTestPrice',
  //   //         testName: '$testName',
  //   //         refundAmount: '$refundAmount',
  //   //         vat: '$vat',
  //   //         priceWithVat: '$priceWithVat',
  //   //         cashDiscount: '$cashDiscount',
  //   //         parcentDiscountAmount: '$parcentDiscountAmount',
  //   //         totalDis: {
  //   //           $add: [
  //   //             { $ifNull: ['$cashDiscount', 0] },
  //   //             { $ifNull: ['$parcentDiscountAmount', 0] },
  //   //           ],
  //   //         },
  //   //         totalAmount: {
  //   //           $subtract: [
  //   //             '$priceWithVat',
  //   //             {
  //   //               $add: [
  //   //                 { $ifNull: ['$cashDiscount', 0] },
  //   //                 { $ifNull: ['$parcentDiscountAmount', 0] },
  //   //               ],
  //   //             },
  //   //           ],
  //   //         },
  //   //       },
  //   //     },
  //   //   },
  //   // },

  //   // // Final projection
  //   // {
  //   //   $project: {
  //   //     _id: 0,
  //   //     groupDate: '$_id',
  //   //     records: 1,
  //   //   },
  //   // },
  //   // 1️⃣ First group: per refundId (keep all details per refund)
  //   // 🧮 Step 1: group per oid per date (same as before)
  //   {
  //     $group: {
  //       _id: {
  //         groupDate: {
  //           $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
  //         },
  //         oid: '$orderInfo.oid',
  //       },
  //       totalPrice: { $first: '$orderInfo.totalPrice' },
  //       totalTestPrice: { $sum: '$testDetails.price' },
  //       totalRefundAmount: { $sum: '$netAmount' },
  //       vat: { $first: '$vatAmount' },
  //       priceWithVat: { $first: '$priceWithVat' },
  //       cashDiscount: { $first: '$cd' },
  //       parcentDiscountAmount: { $first: '$pd' },
  //       testNames: { $addToSet: '$testDetails.label' },
  //     },
  //   },

  //   // 🧾 Step 2: compute derived totals before grouping by date
  //   {
  //     $addFields: {
  //       totalDis: {
  //         $add: [
  //           { $ifNull: ['$cashDiscount', 0] },
  //           { $ifNull: ['$parcentDiscountAmount', 0] },
  //         ],
  //       },
  //       totalAmount: {
  //         $subtract: [
  //           { $ifNull: ['$priceWithVat', 0] },
  //           {
  //             $add: [
  //               { $ifNull: ['$cashDiscount', 0] },
  //               { $ifNull: ['$parcentDiscountAmount', 0] },
  //             ],
  //           },
  //         ],
  //       },
  //     },
  //   },

  //   // 📅 Step 3: group by date for final output
  //   {
  //     $group: {
  //       _id: '$_id.groupDate',
  //       records: {
  //         $push: {
  //           oid: '$_id.oid',
  //           totalPrice: '$totalPrice',
  //           totalTestPrice: '$totalTestPrice',
  //           totalRefundAmount: '$totalRefundAmount',
  //           vat: '$vat',
  //           priceWithVat: '$priceWithVat',
  //           cashDiscount: '$cashDiscount',
  //           parcentDiscountAmount: '$parcentDiscountAmount',
  //           testNames: '$testNames',
  //           totalDis: '$totalDis',
  //           totalAmount: '$totalAmount',
  //         },
  //       },
  //     },
  //   },

  //   // ✅ Step 4: project clean output
  //   {
  //     $project: {
  //       _id: 0,
  //       groupDate: '$_id',
  //       records: 1,
  //     },
  //   },
  // ];

  // First, let's add a debugging pipeline to see what's happening
  // const debugPipeline: PipelineStage[] = [
  //   {
  //     $match: {
  //       createdAt: {
  //         $gte: startDate,
  //         $lte: endDate,
  //       },
  //       oid: 'H251000003', // Debug specific order
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'orders',
  //       localField: 'oid',
  //       foreignField: 'oid',
  //       as: 'orderInfo',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$orderInfo',
  //       preserveNullAndEmptyArrays: true,
  //     },
  //   },
  //   {
  //     $addFields: {
  //       refundedTests: {
  //         $filter: {
  //           input: '$orderInfo.tests',
  //           as: 'test',
  //           cond: { $eq: ['$$test.status', 'refunded'] },
  //         },
  //       },
  //     },
  //   },
  //   // 🔍 DEBUG: Check how many refunded tests exist
  //   {
  //     $project: {
  //       refundId: '$_id',
  //       oid: 1,
  //       netAmount: 1,
  //       refundedTestsCount: { $size: { $ifNull: ['$refundedTests', []] } },
  //       refundedTests: 1,
  //     },
  //   },
  // ];

  // ===== FIXED PIPELINE =====
  const pipeline: PipelineStage[] = [
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

    // ✅ FIX: Only continue if there are refunded tests
    {
      $match: {
        refundedTests: { $ne: [] },
      },
    },

    // Unwind refunded tests
    {
      $unwind: {
        path: '$refundedTests',
      },
    },

    // Lookup test details
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
      },
    },

    // ✅ CRITICAL FIX: Group by refund _id first to avoid duplicates
    {
      $group: {
        _id: {
          refundId: '$_id',
          oid: '$oid',
          testId: '$testDetails._id',
        },
        createdAt: { $first: '$createdAt' },
        netAmount: { $first: '$remainingRefund' },
        testPrice: { $first: '$testDetails.price' },
        testLabel: { $first: '$testDetails.label' },
        orderInfo: { $first: '$orderInfo' },
        refundedTests: { $first: '$refundedTests' },
      },
    },

    {
      $addFields: {
        totalPriceWithoutTube: {
          $subtract: ['$orderInfo.totalPrice', '$orderInfo.tubePrice'],
        },
      },
    },

    // Calculate per-test discount
    {
      $addFields: {
        testPercentDiscount: {
          $cond: {
            if: { $gt: [{ $ifNull: ['$testDetails.discount', 0] }, 0] },
            then: {
              $divide: [
                {
                  $multiply: [
                    '$totalPriceWithoutTube',
                    { $ifNull: ['$testDetails.discount', 0] },
                  ],
                },
                100,
              ],
            },
            else: {
              $cond: {
                if: {
                  $gt: [{ $ifNull: ['$orderInfo.parcentDiscount', 0] }, 0],
                },
                then: {
                  $divide: [
                    {
                      $multiply: [
                        '$totalPriceWithoutTube',
                        { $ifNull: ['$orderInfo.parcentDiscount', 0] },
                      ],
                    },
                    100,
                  ],
                },
                else: 0,
              },
            },
          },
        },

        testCashDiscount: {
          $cond: {
            if: {
              $and: [
                { $gt: [{ $ifNull: ['$orderInfo.cashDiscount', 0] }, 0] },
                { $gt: [{ $ifNull: ['$orderInfo.totalPrice', 0] }, 0] },
              ],
            },
            then: {
              $divide: [
                {
                  $multiply: [
                    '$totalPriceWithoutTube',
                    { $ifNull: ['$orderInfo.cashDiscount', 0] },
                  ],
                },
                '$totalPriceWithoutTube',
              ],
            },
            else: 0,
          },
        },
      },
    },

    {
      $addFields: {
        testPriceAfterDiscount: {
          $subtract: [
            '$totalPriceWithoutTube',
            {
              $add: [
                { $ifNull: ['$testPercentDiscount', 0] },
                { $ifNull: ['$testCashDiscount', 0] },
              ],
            },
          ],
        },
      },
    },

    {
      $addFields: {
        testVatAmount: {
          $cond: {
            if: { $gt: [{ $ifNull: ['$orderInfo.vat', 0] }, 0] },
            then: {
              $multiply: [
                '$testPriceAfterDiscount',
                { $divide: [{ $ifNull: ['$orderInfo.vat', 0] }, 100] },
              ],
            },
            else: 0,
          },
        },
      },
    },

    {
      $addFields: {
        testPriceWithVat: {
          $add: [
            '$totalPriceWithoutTube',
            { $ifNull: ['$testVatAmount', 0] },
            { $ifNull: ['$orderInfo.tubePrice', 0] },
          ],
        },
      },
    },

    // ✅ Group by refund ID to get per-refund totals
    {
      $group: {
        _id: {
          refundId: '$_id.refundId',
          oid: '$_id.oid',
        },
        createdAt: { $first: '$createdAt' },
        netAmount: { $first: '$netAmount' },

        // Sum all tests in THIS refund
        totalTestPrice: { $sum: '$testPrice' },
        totalTestPercentDiscount: { $first: '$testPercentDiscount' },
        totalTestCashDiscount: { $sum: '$testCashDiscount' },
        totalTestVat: { $sum: '$testVatAmount' },
        totalTestPriceWithVat: { $first: '$testPriceWithVat' },

        orderInfo: { $first: '$orderInfo' },
        testNames: { $addToSet: '$testLabel' },
      },
    },

    // Group by oid and date
    {
      $group: {
        _id: {
          groupDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          oid: '$_id.oid',
        },

        // ✅ Sum across all refunds for this oid on this date
        totalTestPrice: { $first: '$totalTestPrice' },
        totalRefundAmount: { $sum: '$netAmount' },
        totalTestPercentDiscount: { $first: '$totalTestPercentDiscount' },
        totalTestCashDiscount: { $first: '$totalTestCashDiscount' },

        totalTestVat: { $first: '$totalTestVat' },
        totalTestPriceWithVat: { $first: '$totalTestPriceWithVat' },

        orderTotalPrice: { $first: '$orderInfo.totalPrice' },
        orderVat: { $first: '$orderInfo.vat' },
        orderCashDiscount: { $first: '$orderInfo.cashDiscount' },
        orderPercentDiscount: { $first: '$orderInfo.parcentDiscount' },
        orderNetPayable: { $first: '$orderInfo.netPayable' },
        orderPaid: { $first: '$orderInfo.paid' },
        orderDue: { $first: '$orderInfo.dueAmount' },

        testNames: { $first: '$testNames' },
      },
    },

    {
      $addFields: {
        totalDis: {
          $add: [
            { $ifNull: ['$totalTestCashDiscount', 0] },
            { $ifNull: ['$totalTestPercentDiscount', 0] },
          ],
        },
      },
    },

    // Group by date
    {
      $group: {
        _id: '$_id.groupDate',
        records: {
          $push: {
            oid: '$_id.oid',
            totalPrice: '$orderTotalPrice',
            totalTestPrice: '$totalTestPrice',
            totalRefundAmount: '$totalRefundAmount',
            vat: '$totalTestVat',
            priceWithVat: '$totalTestPriceWithVat',
            totalCashDiscount: '$totalTestCashDiscount',
            totalParcentDiscountAmount: '$totalTestPercentDiscount',
            cashDiscount: '$orderCashDiscount',
            parcentDiscountAmount: '$orderPercentDiscount',
            netPayable: '$orderNetPayable',
            paid: '$orderPaid',
            due: '$orderDue',
            testNames: '$testNames',
            totalDis: '$totalDis',
            totalAmount: '$totalTestPriceWithVat',
          },
        },
        grandTotal: { $sum: '$totalRefundAmount' },
      },
    },

    // {
    //   $project: {
    //     _id: 0,
    //     groupDate: '$_id',
    //     records: 1,
    //     grandTotal: 1,
    //   },
    // },
    {
      $group: {
        _id: null,
        records: { $push: '$$ROOT' },
        overallGrandTotal: { $sum: '$grandTotal' },
      },
    },
  ];

  const result = await Refund.aggregate(pipeline);

  // console.log(JSON.stringify(result));
  return result;
};

export const incomeStatementServices = {
  getEmployeeIncomeStatementFromDB,
  getEmployeeIncomeStatementSummeryFromDB,
  getLastTwentyEightDaysPaidAmountFromDB,
  getDueCollectionStatementFromDB,
  getRefundStatementFromDB,
};
