import { model, Schema } from 'mongoose';
import {
  IReport,
  IReportForDescriptive,
  IReportForParameter,
  ITestReportForMicrobiology,
} from './report.interface';

const reportSchema = new Schema<IReport>(
  {
    oid: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      set: (a: string) => (a === '' ? undefined : a),
    },
    seal: {
      type: String,
      set: (a: string) => (a === '' ? undefined : a),
    },
    specimen: [
      {
        type: String,
        set: (a: string[]) => (a.length > 0 ? undefined : a),
      },
    ],
    conductedBy: {
      type: String,
      required: true,
    },
    reportGroup: {
      label: String,
      value: String,
      testResultType: String,
    },
    analyzerMachine: {
      type: String,
      set: (a: string) => (a === '' ? undefined : a),
    },
  },
  {
    timestamps: true,
  }
);

export const Report = model<IReport>('Reports', reportSchema);

// for parameterBased
const parameterBasedSchema = new Schema<IReportForParameter>(
  {
    testId: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    testResult: [
      {
        testId: {
          type: Schema.Types.ObjectId,
          ref: 'Test',
          required: true,
        },
        test: {
          type: String,
          set: (a: string) => (a === '' ? undefined : a),
        },
        investigation: {
          type: String,
          set: (a: string) => (a === '' ? undefined : a),
          required: true,
        },
        result: {
          type: String,
          set: (a: string) => (a === '' ? undefined : a),
        },
        unit: {
          type: String,
          set: (a: string) => (a === '' ? undefined : a),
        },
        normalValue: {
          type: String,
          set: (a: string) => (a === '' ? undefined : a),
        },
        defaultValue: [
          {
            type: String,
            set: (a: string[]) => (a.length < 0 ? undefined : a),
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// for parameterBased
const descriptiveBasedSchema = new Schema<IReportForDescriptive>(
  {
    test: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    testResult: [
      {
        investigation: {
          type: String,
          set: (a: string) => (a === '' ? undefined : a),
          required: true,
        },
        label: {
          type: String,
          set: (a: string) => (a === '' ? undefined : a),
          required: true,
        },
        result: {
          type: String,
          set: (a: string) => (a === '' ? undefined : a),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const microbiologySchema = new Schema<ITestReportForMicrobiology>(
  {
    test: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    bacteria: {
      type: String,
    },
    colonyCount: {
      base: String,
      power: String,
    },
    condition: String,
    duration: String,
    growth: Boolean,
    temperature: String,
    specimen: String,
    sensivityOptions: [
      {
        id: String,
        value: String,
        breakPoint: String,
        interpretation: String,
        mic: String,
      },
    ],
  },
  { timestamps: true }
);

export const ParameterBasedReport = Report.discriminator(
  'ParameterBased',
  parameterBasedSchema
);

export const DescriptionBasedReport = Report.discriminator(
  'DescriptionBased',
  descriptiveBasedSchema
);

export const MicrobiologyReport = Report.discriminator(
  'MicrobiologyReport',
  microbiologySchema
);
