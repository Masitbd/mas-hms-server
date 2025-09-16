/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage } from 'mongoose';
import { Order } from '../order/order.model';
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
      // $project: {
      //   _id: 1,
      //   oid: 1,
      //   totalPrice: 1,
      //   cashDiscount: '$orderInfo.cashDiscount',
      //   parcentDiscount: '$orderInfo.parcentDiscount',

      //   paid: 1,
      //   vat: 1,
      //   refDoctor: { name: 1 }, // Include only the doctor's name

      //   createdAt: 1,
      // },
      $project: {
        oid: '$orderInfo.oid',
        totalPrice: '$orderInfo.totalPrice',
        cashDiscount: '$orderInfo.cashDiscount',
        parcentDiscount: '$orderInfo.parcentDiscount',
        totalDiscount: {
          $add: ['$orderInfo.cashDiscount', '$orderInfo.parcentDiscount'],
        },

        amount: 1,
        totalPaid: '$orderInfo.paid',
        totalDue: '$orderInfo.dueAmount',
        totalAmount: '$totalAmount',
        patientData: '$orderInfo.patient',
        // testDetails: '$testDetails',
        createdAt: '$createdAt',
      },
    },

    {
      $sort: { createdAt: -1 },
    },
    // Bill No,
    // Patient Name,
    // Total Bill,
    // Total Discount,
    // Previous Collection,
    // Due Amount,
    // Due Collection,
    // Balance Due
    // Group the results by refBy.name
    // {
    //   $group: {
    //     _id: '$refDoctor.name', // Group by doctor name (refBy)
    //     records: {
    //       $push:
    //     },
    //   },
    // },

    // // Rename the _id field to refBy for clarity
    // {
    //   $project: {
    //     _id: 0, // Exclude _id
    //     refBy: '$_id', // Rename _id to refBy
    //     records: 1, // Include the records array
    //   },
    // },
  ]);

  return result;
};

export const incomeStatementServices = {
  getEmployeeIncomeStatementFromDB,
  getEmployeeIncomeStatementSummeryFromDB,
  getLastTwentyEightDaysPaidAmountFromDB,
  getDueCollectionStatementFromDB,
};
