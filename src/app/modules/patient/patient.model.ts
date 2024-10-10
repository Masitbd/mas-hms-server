import { Schema, Types, model } from 'mongoose';
import { patientIdGenerator } from '../../../utils/PatientIdGenerator';
import { IPatient } from './patient.interface';

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String },
    admissionDate: { type: String },
    district: { type: String },
    bloodGroup: { type: String },
    courseDuration: { type: String },
    dateOfBirth: { type: String },
    maritalStatus: { type: String },
    nationalID: { type: String },
    passportNo: { type: String },
    nationality: { type: String },
    religion: { type: String },
    totalAmount: { type: String },
    typeOfDisease: { type: String },
    age: { type: String, required: true },
    gender: { type: String, required: true },
    presentAddress: { type: String, required: true },
    permanentAddress: { type: String },
    uuid: { type: String, unique: true },
    ref_by: { type: Types.ObjectId, ref: 'doctor' },
    consultant: { type: Types.ObjectId, ref: 'doctor' },
    phone: { type: String, required: true },
    email: { type: String },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

PatientSchema.pre('save', async function (next) {
  const patient: IPatient = this as IPatient;

  const newUUid = await patientIdGenerator().then(id => id);
  patient.uuid = newUUid;
  next();
});
export const Patient = model('patient', PatientSchema);
