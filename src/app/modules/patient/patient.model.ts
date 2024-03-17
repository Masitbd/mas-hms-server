import { Schema, Types, model } from 'mongoose';
import { IPatient } from './patient.interface';

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true },
    age: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
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
  const lastPatient = await Patient.find().sort({ uuid: -1 }).limit(1);
  const uuid =
    lastPatient.length > 0 ? Number(lastPatient[0].uuid?.split('-')[2]) : 0;

  const newUUid = 'HMS-' + 'P-' + String(Number(uuid) + 1).padStart(7, '0');
  patient.uuid = newUUid;
  next();
});
export const Patient = model('patient', PatientSchema);
