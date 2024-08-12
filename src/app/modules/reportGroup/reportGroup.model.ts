import { Schema, Types, model } from 'mongoose';
import { IReportGroup, ReportGroupModel } from './reportGroup.interfaces';

const ReportGroupSchema = new Schema<IReportGroup, ReportGroupModel>(
  {
    value: {
      type: String,

      unique: true,
    },
    label: {
      type: String,
    },
    description: {
      type: String,
    },
    department: {
      type: Types.ObjectId,
      ref: 'Departments',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const ReportGroup = model<IReportGroup, ReportGroupModel>(
  'ReportGroup',
  ReportGroupSchema
);
