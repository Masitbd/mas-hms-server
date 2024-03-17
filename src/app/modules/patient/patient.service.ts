import { IPatient } from './patient.interface';
import { Patient } from './patient.model';

const postPatient = async (params: IPatient) => {
  const result = await Patient.create(params);
  return result;
};
const patchPatient = async (params: IPatient) => {
  const result = await Patient.findOneAndUpdate({ uuid: params.uuid }, params);
  return result;
};

const fetchSingel = async (params: string) => {
  const result = await Patient.findOne({ uuid: params });
  return result;
};
const fetchAll = async () => {
  const result = await Patient.find();
  return result;
};
export const PatientService = {
  postPatient,
  patchPatient,
  fetchSingel,
  fetchAll,
};
