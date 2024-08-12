import { Types } from 'mongoose';

export type ITestForParameter = {
  test: string;
  investigation: string;
  normalValue: string;
  unit: string;
  defaultValue: string[];
};

export type ITestForDescriptive = {
  label: string;
  description: string;
};

export type ITestForMicrobiology = {
  sensitivityOpeions: Types.ObjectId[];
  conditions: Types.ObjectId[];
  bacterias: Types.ObjectId[];
};

export type IReportType = {
  reportTypeGroup: Types.ObjectId;
};
export type IReportTypeForParameter = IReportType & ITestForParameter;
export type IReportTypeForDescriptive = IReportType & ITestForDescriptive;
export type IReportTypeForMicrobiology = IReportType & ITestForMicrobiology;
export type fetchAllreportTypeProps = {
  reportTypeGroup: string;
  resultType: string;
  reportGroup: Types.ObjectId;
};

export const reportTypeFlterableField: (keyof fetchAllreportTypeProps)[] = [
  'reportTypeGroup',
  'resultType',
  'reportGroup',
];

export type patchReportTypeProps = {
  data: Partial<IReportType>;
  id: string;
};
