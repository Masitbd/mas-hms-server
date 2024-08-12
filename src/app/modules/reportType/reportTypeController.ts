import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReportTypeService } from './reportType.service';

const postNewReportType = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportTypeService.postReportType(req.body);
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report Type was created successfully',
  });
});

const updateReportType = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportTypeService.patchReportType({
    id: req.params.id,
    data: req.body,
  });
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report Type updated successfully',
  });
});

const getSingleReportType = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportTypeService.fetchSingleReportType(req.params.id);
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report Type featched successfully',
  });
});

const getAllReportType = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportTypeService.fetchAllReportType(req.query);
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report Type was created successfully',
  });
});

export const ReportTypeController = {
  postNewReportType,
  updateReportType,
  getSingleReportType,
  getAllReportType,
};
