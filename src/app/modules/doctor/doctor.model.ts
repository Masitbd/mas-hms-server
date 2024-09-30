import { Schema, model } from 'mongoose';
import { IDoctor } from './doctor.interface';

const doctorSchema = new Schema<IDoctor>({
  title: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
  },
  email: {
    type: String,
  },
  designation: {
    type: String,
  },
  phone: {
    type: String,
  },
  code: {
    type: String,
    unique: true,
  },
  image: {
    type: String,
  },
  address: {
    type: String,
  },
  assignedME: {
    type: Schema.Types.ObjectId,
    ref: 'EmployeeRegistration',
    required: true,
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
