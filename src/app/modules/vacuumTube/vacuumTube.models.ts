import { Schema, model } from 'mongoose';
import { IVacuumTube, VacuumTubeModel } from './vacuumTube.interfaces';

const VacuumTubeSchema = new Schema<IVacuumTube, VacuumTubeModel>({
  value: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
});

export const VacuumTube = model('VacuumTube', VacuumTubeSchema);
