import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IAccount } from './account.interface';
import { AccountService } from './account.service';

const createNewAccount = async (data: IAccount) => {
  const result = await AccountService.postAccount(data);
  return result;
};

const editAccount = async (data: any) => {
  const result = await AccountService.patchAccount(data);
  return result;
};
const getSingelAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await AccountService.fetchSingle(req.params.id);
  sendResponse(res, {
    data: result,
    statusCode: httpStatus.OK,
    success: true,
    message: ' successfully',
  });
});
export const AccountController = {
  createNewAccount,
  editAccount,
  getSingelAccount,
};
