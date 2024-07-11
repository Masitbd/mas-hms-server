import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IReportGroup } from './reportGroup.interfaces';
import { ReportGroup } from './reportGroup.model';

// For posting new ReportGroup information
const createReportGroup = async (
  payload: IReportGroup
): Promise<void | IReportGroup> => {
  const result = await ReportGroup.create(payload);
  return result;
};

// This function works for getting  a single ReportGroup
const getSingleReportGroup = async (id: string) => {
  console.log(id);
  const result = await ReportGroup.findOne({ _id: id });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ReportGroup not found');
  }
  return result;
};

// This function works for finding all the ReportGroup
const getAllReportGroup = async (): Promise<IReportGroup[] | null> => {
  const result = await ReportGroup.find();
  return result;
};

// This function work for updating single ReportGroup
const updateReportGroup = async (
  payload: Partial<IReportGroup>,
  id: string
): Promise<IReportGroup | null> => {
  const result = await ReportGroup.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

// This function work for deleting a single ReportGroup
const deleteReportGroup = async (id: string) => {
  const result = await ReportGroup.findOneAndDelete({ _id: id });
  return result;
};

export const ReportGroupServices = {
  createReportGroup,
  getAllReportGroup,
  getSingleReportGroup,
  updateReportGroup,
  deleteReportGroup,
};
