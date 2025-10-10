// --- Types ---
export type Refund = {
  _id: string;
  refundApplied: number; // untouched
  remainingRefund: number; // to deduct
};

export type DayRecord = {
  oid?: string;
  uuid?: string;
  name?: string;
  amount: number;
  date: string;
};

export type DayUser = {
  postedBy: string;
  name: string;
  totalPaid: number;
  records: DayRecord[];
};

export type DayGroup = {
  groupDate: string; // YYYY-MM-DD
  users: DayUser[];
  dayTotal: number;
};

export type DaySummery = {
  grandTotal: number;
  records: DayGroup[];
};

export type DayRefundPerIdSummary = {
  applied: number;
  leftover: number;
};

export type ApplyDayRefundsSummary = {
  perRefund: Record<string, DayRefundPerIdSummary>;
  totalApplied: number;
  totalLeftover: number;
};

export type ApplyDayRefundsResult = {
  daySummery: DaySummery | DaySummery[];
  summary: ApplyDayRefundsSummary;
};

// --- Utils ---
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const isPos = (n: unknown): n is number =>
  typeof n === 'number' && isFinite(n) && n > 0;

const pruneZeroRecords = (recs?: DayRecord[]): DayRecord[] =>
  (recs ?? []).filter(r => isPos(Number(r.amount)));

const normalizeOne = (ds?: DaySummery): DaySummery => {
  const out = clone(ds ?? { grandTotal: 0, records: [] as DayGroup[] });

  for (const day of out.records ?? []) {
    for (const u of day.users ?? []) {
      u.records = pruneZeroRecords(u.records);
      u.totalPaid = sum(u.records.map(r => Number(r.amount) || 0));
    }
    day.users = (day.users ?? []).filter(
      u => isPos(u.totalPaid) && u.records.length > 0
    );
    day.dayTotal = sum(day.users.map(u => u.totalPaid));
  }

  out.records = (out.records ?? []).filter(
    d => isPos(d.dayTotal) && d.users.length > 0
  );
  out.grandTotal = sum(out.records.map(d => d.dayTotal));
  return out;
};

const applyRefundIdToOne = (
  ds: DaySummery,
  refundId: string,
  amountToApply: number
): { applied: number; updated: DaySummery } => {
  if (!isPos(amountToApply)) return { applied: 0, updated: clone(ds) };

  const updated = clone(ds);
  let remaining = amountToApply;
  let applied = 0;

  outer: for (const day of updated.records ?? []) {
    for (const u of day.users ?? []) {
      for (const rec of u.records ?? []) {
        if (remaining <= 0) break outer;
        if (!rec?.oid || rec.oid !== refundId) continue;

        const amt = Number(rec.amount) || 0;
        if (amt <= 0) continue;

        const deduct = Math.min(amt, remaining);
        rec.amount = amt - deduct;
        applied += deduct;
        remaining -= deduct;
      }
    }
  }

  return { applied, updated };
};

// --- Main (accepts object OR array) ---
export function applyRefundsToDaySummery(
  input: DaySummery | DaySummery[] | undefined,
  refunds: Refund[] | undefined
): ApplyDayRefundsResult {
  const isArray = Array.isArray(input);
  let work: DaySummery[] = isArray
    ? clone(input as DaySummery[])
    : [clone(input as DaySummery)];

  // Normalize each first (also prunes any pre-existing zeros)
  work = work.map(ds => normalizeOne(ds));

  const summary: ApplyDayRefundsSummary = {
    perRefund: {},
    totalApplied: 0,
    totalLeftover: 0,
  };

  if (!refunds?.length) {
    const finalized = work.map(ds => normalizeOne(ds));
    return {
      daySummery: isArray ? finalized : finalized[0],
      summary,
    };
  }

  for (const r of refunds) {
    const refundId = r?._id;
    let remaining = Number(r?.remainingRefund) || 0;
    let appliedTotal = 0;

    if (!refundId || remaining <= 0) {
      summary.perRefund[refundId ?? ''] = {
        applied: 0,
        leftover: Math.max(0, remaining),
      };
      summary.totalLeftover += Math.max(0, remaining);
      continue;
    }

    // Apply across the array left→right, carrying leftovers forward
    for (let i = 0; i < work.length && remaining > 0; i++) {
      const { applied, updated } = applyRefundIdToOne(
        work[i],
        refundId,
        remaining
      );
      work[i] = updated;
      remaining -= applied;
      appliedTotal += applied;
    }

    summary.perRefund[refundId] = {
      applied: appliedTotal,
      leftover: Math.max(0, remaining),
    };
    summary.totalApplied += appliedTotal;
    summary.totalLeftover += Math.max(0, remaining);
  }

  // Final cleanup & totals
  const finalized = work.map(ds => normalizeOne(ds));
  return {
    daySummery: isArray ? finalized : finalized[0],
    summary,
  };
}
