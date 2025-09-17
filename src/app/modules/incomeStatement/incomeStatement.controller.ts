import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { incomeStatementServices } from './incomeStatement.service';

const getEmployeeIncomeStatement = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await incomeStatementServices.getEmployeeIncomeStatementFromDB(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Income Statement retrived successfully',
      data: result,
    });
  }
);
const getEmployeeIncomeStatementSummery = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await incomeStatementServices.getEmployeeIncomeStatementSummeryFromDB(
        req.query
      );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Income Statement retrived successfully',
      data: result,
    });
  }
);

// ? get last thenty eighty days income

const getLastTwentyEightDaysPaidAmount = catchAsync(async (req, res) => {
  const result =
    await incomeStatementServices.getLastTwentyEightDaysPaidAmountFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Retrived Successfully',
    success: true,
    data: result,
  });
});
const getDueCollectionStatement = catchAsync(async (req, res) => {
  const result = await incomeStatementServices.getDueCollectionStatementFromDB(
    req.query
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Retrived due collection statement Successfully',
    success: true,
    data: result,
  });
});

// export

export const incomeStatementControllers = {
  getEmployeeIncomeStatementSummery,
  getEmployeeIncomeStatement,
  getLastTwentyEightDaysPaidAmount,
  getDueCollectionStatement,
};
