import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { ReportTypeGroupService } from './reportType.service';
import { IFilterableOptions } from './reportTypeGroup.interface';
import { filterableFields } from './reportyTypeGroup.constant';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportTypeGroupService.post(req.body);
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Resource Limits fetched successfully',
  });
});
const update = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportTypeGroupService.patch({
    id: req.params.id,
    data: req.body,
  });
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Resource Limits fetched successfully',
  });
});

const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportTypeGroupService.fetchSingle(req.params.id);
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Resource Limits fetched successfully',
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const filteredQueryFields = pick(query, filterableFields);
  const result = await ReportTypeGroupService.fetchAll(
    filteredQueryFields as unknown as IFilterableOptions
  );

  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: 'Resource Limits fetched successfully',
  });
});

export const ReportTypeGroupController = {
  createNew,
  update,
  getSingle,
  getAll,
};
