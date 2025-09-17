export type TestResult = { testId: string; [k: string]: any };

export type Report = {
  testIds?: string[];
  testResult?: TestResult[];
  [k: string]: any; // keeps all other fields (oid, reportGroup, etc.)
};

/**
 * Split a report into one report per testId in `report.testIds`.
 * Each output keeps all other fields the same,
 * sets `testIds` to [thatId], and filters `testResult` to only thatId.
 */
export function splitReportByTestId(report: Report) {
  const { testIds = [], testResult = [], ...rest } = report;

  // Group test results by their testId once (O(n))
  const byId = new Map<string, TestResult[]>();
  for (const tr of testResult) {
    const key = tr.testId;
    if (!byId.has(key)) byId.set(key, []);
    byId.get(key)!.push(tr);
  }

  // Create one report per requested testId, preserving order in testIds
  return testIds.map(id => ({
    ...rest,
    testId: id,
    testResult: byId.get(id) ?? [], // empty array if no matches
  }));
}
