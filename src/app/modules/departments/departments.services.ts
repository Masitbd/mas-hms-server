import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { IReportGroup } from '../reportGroup/reportGroup.interfaces';
import { ReportGroup } from '../reportGroup/reportGroup.model';
import { IDepartment } from './departments.interfaces';
import { Department } from './departments.model';

const createDepartment = async (
  payload: IDepartment
): Promise<IDepartment | null> => {
  let newDepartmentData;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    payload.label = payload?.label.toUpperCase();
    payload.reportGroupName = payload?.reportGroupName.toUpperCase();
    const department = await Department.create([payload], { session });
    if (!department.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to department');
    }

    const reportGroup = {
      label: '',
      value: '',
      description: '',
    } as IReportGroup;
    reportGroup.label = payload?.reportGroupName.toUpperCase();
    reportGroup.value = payload?.reportGroupName.toLowerCase();
    const newReportGroup = await ReportGroup.create([reportGroup], { session });
    if (!newReportGroup.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Failed to create ReportGroup'
      );
    }
    newDepartmentData = department[0];
    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
  return newDepartmentData;
};
const getSingleDepartment = async (id: string): Promise<IDepartment | null> => {
  console.log('id 13', id);
  if (id === undefined) {
    console.log('id undifined');
  }
  const result = await Department.findOne({ _id: id });
  return result;
};
const getAllDepartment = async () => {
  const result = await Department.find({});
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
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await Department.findOneAndDelete(
      { _id: id },
      {
        session,
        new: true,
      }
    );
    await ReportGroup.deleteOne({ label: isExist.reportGroupName });

    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const DepartmentService = {
  createDepartment,
  getSingleDepartment,
  getAllDepartment,
  updateDepartment,
  deleteDepartment,
};
