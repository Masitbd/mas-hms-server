import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ConditionService } from './condition.service';

const createCondition = catchAsync(async (req: Request, res: Response) => {
  const result = await ConditionService.postCondition(req.body);
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Condition created successfully',
  });
});

const fetchCondition = catchAsync(async (req: Request, res: Response) => {
  const result = await ConditionService.getCondition();
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Conditions featched successfully',
  });
});

const fetchCingleCondition = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ConditionService.getSingleCondition(id);
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Condition featched successfully',
  });
});

const updateCondition = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ConditionService.patchCondition(req.body, id);
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Condition updated successfully',
  });
});

const removeCondition = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ConditionService.deleteCondition(id);
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Condition deleted successfully',
  });
});
export const ConditionController = {
  createCondition,
  fetchCondition,
  fetchCingleCondition,
  updateCondition,
  removeCondition,
};
