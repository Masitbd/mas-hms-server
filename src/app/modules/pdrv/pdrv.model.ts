import { Schema, model } from 'mongoose';
import { IPdrv } from './pdrv.interface';

const pdrvSchema = new Schema<IPdrv>({
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
  },
});

export const Pdrv = model('pdrv', pdrvSchema);
