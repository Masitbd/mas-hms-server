import { Schema, model } from 'mongoose';
import { IDoctor } from './doctor.interface';

const doctorSchema = new Schema<IDoctor>({
  name: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
  },
  account_number: {
    type: String,
    required: true,
  },
  account_id: {
    type: Schema.Types.ObjectId, // account ---> id
    ref: 'Account',
    required: true,
  },
});

export const Doctor = model('doctor', doctorSchema);
