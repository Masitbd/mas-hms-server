import { Schema, model } from 'mongoose';
import { IReportTypeGroup } from './reportTypeGroup.interface';

const schema = new Schema<IReportTypeGroup>(
  {
    group: {
      type: String,
      required: true,
    },
    resultType: {
      type: String,
      required: true,
    },
    reportGroup: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ReportGroup',
    },
    department: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Departments',
    },
  },
  { timestamps: true }
);

export const ReportTypeGroup = model('ReportTypeGroup', schema);
