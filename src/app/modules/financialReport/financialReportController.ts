import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { FinancialReportService } from './financialReport.service';

const getOverAllComission = catchAsync(async (req: Request, res: Response) => {
  const filteredField = pick(req.query, ['from', 'to']);
  const result = await FinancialReportService.fetchOverAllComission(
    filteredField as unknown as { from: Date; to: Date }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Overall report featched successfully',
    data: result,
  });
});

const getDoctorPerformanceSUmmery = catchAsync(
  async (req: Request, res: Response) => {
    const filteredField = pick(req.query, ['from', 'to']);

    const result = await FinancialReportService.fetchDoctorPerformanceSummery({
      refBy: req.params.id,
      from: filteredField.from as unknown as Date,
      to: filteredField.to as unknown as Date,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Performance report featched successfully',
      data: result,
    });
  }
);

const getTestWiseIncomeStatement = catchAsync(
  async (req: Request, res: Response) => {
    const filteredField = pick(req.query, ['from', 'to']);

    const result = await FinancialReportService.fetchTestWiseIncomeStatement({
      from: filteredField.from as unknown as Date,
      to: filteredField.to as unknown as Date,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Test wis income statement featched successfully',
      data: result,
    });
  }
);
const getDeptWiseIncomeStatement = catchAsync(
  async (req: Request, res: Response) => {
    const filteredField = pick(req.query, ['from', 'to']);

    const result = await FinancialReportService.fetchDeptWiseIncomeStatement({
      from: filteredField.from as unknown as Date,
      to: filteredField.to as unknown as Date,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Department wise income statement featched successfully',
      data: result,
    });
  }
);

const getDeptWIseCollectionSummery = catchAsync(
  async (req: Request, res: Response) => {
    const filteredField = pick(req.query, ['from', 'to']);

    const result = await FinancialReportService.fetchDeptWiseCollectionSummery({
      from: filteredField.from as unknown as Date,
      to: filteredField.to as unknown as Date,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Department wise collection statement featched successfully',
      data: result,
    });
  }
);

const getDeptWiseDoctorPerformance = catchAsync(
  async (req: Request, res: Response) => {
    const filteredField = pick(req.query, ['from', 'to']);

    const result = await FinancialReportService.fetchDeptWIseDoctorPerformance({
      from: filteredField.from as unknown as Date,
      to: filteredField.to as unknown as Date,
      refBy: req.params.id,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        'Department wise doctor Performance summery featched successfully',
      data: result,
    });
  }
);

const getTestWiseDoctorPerformance = catchAsync(
  async (req: Request, res: Response) => {
    const filteredField = pick(req.query, ['from', 'to']);

    const result = await FinancialReportService.fetchTestWIseDoctorPerformance({
      from: filteredField.from as unknown as Date,
      to: filteredField.to as unknown as Date,
      refBy: req.params.id,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Test wise doctor Performance summery featched successfully',
      data: result,
    });
  }
);

const clientWiseIncomeStatement = catchAsync(
  async (req: Request, res: Response) => {
    const filteredField = pick(req.query, ['from', 'to']);

    const result = await FinancialReportService.clientWiseIncomeStatement({
      from: filteredField.from as unknown as Date,
      to: filteredField.to as unknown as Date,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Client wise income statement featched successfully',
      data: result,
    });
  }
);

const refByWiseIncomeStatement = catchAsync(
  async (req: Request, res: Response) => {
    const filteredField = pick(req.query, ['from', 'to']);

    const result = await FinancialReportService.refByWIseIncomeStatement({
      from: filteredField.from as unknown as Date,
      to: filteredField.to as unknown as Date,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'RefBy wise income statement featched successfully',
      data: result,
    });
  }
);

const getEmployeeLedger = catchAsync(async (req: Request, res: Response) => {
  const filteredField = pick(req.query, ['from', 'to']);

  const result = await FinancialReportService.getEmployeeLedger({
    from: filteredField.from as unknown as Date,
    to: filteredField.to as unknown as Date,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Employee Ledger featched successfully',
    data: result,
  });
});

const getAllTests = catchAsync(async (req: Request, res: Response) => {
  const result = await FinancialReportService.fetchAllTest();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tests featched successfully',
    data: result,
  });
});

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const result = await FinancialReportService.feacthALlDoctor();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'DOctors featched successfully',
    data: result,
  });
});

const marketingExecutivePerformance = catchAsync(
  async (req: Request, res: Response) => {
    const filteredField = pick(req.query, ['from', 'to', 'id']);
    const result = await FinancialReportService.marketingExecutivePerformance({
      from: filteredField.from as unknown as Date,
      to: filteredField.to as unknown as Date,
      id: filteredField.id as string,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Marketing Executive Performance featched successfully',
      data: result,
    });
  }
);
export const FinancialReportController = {
  getOverAllComission,
  getDoctorPerformanceSUmmery,
  getTestWiseIncomeStatement,
  getDeptWiseIncomeStatement,
  getDeptWIseCollectionSummery,
  getDeptWiseDoctorPerformance,
  getTestWiseDoctorPerformance,
  clientWiseIncomeStatement,
  refByWiseIncomeStatement,
  getEmployeeLedger,
  getAllTests,
  getAllDoctors,
  marketingExecutivePerformance,
};
