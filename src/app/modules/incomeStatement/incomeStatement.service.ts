/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage } from 'mongoose';
import { Doctor } from '../doctor/doctor.model';
import { Order } from '../order/order.model';
import { Test } from '../test/test.model';

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
        path: '$userDetails', // Unwind the user details array
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          groupDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          postedBy: '$postedBy', // Group by user ID (postedBy)
          name: '$userDetails.name', // Include user name in the group
        },
        totalPaid: { $sum: '$paid' }, // Sum total paid amount for each
        records: {
          $push: {
            oid: '$oid',
            uuid: '$uuid',
            amount: '$paid',
            totalPaid: { $sum: '$paid' },
            date: '$createdAt',
          },
        },
      },
    },
    {
      $sort: { '_id.groupDate': -1 }, // Sort by group date
    },
    {
      $group: {
        _id: '$_id.groupDate', // Group by date
        users: {
          $push: {
            postedBy: '$_id.name',
            totalPaid: { $sum: '$paid' }, // Include total paid amount for each user
            paid: '$paid',
            totalPrice: '$totalPrice',
            vat: '$vat',
            records: '$records',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        groupDate: '$_id',
        users: 1,
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
    startDate.setUTCDate(startDate.getUTCDate() - 77);
    startDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC

    const totalIncomeResult = await Order.aggregate([
      { $group: { _id: null, totalIncome: { $sum: '$paid' } } },
    ]);
    const totalIncome = totalIncomeResult[0]?.totalIncome || 0;

    //  calculate total doctor
    const totalDoctors = await Doctor.countDocuments();
    const totalTests = await Test.countDocuments();

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
      totalDoctors,
      totalTests,
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

export const incomeStatementServices = {
  getEmployeeIncomeStatementFromDB,
  getEmployeeIncomeStatementSummeryFromDB,
  getLastTwentyEightDaysPaidAmountFromDB,
};
