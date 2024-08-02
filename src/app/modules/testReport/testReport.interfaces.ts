import { Model, Types } from 'mongoose';

export type ITestReport = {
  orderId: Types.ObjectId;
  testId: Types.ObjectId;
  defaultValue: Types.ObjectId[];
  microbiology?: IMicrobiologyBacteria[];
  descriptiveDataDocs?: IDescriptiveDataDocs;
  parameterBased?: IParameterBased[];
};

export type IMicrobiologyBacteria = {
  _id: Types.ObjectId | string;
  duration: string;
  temperatures: string;
  conditions: Types.ObjectId[];
  growth: boolean;
  colonyCount?: {
    thenType: string;
    powerType: string;
  };
  bacterias?: Types.ObjectId[];
  sensitivityOptions?: [];
};

export type IDescriptive = {
  _id: Types.ObjectId | string;
  investigation: string;
  resultDescripton?: string;
};
export type IDescriptiveDataDocs = {
  docsContent: string;
  descriptive: IDescriptive[];
};
export type IParameterBased = {
  _id: Types.ObjectId | string;
  investigation: string;
  test: string;
  unit: string;
  normalValue: string;
  result: string;
  comment: string;
};

export type TestReportModel = Model<ITestReport, Record<string, unknown>>;
