import { Schema, model } from 'mongoose';
import { BacteriaModel, IBacteria } from './bacteria.interface';

const BacteriaSchema = new Schema<IBacteria>({
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

export const Bacteria = model<IBacteria, BacteriaModel>(
  'Bacteria',
  BacteriaSchema
);
