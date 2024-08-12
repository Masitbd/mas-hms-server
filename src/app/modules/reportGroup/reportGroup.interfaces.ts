import { Model, Schema } from 'mongoose';

export type IReportGroup = {
  value: string;
  description: string;
  label: string;
  department: Schema.Types.ObjectId;
};

export type ReportGroupModel = Model<IReportGroup, Record<string, unknown>>;
