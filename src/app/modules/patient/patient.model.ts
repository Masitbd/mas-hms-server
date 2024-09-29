import { Schema, Types, model } from 'mongoose';
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
  const date = new Date();
  const month = date.getMonth().toString().padStart(2, '0');
  const year = date.getUTCFullYear().toString().slice(2, 4);
  const lastPatient = await Patient.find().sort({ uuid: -1 }).limit(1);
  const uuid =
    lastPatient.length > 0 ? Number(lastPatient[0].uuid?.split('-')[2]) : 0;

  const newUUid =
    'R-' + month + year + '-' + String(Number(uuid) + 1).padStart(7, '0');
  patient.uuid = newUUid;
  next();
});
export const Patient = model('patient', PatientSchema);
