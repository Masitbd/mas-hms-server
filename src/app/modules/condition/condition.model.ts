import { Schema, model } from 'mongoose';
import { ICondition } from './condition.interface';

const ConditionSchema = new Schema<ICondition>(
  {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Condition = model<ICondition>('Conditions', ConditionSchema);
