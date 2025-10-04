type Refund = {
  oid: string;
  grossAmount: number;
  remainingRefund: number;
  // ...other fields ignored
};

type OrderRecord = {
  oid: string;
  totalPrice: number;
  paid: number;
  // ...anything else is preserved
};

type Group = {
  groupDate: string;
  records: OrderRecord[];
};

/**
 * Build a per-oid refund index with totals.
 */
function indexRefunds(refunds: Refund[]) {
  const byOid: Record<string, { grossTotal: number; remainingTotal: number }> =
    {};
  for (const r of refunds) {
    if (!byOid[r.oid]) byOid[r.oid] = { grossTotal: 0, remainingTotal: 0 };
    byOid[r.oid].grossTotal += Number(r.grossAmount) || 0;
    byOid[r.oid].remainingTotal += Number(r.remainingRefund) || 0;
  }
  return byOid;
}

/**
 * Apply refunds to a flat list of orders (if you don't have groups).
 * - Deducts grossTotal from totalPrice
 * - Deducts remainingTotal from paid
 */
export function applyRefundsToOrders<T extends OrderRecord>(
  orders: T[],
  refunds: Refund[],
  clampToZero = true
): T[] {
  const idx = indexRefunds(refunds);

  return orders.map(o => {
    const sums = idx[o.oid];
    if (!sums) return o;

    const newTotalPrice = (Number(o.totalPrice) || 0) - sums.grossTotal;
    const newPaid = (Number(o.paid) || 0) - sums.remainingTotal;

    return {
      ...o,
      totalPrice: clampToZero ? Math.max(0, newTotalPrice) : newTotalPrice,
      paid: clampToZero ? Math.max(0, newPaid) : newPaid,
    };
  });
}

/**
 * Apply refunds to grouped orders (your provided structure).
 */
export function applyRefundsToGroups(
  groups: Group[],
  refunds: Refund[],
  clampToZero = true
): Group[] {
  const idx = indexRefunds(refunds);

  return groups.map(g => ({
    ...g,
    records: g.records.map(o => {
      const sums = idx[o.oid];
      if (!sums) return o;

      const newTotalPrice = (Number(o.totalPrice) || 0) - sums.grossTotal;
      const newPaid = (Number(o.paid) || 0) - sums.remainingTotal;

      return {
        ...o,
        totalPrice: clampToZero ? Math.max(0, newTotalPrice) : newTotalPrice,
        paid: clampToZero ? Math.max(0, newPaid) : newPaid,
      };
    }),
  }));
}
