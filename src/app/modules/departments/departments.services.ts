import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IDepartment } from './departments.interfaces';
import { Department } from './departments.model';

const createDepartment = async (
  payload: IDepartment
): Promise<IDepartment | null> => {
  return await Department.create(payload);
};
const getSingleDepartment = async (id: string): Promise<IDepartment | null> => {
  const result = await Department.findOne({ _id: id });
  return result;
};
const getAllDepartment = async () => {
  const result = await Department.find();
  return result;
};

const updateDepartment = async (
  id: string,
  payload: Partial<IDepartment>
): Promise<IDepartment | null> => {
  const isExist = await Department.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found !');
  }

  const result = await Department.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const deleteDepartment = async (id: string): Promise<IDepartment | null> => {
  const isExist = await Department.findOne({ _id: id });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found!');
  }
  const result = await Department.findOneAndDelete(
    { _id: id },
    {
      new: true,
    }
  );
  return result;
};

export const DepartmentService = {
  createDepartment,
  getSingleDepartment,
  getAllDepartment,
  updateDepartment,
  deleteDepartment,
};
