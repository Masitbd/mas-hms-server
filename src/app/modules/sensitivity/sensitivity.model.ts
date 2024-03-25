import { Schema, model } from 'mongoose';
import { ISensitivity } from './sensitivity.interfaces';

const SensitivitySchema = new Schema<ISensitivity>(
  {
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    resultOption: [
      {
        value: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Sensitivity = model<ISensitivity>(
  'Sensitivities',
  SensitivitySchema
);
