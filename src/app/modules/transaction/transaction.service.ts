import mongoose from 'mongoose';
import { ITransaction } from './transaction.interface';
import { Transation } from './transaction.model';

const postTransaction = async (data: ITransaction) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // if (data.uuid) {
    //   const accountResult = await AccountService.patchAccount(data);
    // }
    const result = await Transation.create(data);

    await session.commitTransaction();
    await session.endSession();
    return {
      result,
    };
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
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
