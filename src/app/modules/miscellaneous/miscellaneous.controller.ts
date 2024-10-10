import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MiscellaneousService } from './miscellaneous.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await MiscellaneousService.post(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Miscellaneous was created Successfully',
    data: result,
  });
});

const getSingle = catchAsync(async (req: Request, res: Response) => {

  const id = req.params.id;
  const result = await MiscellaneousService.getSingle(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Single Miscellaneous fetched was  Group Successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filterOption = req.query;
  let filter = '';

  if (Object.keys(filterOption).includes('title')) {
    if (filterOption?.title && (filterOption?.title.length as number) > 0) {
      filter = filterOption?.title as string;
    }
  }

  const result = await MiscellaneousService.getALl(filter);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Miscellaneous all fetched was Successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;

  const result = await MiscellaneousService.patch(updatedData, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Miscellaneous was updated successfully',
    data: result,
  });
});

//  get margin data

const getMarginData = catchAsync(async (req: Request, res: Response) => {
  console.log('hit api');
  const result = await MiscellaneousService.getMarginDataFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Single Miscellaneous fetched was  Group Successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await MiscellaneousService.remove(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Miscellaneous deleted successfully',
    data: result,
  });
});

export const MiscellaneousController = {
  create,
  getSingle,
  getAll,
  update,
  remove,
  getMarginData,
};
