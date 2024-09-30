import { model, Schema } from 'mongoose';
import { IEmployeeRegistration } from './employeeRegistration.interface';

const employeeRegistrationSchema = new Schema<IEmployeeRegistration>({
  name: {
    type: String,
    required: true,
    index: true,
  },

  fatherName: {
    type: String,
    required: true,
  },
  motherName: {
    type: String,
  },
  gender: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
  },
  age: {
    type: Number,
  },
  religion: {
    type: String,
  },
  nationality: {
    type: String,
  },
  maritalStatus: {
    type: String,
  },
  presentAddress: {
    type: String,
  },
  parmanentAddress: {
    type: String,
    required: true,
  },
  district: {
    type: String,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    //required: true,
  },
  defaultImage: {
    type: String,
    //required: true,
  },
});

export const EmployeeRegistration = model(
  'employeeRegistration',
  employeeRegistrationSchema
);
