import cloudinary from 'cloudinary';
import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { IPatient, patientSearchablePath } from './patient.interface';
import { Patient } from './patient.model';

cloudinary.v2.config({
  cloud_name: config.claudinary_config.cloud_name,
  api_key: config.claudinary_config.api_key,
  api_secret: config.claudinary_config.api_secret,
});

const postPatient = async (params: IPatient) => {
  const result = await Patient.create(params);
  return result;
};
const patchPatient = async (params: IPatient) => {
  const doesExists = await Patient.findOne({ uuid: params.uuid });
  if (!doesExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Patient not found');
  }

  if (doesExists?.publicId && doesExists?.publicId !== params.publicId) {
    await cloudinary.v2.uploader.destroy(doesExists.publicId);
  }

  const result = await Patient.findOneAndUpdate({ uuid: params.uuid }, params);

  return result;
};

const fetchSingel = async (params: string) => {
  const result = await Patient.findOne({ uuid: params });
  return result;
};
const fetchAll = async (query: Record<string, string>) => {
  const andConditions = [];
  if (query?.searchTerm) {
    andConditions.push({
      $or: patientSearchablePath.map(field => {
        return {
          [field]: {
            $regex: query?.searchTerm,
            $options: 'i',
          },
        };
      }),
    });
  }

  const isCondition = andConditions?.length ? andConditions[0] : {};

  const result = await Patient.find(isCondition);
  return result;
};
export const PatientService = {
  postPatient,
  patchPatient,
  fetchSingel,
  fetchAll,
};
