import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReportGroupServices } from './reportGroup.services';

//Controller function for getting all the specimen
const getAllReportGroup = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await ReportGroupServices.getAllReportGroup();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specimen all fetched successfully',
      data: result,
    });
  }
);

// Controller function for getting a specific specimen
const getSingleReportGroup = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const result = await ReportGroupServices.getSingleReportGroup(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specimen fetched successfully',
      data: result,
    });
  }
);

// For creating new ReportGroup
const createReportGroup = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await ReportGroupServices.createReportGroup(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specimen was created successfully',
      data: result,
    });
  }
);

// Controller function for editing existing specimen
const updateReportGroup = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = ReportGroupServices.updateReportGroup(
      req.body,
      req.params.id
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specimen was edited successfully',
      data: result,
    });
  }
);

// Controller function for remove specimen
const deleteReportGroup = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = ReportGroupServices.deleteReportGroup(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specimen was deleted successfully',
      data: result,
    });
  }
);

export const ReportGroupController = {
  createReportGroup,
  updateReportGroup,
  getSingleReportGroup,
  getAllReportGroup,
  deleteReportGroup,
};
