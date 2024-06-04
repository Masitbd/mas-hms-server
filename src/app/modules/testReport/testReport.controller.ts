import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TestReportService } from './testReport.services';

// //Controller function for getting all the Test Report
const getAllTestReport = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await TestReportService.getAllTestReport();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Test Report all fetched successfully',
      data: result,
    });
  }
);

// Controller function for getting a specific Test Report
const getSingleTestReport = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const result = await TestReportService.getSingleTestReport(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Test Report successfully',
      data: result,
    });
  }
);

const getSingleTestReportPrint = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    console.log(id, '37');

    const result = await TestReportService.getSingleTestReportPrint(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Test Report fetched print successfully',
      data: result,
    });
  }
);

// For creating new Test Report
const createTestReport = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
    const result = TestReportService.createTestReport(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Test Report was created successfully',
      data: result,
    });
  }
);

// Controller function for remove Test Report
const deleteTestReport = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = TestReportService.deleteTestReport(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Test Report was deleted successfully',
      data: result,
    });
  }
);

export const TestReportController = {
  createTestReport,
  getSingleTestReportPrint,
  getSingleTestReport,
  getAllTestReport,
  deleteTestReport,
};
