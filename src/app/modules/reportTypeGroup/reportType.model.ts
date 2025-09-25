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
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const ReportTypeGroup = model('ReportTypeGroup', schema);
