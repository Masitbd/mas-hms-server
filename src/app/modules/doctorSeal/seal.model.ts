import { model, Schema } from 'mongoose';
import { IDoctorSeal } from './seal.interface';

const doctorSealSchema = new Schema<IDoctorSeal>({
  title: {
    type: String,
  },
  seal: {
    type: String,
  },
  default: {
    type: Boolean,
    default: false,
  },
});

export const DoctorSeal = model('DoctorSeal', doctorSealSchema);
