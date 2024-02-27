import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { AcocuntController } from '../account/account.controller';
import { doctorSearchableFields } from './doctor.constant';
import { IDoctor, IDoctorFilters } from './doctor.interface';
import { Doctor } from './doctor.model';

const createDoctor = async (payload: IDoctor): Promise<IDoctor> => {
  const lastDoctor = await Doctor.find().sort({ uuid: -1 }).limit(1);

  const testId = lastDoctor.length > 0 ? Number(lastDoctor[0].uuid) : 0;
  const newTestId = testId + 1;

  const uniqueId = String(newTestId).padStart(4, '0');
  const account = await AcocuntController.createNewAccount({
    balance: 0,
    balanceType: 'cr',
    uuid: uniqueId,
  });
  payload.account = account._id;
  payload.uuid = uniqueId;
  const result = (await Doctor.create(payload)).populate('account');
  return result;
};

const updateDoctor = async (
  id: string,
  payload: Partial<IDoctor>
): Promise<IDoctor | null> => {
  const result = await Doctor.findOneAndUpdate(
    {
      _id: id,
    },
    payload,
    {
      new: true,
    }
  );
  return result;
};

const deleteDoctor = async (id: string) => {
  const result = await Doctor.findOneAndDelete({ _id: id });
  return result;
};

const getAllDoctor = async (
  filters: IDoctorFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IDoctor[]>> => {
  const { searchTerm } = filters;
  console.log(searchTerm);
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: doctorSearchableFields.map(fields => ({
        [fields]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  const { page, limit, skip } =
    paginationHelpers.calculatePagination(paginationOptions);
  const whereConditionsData =
    andConditions.length > 0
      ? {
          $and: andConditions,
        }
      : {};

  const result = await Doctor.find(whereConditionsData)
    .limit(limit)
    .skip(skip)
    .populate('account');
  const total = await Doctor.countDocuments();
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleDoctor = async (id: string): Promise<IDoctor | null> => {
  const result = await Doctor.findOne({ _id: id }).populate('account');
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
  }

  return result;
};

export const DoctorServices = {
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllDoctor,
  getSingleDoctor,
};
