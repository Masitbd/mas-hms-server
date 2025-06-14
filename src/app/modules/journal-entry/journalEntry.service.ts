import { Account_Service_Api_Path } from '../../../enums/accountServiceApiPath';
import LedgerEnum from '../../../enums/ENUMAccountHeads';
import { ENUMBudgetType } from '../../../enums/ENUMBudgetType';
import { ENUMJournalType } from '../../../enums/ENUMJournalTYpe';
import { AccountService } from '../../../shared/axios';

export type IJournalEntry = {
  account: string;
  comment?: string;
  debit: number;
  credit: number;
  memo: string;
  journalType: string;
  budgetType: string;
};

export const postOrderJournalEntry = async ({
  orderAmount,
  paid,
  due,
  token,
}: {
  orderAmount: number;
  paid: number;
  due: number;
  token: string;
}) => {
  console.log(orderAmount, paid, due);
  const journalEntry: IJournalEntry[] = [
    {
      account: LedgerEnum.Service_Income_Diagonestic,
      credit: orderAmount,
      debit: 0,
      journalType: ENUMJournalType.GENERAL,
      budgetType: ENUMBudgetType.REGULAR,
      memo: 'Order Placed',
    },
  ];

  if (paid) {
    journalEntry.unshift({
      account: LedgerEnum.CashInHand,
      credit: 0,
      debit: paid,
      journalType: ENUMJournalType.GENERAL,
      budgetType: ENUMBudgetType.REGULAR,
      memo: 'Order Placed',
    });
  }
  if (due) {
    journalEntry.unshift({
      account: LedgerEnum.AccountsReceivable,
      credit: 0,
      debit: due,
      journalType: ENUMJournalType.GENERAL,
      budgetType: ENUMBudgetType.REGULAR,
      memo: 'Order Placed',
    });
  }

  console.log(journalEntry);

  const result = await AccountService.post(
    Account_Service_Api_Path.JOURNAL,
    journalEntry,
    {
      headers: {
        Authorization: token,
      },
    }
  );
  return result;
};

const postJournalEntryForDueCollection = async ({
  amount,
  token,
}: {
  token: string;
  amount: number;
}) => {
  const journalEntry: IJournalEntry[] = [
    {
      account: LedgerEnum.CashInHand,
      credit: 0,
      debit: amount,
      journalType: ENUMJournalType.GENERAL,
      budgetType: ENUMBudgetType.REGULAR,
      memo: 'Due collected for order',
    },
    {
      account: LedgerEnum.AccountsReceivable,
      credit: amount,
      debit: 0,
      journalType: ENUMJournalType.GENERAL,
      budgetType: ENUMBudgetType.REGULAR,
      memo: 'Due collected for order',
    },
  ];

  const result = await AccountService.post(
    Account_Service_Api_Path.JOURNAL,
    journalEntry,
    {
      headers: {
        Authorization: token,
      },
    }
  );
  return result;
};

const postJournalEntryForDoctorCommission = async ({
  amount,
  token,
}: {
  token: string;
  amount: number;
}) => {
  const journalEntry: IJournalEntry[] = [
    {
      account: LedgerEnum.CommissionExpense,
      credit: 0,
      debit: amount,
      journalType: ENUMJournalType.GENERAL,
      budgetType: ENUMBudgetType.REGULAR,
      memo: 'To record Doctors Commission payable for test ',
    },
    {
      account: LedgerEnum.CommissionPayable,
      credit: amount,
      debit: 0,
      journalType: ENUMJournalType.GENERAL,
      budgetType: ENUMBudgetType.REGULAR,
      memo: 'To record Doctors Commission payable for test',
    },
  ];

  const result = await AccountService.post(
    Account_Service_Api_Path.JOURNAL,
    journalEntry,
    {
      headers: {
        Authorization: token,
      },
    }
  );
  return result;
};

const postJournalEntryForPatch = async ({
  newDueAmount,
  newPaidAmount,
  oldDueAmount,
  oldNetPayable,
  oldPaidAmount,
  newNetPayable,
  token,
}: {
  newNetPayable: number;
  oldNetPayable: number;
  oldDueAmount: number;
  newDueAmount: number;

  oldPaidAmount: number;
  newPaidAmount: number;
  token: string;
}) => {
  console.log(
    newDueAmount,
    newPaidAmount,
    oldDueAmount,
    oldNetPayable,
    oldPaidAmount,
    newNetPayable
  );
  let journalEntries: any[] = [];

  // Journal data
  if (oldNetPayable !== newNetPayable) {
    if (oldNetPayable > newNetPayable) {
      const amount = oldNetPayable - newNetPayable;
      journalEntries = [
        ...journalEntries,
        {
          account: LedgerEnum.AccountsReceivable,
          credit: 0,
          debit: amount,
          journalType: ENUMJournalType.GENERAL,
          budgetType: ENUMBudgetType.REGULAR,
          memo: 'To Update the ordered amount',
        },
        {
          account: LedgerEnum.Service_Income_Diagonestic,
          credit: amount,
          debit: 0,
          journalType: ENUMJournalType.GENERAL,
          budgetType: ENUMBudgetType.REGULAR,
          memo: 'To Update the ordered amount',
        },
      ];
    } else {
      const amount = newNetPayable - oldNetPayable;
      journalEntries = [
        ...journalEntries,
        {
          account: LedgerEnum.Service_Income_Diagonestic,
          credit: 0,
          debit: amount,
          journalType: ENUMJournalType.GENERAL,
          budgetType: ENUMBudgetType.REGULAR,
          memo: 'To Update the ordered amount',
        },
        {
          account: LedgerEnum.AccountsReceivable,
          credit: amount,
          debit: 0,
          journalType: ENUMJournalType.GENERAL,
          budgetType: ENUMBudgetType.REGULAR,
          memo: 'To Update the ordered amount',
        },
      ];
    }
  }

  if (oldPaidAmount !== newPaidAmount) {
    if (oldPaidAmount > newPaidAmount) {
      const amount = oldPaidAmount - newPaidAmount;
      journalEntries = [
        ...journalEntries,
        {
          account: LedgerEnum.AccountsReceivable,
          credit: 0,
          debit: amount,
          journalType: ENUMJournalType.GENERAL,
          budgetType: ENUMBudgetType.REGULAR,
          memo: 'To Update the ordered amount',
        },
        {
          account: LedgerEnum.CashInHand,
          credit: amount,
          debit: 0,
          journalType: ENUMJournalType.GENERAL,
          budgetType: ENUMBudgetType.REGULAR,
          memo: 'To Update the ordered amount',
        },
      ];
    } else {
      const amount = newPaidAmount - oldPaidAmount;
      journalEntries = [
        ...journalEntries,
        {
          account: LedgerEnum.CashInHand,
          credit: 0,
          debit: amount,
          journalType: ENUMJournalType.GENERAL,
          budgetType: ENUMBudgetType.REGULAR,
          memo: 'To Update the ordered amount',
        },
        {
          account: LedgerEnum.AccountsReceivable,
          credit: amount,
          debit: 0,
          journalType: ENUMJournalType.GENERAL,
          budgetType: ENUMBudgetType.REGULAR,
          memo: 'To Update the ordered amount',
        },
      ];
    }
  }

  if (journalEntries.length) {
    await AccountService.post(
      Account_Service_Api_Path.JOURNAL,
      journalEntries,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
};
export const journalEntryService = {
  postOrderJournalEntry,
  postJournalEntryForDueCollection,
  postJournalEntryForDoctorCommission,
  postJournalEntryForPatch,
};
