import { Schema, model } from 'mongoose';
import { ITest, TestModel } from './test.interfacs';

const testSchema = new Schema<ITest, TestModel>(
  {
    value: {
      type: String,
      required: true,
      unique: true,
    },
    label: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    testResultType: {
      type: String,
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Departments',
    },
    testCode: {
      type: String,
      required: true,
      unique: true,
    },
    specimen: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Specimens',
      },
    ],
    type: {
      type: String,
      required: true,
    },
    hasTestTube: {
      type: Boolean,
      required: true,
    },
    testTube: [
      {
        type: Schema.Types.ObjectId,
        ref: 'VacuumTube',
      },
    ],
    reportGroup: {
      type: Schema.Types.ObjectId,
      ref: 'reportGroup',
    },
    hospitalGroup: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'HospitalGroup',
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    isGroupTest: {
      type: Boolean,
      required: true,
    },
    groupTests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Test',
      },
    ],
    vatRate: {
      type: Number,
      required: true,
    },
    processTime: {
      type: Number,
      required: true,
    },
    resultFields: [
      {
        investigation: {
          type: String,
        },
        label: {
          type: String,
        },
        description: {
          type: String,
        },
        title: {
          type: String,
        },
        test: {
          type: String,
        },
        unit: {
          type: String,
        },
        normalValue: {
          type: String,
        },
        hasPdrv: {
          type: Boolean,
        },
        defaultValue: [
          {
            type: String,
          },
        ],
        resultDescripton: {
          type: String,
        },
        sensitivityOptions: [
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
      },
    ],
  },
  { timestamps: true }
);

export const Test = model<ITest, TestModel>('Test', testSchema);
