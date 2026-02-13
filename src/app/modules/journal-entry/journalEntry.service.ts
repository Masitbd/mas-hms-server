/* eslint-disable no-unused-expressions */
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

// !use for updating the filed journal entries
// const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// function createThrottle(gapMs: number) {
//   let nextAllowedAt = 0;

//   return async <T>(fn: () => Promise<T>): Promise<T> => {
//     const now = Date.now();
//     if (now < nextAllowedAt) await sleep(nextAllowedAt - now);

//     const result = await fn();

//     nextAllowedAt = Date.now() + gapMs;
//     return result;
//   };
// }

// type ServiceResponse<T = any> = {
//   statusCode: number;
//   success: boolean;
//   message?: string;
//   data?: T;
// };

// function is2xxSuccess(res: any): res is ServiceResponse {
//   const code = res?.statusCode;
//   return (
//     res?.success === true &&
//     typeof code === 'number' &&
//     code >= 200 &&
//     code < 300
//   );
// }

// async function runOnlyIf2xx<T>(
//   throttled: <X>(fn: () => Promise<X>) => Promise<X>,
//   fn: () => Promise<ServiceResponse<T>>,
//   label: string
// ): Promise<ServiceResponse<T>> {
//   const started = Date.now();

//   try {
//     const res = await throttled(fn);
//     const took = Date.now() - started;

//     if (!is2xxSuccess(res)) {
//       throw new Error(
//         `Restore stopped: "${label}" returned non-2xx or success=false. ` +
//           `statusCode=${res?.statusCode}, success=${res?.success}, message=${res?.message}, took=${took}ms`
//       );
//     }

//     // optional: log each request timing (comment out if too noisy)
//     console.log(`[OK] ${label} -> ${res.statusCode} (${took}ms)`);

//     return res;
//   } catch (err: any) {
//     const took = Date.now() - started;

//     const statusCode = err?.response?.data?.statusCode ?? err?.response?.status;
//     const message =
//       err?.response?.data?.message ?? err?.message ?? 'Unknown error';

//     throw new Error(
//       `Restore stopped: "${label}" request failed. status=${
//         statusCode ?? '?'
//       }, ` + `message=${message}, took=${took}ms`
//     );
//   }
// }

// const formatMs = (ms: number) => {
//   const s = Math.floor(ms / 1000);
//   const m = Math.floor(s / 60);
//   const rS = s % 60;
//   return m > 0 ? `${m}m ${rS}s` : `${rS}s`;
// };

// export const restoreFailedEntry = async () => {
//   const startedAll = Date.now();

//   const orders = await Order.aggregate([
//     {
//       $match: {
//         createdAt: {
//           $gt: new Date('2026-01-11T04:17:32.115+00:00'),
//         },
//       },
//     },
//     { $sort: { createdAt: 1 } },
//     {
//       $lookup: {
//         from: 'transations',
//         localField: '_id',
//         foreignField: 'ref',
//         as: 'transactionData',
//       },
//     },
//   ]).allowDiskUse(true);

//   const throttled = createThrottle(400);

//   const total = orders.length;
//   console.log(`\n[START] Restore journal entries for ${total} orders\n`);

//   const results: Array<{
//     orderId: any;
//     ok: boolean;
//     statusCode: number;
//     dueCollections: number;
//   }> = [];

//   for (let i = 0; i < total; i++) {
//     const fc: any = orders[i];
//     const idx = i + 1;
//     const pct = total ? Math.round((idx / total) * 100) : 100;

//     const orderId = fc?._id;
//     const oid = fc?.oid ? ` (${fc.oid})` : '';
//     console.log(
//       `[${idx}/${total}] (${pct}%) Processing order: ${orderId}${oid}`
//     );

//     const netPayable = fc?.netPayable ?? 0;

//     const paymentTx = (fc?.transactionData ?? []).find(
//       (td: any) => td?.description === 'Payment for order'
//     );

//     const initialPaid = paymentTx?.amount ?? 0;
//     const initialDue = netPayable - initialPaid;

//     const duesCollection = (fc?.transactionData ?? []).filter(
//       (td: any) => td?.description === 'Collected due amount'
//     );

//     // 1) Order journal entry
//     const orderRes = await runOnlyIf2xx(
//       throttled,
//       () =>
//         journalEntryService.postOrderJournalEntry({
//           orderAmount: netPayable,
//           paid: initialPaid,
//           due: initialDue,
//           token: fc?.postedBy,
//           createdAt: fc?.createdAt,
//         }),
//       `postOrderJournalEntry order=${orderId}`
//     );

//     // 2) Due collection entries
//     for (const dc of duesCollection) {
//       await runOnlyIf2xx(
//         throttled,
//         () =>
//           journalEntryService.postJournalEntryForDueCollection({
//             amount: dc?.amount ?? 0,
//             token: dc?.postedBy,
//             createdAt: dc?.createdAt,
//           }),
//         `postJournalEntryForDueCollection order=${orderId} tx=${dc?._id}`
//       );
//     }

//     results.push({
//       orderId,
//       ok: true,
//       statusCode: orderRes.statusCode,
//       dueCollections: duesCollection.length,
//     });

//     const elapsed = Date.now() - startedAll;
//     console.log(
//       `[DONE] ${idx}/${total} complete. dueEntries=${
//         duesCollection.length
//       }. elapsed=${formatMs(elapsed)}\n`
//     );
//   }

//   console.log(
//     `[FINISH] Restored ${results.length}/${total} orders in ${formatMs(
//       Date.now() - startedAll
//     )}\n`
//   );

//   return results;
// };

export const journalEntryService = {
  postOrderJournalEntry,
  postJournalEntryForDueCollection,
  postJournalEntryForDoctorCommission,
  postJournalEntryForPatch,
  // restoreFailedEntry,
};
