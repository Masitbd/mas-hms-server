import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { testFiltarableFields } from './test.constant';
import { ITest } from './test.interfacs';
import { TestServices } from './test.services';

const createNewTest = catchAsync(async (req: Request, res: Response) => {
  const testData = req.body;

  const result = await TestServices.postTest(testData as unknown as ITest);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Test successfully created',
    data: result,
    success: true,
  });
});

const updateTest = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = req.body;
  const result = await TestServices.patchTest(id, data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Test successfully Updated',
    data: result,
    success: true,
  });
});

const removeTest = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await TestServices.deleteTest(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Test successfully Deleted',
    data: result,
    success: true,
  });
});

const getSingleTest = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(id);

  const result = await TestServices.fetchSingleTest(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Test successfully Featched',
    data: result,
    success: true,
  });
});

const getAllTest = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, testFiltarableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const flag = pick(req.query, ['flag']);

  const result = await TestServices.fetchAllTest(
    filters,
    options,
    flag as { flag: string }
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Test successfully Featched',
    data: result,
    success: true,
  });
});
export const TestController = {
  createNewTest,
  updateTest,
  removeTest,
  getSingleTest,
  getAllTest,
};
