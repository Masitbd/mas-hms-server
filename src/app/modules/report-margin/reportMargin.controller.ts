import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MarginService } from './reportMargin.service';

//Controller function for getting all the specimen
const CreateMargin = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await MarginService.createMargin(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Margin Posted successfully',
      data: result,
    });
  }
);

const getMargin = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await MarginService.getMargin();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Margin retrieved successfully',
      data: result,
    });
  }
);

export const MarginController = { CreateMargin, getMargin };
