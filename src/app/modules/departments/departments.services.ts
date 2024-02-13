import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IDepartment } from './departments.interfaces';
import { Department } from './departments.model';

const postNewDepartment = async (
  payload: IDepartment
): Promise<IDepartment | null> => {
  const result = await Department.create(payload);
  return result;
};

const patchDepartment = async (
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
const fetchSingleDepartment = async (
  id: string
): Promise<IDepartment | null> => {
  const result = await Department.findOne({ _id: id });
  return result;
};
const fetchAllDepartment = async () => {
  const result = await Department.find({});
  return result;
};

export const DepartmentService = {
  postNewDepartment,
  patchDepartment,
  deleteDepartment,
  fetchSingleDepartment,
  fetchAllDepartment,
};
