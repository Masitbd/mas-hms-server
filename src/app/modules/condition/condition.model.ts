import { Schema, model } from 'mongoose';
import { ICondition } from './condition.interface';

const conditionSchema = new Schema<ICondition>(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
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

export const Condition = model<ICondition>('Conditions', conditionSchema);
