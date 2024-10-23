import httpStatus from 'http-status';
import mongoose, { FilterQuery } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import {
  IDoctorSeal,
  ISealFilterableFields,
  sealFilterableFields,
} from './seal.interface';
import { DoctorSeal } from './seal.model';

// For posting new DoctorSeal information
const createDoctorSeal = async (
  payload: IDoctorSeal
): Promise<void | IDoctorSeal> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (payload.default == true) {
      const doesDefaultExists = await DoctorSeal.findOne({
        default: true,
      }).session(session);
      if (doesDefaultExists) {
        doesDefaultExists.default = false;
        await doesDefaultExists.save({ session });
      }
    }

    const result = await DoctorSeal.create([payload], { session });

    await session.commitTransaction();
    return result as unknown as IDoctorSeal;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const updateDoctorSeal = async (
  payload: Partial<IDoctorSeal>,
  id: string
): Promise<IDoctorSeal | null> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (payload.default == true) {
      const doesDefaultExists = await DoctorSeal.findOne({
        default: true,
      }).session(session);
      if (doesDefaultExists) {
        doesDefaultExists.default = false;
        await doesDefaultExists.save({ session });
      }
    }

    const result = await DoctorSeal.findOneAndUpdate({ _id: id }, payload, {
      new: true,
    });
    await session.commitTransaction();

    return result as unknown as IDoctorSeal;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

// This function works for finding all the DoctorSeal
const getAllDoctorSeal = async (
  payload: Record<ISealFilterableFields, string>
): Promise<IDoctorSeal[] | null> => {
  const query: Record<string, string>[] = [];
  if (payload) {
    for (const key in payload) {
      if (sealFilterableFields.includes(key as ISealFilterableFields)) {
        query.push({
          [key as keyof typeof payload]: payload[key as keyof typeof payload],
        });
      }
    }
  }
  const isCondition: FilterQuery<IDoctorSeal> =
    query.length > 0 ? { $and: query } : {};
  const result = await DoctorSeal.find(isCondition);
  return result;
};
// This function works for getting  a single DoctorSeal
const getSingleDoctorSeal = async (id: string) => {
  const result = await DoctorSeal.findOne({ _id: id });
  return result;
};

// This function work for updating single DoctorSeal

// This function work for deleting a single DoctorSeal
const deleteDoctorSeal = async (id: string) => {
  const doesExists = await DoctorSeal.findOne({ _id: id });
  if (doesExists && doesExists.default) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Default Cannot be deleted');
  }
  const result = await DoctorSeal.findOneAndDelete({ _id: id });
  return result;
};

export const DoctorSealService = {
  createDoctorSeal,
  getAllDoctorSeal,
  getSingleDoctorSeal,
  updateDoctorSeal,
  deleteDoctorSeal,
};
