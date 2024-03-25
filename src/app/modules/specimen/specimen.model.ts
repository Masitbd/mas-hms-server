import { Schema, model } from 'mongoose';
import { ISpecimen, SpecimenModel } from './specimen.interfaces';

const SpecimenSchema = new Schema<ISpecimen, SpecimenModel>(
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Specimen = model<ISpecimen, SpecimenModel>(
  'Specimens',
  SpecimenSchema
);
