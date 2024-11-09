import { model, Schema } from 'mongoose';
import { IMiscellaneous } from './miscellaneous.interface';

const MiscellaneousSchema = new Schema<IMiscellaneous>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
    },
   
  },
  { timestamps: true }
);

export const Miscellaneous = model<IMiscellaneous>(
  'Miscellaneous',
  MiscellaneousSchema
);
