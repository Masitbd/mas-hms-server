import { IAccount } from './account.interface';
import { Account } from './account.model';

const postNewAccount = async (data: IAccount) => {
  const result = await Account.create(data);
  return result;
};

const patchAccount = async (data: any) => {
  const transBalanceType = data.balanceType;
  const account = await Account.findOne({ user: data.user });
  const userBalanceType = account?.balanceType;
  if (transBalanceType) {
    if (userBalanceType === transBalanceType) {
      const amount = Number(account?.balance) + Number(data.amount);
      account.balance = amount;
      account.save();
    } else {
      const amount = Number(account?.balance) - Number(data.amount);
      account.balance = amount;
      account.save();
    }
  }
  return account;
};

const fetchSingle = async (params: string) => {
  const result = await Account.findOne({ user: params });
  return result;
};
export const AccountService = { postNewAccount, patchAccount, fetchSingle };
