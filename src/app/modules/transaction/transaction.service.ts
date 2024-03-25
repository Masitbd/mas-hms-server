import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { AccountService } from '../account/account.service';
import { ITransaction } from './transaction.interface';
import { Transation } from './transaction.model';

const postTransaction = async (data: ITransaction) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const accountResult = await AccountService.patchAccount(data);
    const result = await Transation.create(data);
    await session.commitTransaction();
    session.endSession();
    return {
      result,
      accountResult,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Please try again letter'
    );
  }
};

const fetchSingleTransaction = async (data: string) => {
  const result = await Transation.findOne({ _id: data });
  return result;
};

const fetchSIngleByUuid = async (data: string) => {
  const result = await Transation.find({ uuid: data });
  return result;
};
export const TransactionService = {
  postTransaction,
  fetchSingleTransaction,
  fetchSIngleByUuid,
};
