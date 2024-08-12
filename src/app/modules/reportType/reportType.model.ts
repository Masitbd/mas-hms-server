import { Schema, model } from 'mongoose';
import {
  IReportType,
  IReportTypeForDescriptive,
  IReportTypeForMicrobiology,
  IReportTypeForParameter,
} from './reporttype.interface';

const reportTypeSchema = new Schema<IReportType>(
  {
    reportTypeGroup: {
      type: Schema.Types.ObjectId,
      ref: 'reportTypeGroups',
      required: true,
    },
  },
  { timestamps: true }
);

const parameterBasedSchema = new Schema<IReportTypeForParameter>({
  test: {
    type: String,
  },
  investigation: {
    type: String,
  },
  normalValue: {
    type: String,
  },
  unit: {
    type: String,
  },
  defaultValue: {
    type: [
      {
        type: String,
      },
    ],
  },
});

const DescriptiveBasedSchema = new Schema<IReportTypeForDescriptive>({
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const microbiologyBasedSchema = new Schema<IReportTypeForMicrobiology>({
  sensitivityOpeions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'sensitivities',
    },
  ],
  conditions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'conditions',
    },
  ],
  bacterias: [
    {
      type: Schema.Types.ObjectId,
      ref: 'bacterias',
    },
  ],
});
export const ReportType = model('ReportType', reportTypeSchema);

export const ParameterBasedReportType = ReportType.discriminator(
  'parameterBased',
  parameterBasedSchema
);
export const DescriptiveBasedReportType = ReportType.discriminator(
  'descriptiveBased',
  DescriptiveBasedSchema
);
export const MicrobiologyBasedReportType = ReportType.discriminator(
  'microheterologicalBased',
  microbiologyBasedSchema
);
