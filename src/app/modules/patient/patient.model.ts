import { Schema, model } from 'mongoose';
import { patientIdGenerator } from '../../../utils/PatientIdGenerator';
import { IPatient } from './patient.interface';

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String },
    district: { type: String },
    bloodGroup: { type: String },

    dateOfBirth: { type: String },
    maritalStatus: { type: String },

    nationalID: { type: String },
    religion: { type: String },

    age: { type: String, required: true },
    gender: { type: String, required: true },
    presentAddress: { type: String, required: true },
    permanentAddress: { type: String },
    uuid: { type: String, unique: true },

    phone: { type: String, required: true },
    email: { type: String },
    image: { type: String },
    publicId: { type: String },
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
