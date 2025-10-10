// ---------- Types ----------
export type NewDataItem = {
  _id: string;
  paid: number;
  oid: string;
  postedBy: string;
  createdAt: string | Date; // ISO string or Date
  userDetails: {
    name: string;
    uuid: string;
  };
};

export type Refund = {
  _id: string; // matches NewDataItem.oid
  refundApplied: number; // untouched
  remainingRefund: number; // to be deducted
};

export type OutputRecord = {
  name: string;
  totalPaid: number;
  uuid: string;
};

export type OutputGroup = {
  records: OutputRecord[];
  groupDate: string; // YYYY-MM-DD
  grandTotal: number; // per your sample, kept 0 by default
};

export type TransformOptions = {
  /** If true, grandTotal will be the sum of totalPaid in each groupDate. Default: false (kept 0 to match your sample). */
  grandTotalFromSum?: boolean;
};

// ---------- Utils ----------
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const isPos = (n: unknown): n is number =>
  typeof n === 'number' && isFinite(n) && n > 0;

const toISO = (d: string | Date): string =>
  typeof d === 'string' ? d : d.toISOString();

const groupDateOf = (createdAt: string | Date): string =>
  toISO(createdAt).slice(0, 10); // uses UTC date part like your sample

// ---------- Core logic ----------
/**
 * Deduct refund.remainingRefund from newData[].paid where refund._id === item.oid.
 * Remove items that drop to 0. Then format into outPutDataFormat.
 */
export function buildRefundedGroups(
  newData: NewDataItem[] | undefined,
  refunds: Refund[] | undefined,
  options: TransformOptions = {}
): OutputGroup[] {
  const grandTotalFromSum = !!options.grandTotalFromSum;

  // Defensive copy
  const items = clone(newData ?? []);

  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  // Index items by oid to allow multiple entries per order id
  const byOid = new Map<string, NewDataItem[]>();
  for (const it of items) {
    if (!it?.oid) continue;
    if (!byOid.has(it.oid)) byOid.set(it.oid, []);
    byOid.get(it.oid)!.push(it);
  }

  // Apply each refund to all matching entries for that OID (left->right in the original order)
  for (const r of refunds ?? []) {
    const oid = r?._id;
    let remaining = Number(r?.remainingRefund) || 0;
    if (!oid || remaining <= 0) continue;

    const bucket = byOid.get(oid);
    if (!bucket || bucket.length === 0) continue;

    for (const entry of bucket) {
      if (remaining <= 0) break;
      const paid = Number(entry.paid) || 0;
      if (paid <= 0) continue;

      const deduct = Math.min(paid, remaining);
      entry.paid = paid - deduct;
      remaining -= deduct;
    }
  }

  // Remove any entries that became 0 (or negative just in case)
  const filtered = items.filter(it => isPos(Number(it.paid)));

  if (filtered.length === 0) {
    return [];
  }

  // Group by groupDate, then by user (uuid), summing paid
  const groupsMap = new Map<string, Map<string, OutputRecord>>();
  for (const it of filtered) {
    const gDate = groupDateOf(it.createdAt);
    if (!groupsMap.has(gDate)) groupsMap.set(gDate, new Map());

    const perUser = groupsMap.get(gDate)!;
    const uuid = it.userDetails?.uuid ?? it.postedBy ?? 'unknown';
    const name = it.userDetails?.name ?? 'Unknown';

    if (!perUser.has(uuid)) {
      perUser.set(uuid, { name, uuid, totalPaid: 0 });
    }
    const rec = perUser.get(uuid)!;
    rec.totalPaid += Number(it.paid) || 0;
  }

  // Build final array (sorted by groupDate ascending for determinism)
  const result: OutputGroup[] = Array.from(groupsMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([groupDate, userMap]) => {
      const records = Array.from(userMap.values());
      const sum = records.reduce((acc, r) => acc + r.totalPaid, 0);
      return {
        records,
        groupDate,
        grandTotal: grandTotalFromSum ? sum : 0, // keep 0 by default (matches your sample)
      };
    });

  return result;
}

/* ---------------- Example usage ----------------
const newData: NewDataItem[] = [ ... ]; // your array
const refunds: Refund[] = [ ... ];

const out = buildRefundedGroups(newData, refunds, { grandTotalFromSum: false });
// -> matches your outPutDataFormat shape (grandTotal: 0)
*/
