import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { Specimen } from './specimen.model';
import { ISpecimen } from './specimen.interfaces';

// For posting new specimen information
const createSpecimen = async (payload: ISpecimen): Promise<void | ISpecimen> => {
  const result = await Specimen.create(payload);
  return result;
};

// This function works for getting  a single specimen
const getSingleSpecimen = async (id: string) => {
  const result = await Specimen.findOne({ _id: id });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Specimen not found');
  }
  return result;
};

// This function works for finding all the specimen
const getAllSpecimen = async (): Promise<ISpecimen[] | null> => {
  const result = await Specimen.find();
  return result;
};

// This function work for updating single specimen
const updateSpecimen = async (
  payload: Partial<ISpecimen>,
  id: string
): Promise<ISpecimen | null> => {
  const result = await Specimen.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

// This function work for deleting a single specimen
const deleteSpecimen = async (id: string) => {
  const result = await Specimen.findOneAndDelete({ _id: id });
  return result;
};

export const SpecimenService = {
  createSpecimen,
  getAllSpecimen,
  getSingleSpecimen,
  updateSpecimen,
  deleteSpecimen,
};
