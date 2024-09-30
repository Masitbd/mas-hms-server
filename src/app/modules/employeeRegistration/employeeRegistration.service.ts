import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { employeeSearchableFields } from './employeeRegistration.conatant';

import { IEmployeeRegistration } from './employeeRegistration.interface';
import { EmployeeRegistration } from './employeeRegistration.model';
// this is employee post
const postEmployeeRegistration = async (
  payload: IEmployeeRegistration
): Promise<IEmployeeRegistration> => {
  payload.defaultImage =
    'https://res.cloudinary.com/deildnpys/image/upload/v1707574218/myUploads/wrm6s87apasmhne3soyb.jpg';
  const result = await EmployeeRegistration.create(payload);
  return result;
};

const patchEmployeeRegistration = async (
  id: string,
  payload: Partial<IEmployeeRegistration>
): Promise<IEmployeeRegistration | null> => {
  const result = await EmployeeRegistration.findOneAndUpdate(
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

const deleteEmployeeRegistration = async (id: string) => {
  const result = await EmployeeRegistration.findOneAndDelete({ _id: id });
  return result;
};

const fetchSingleEmployeeRegistration = async (
  id: string
): Promise<IEmployeeRegistration | null> => {
  const result = await EmployeeRegistration.findOne({ _id: id });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'EmployeeRegistration not found');
  }

  return result;
};

const fetchAllEmployeeRegistration = async (
  filterOption: any,
  options: any
) => {
  const { searchTerm, ...filterOptions } = filterOption;

  // implement searchterm means partial search
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: employeeSearchableFields.map(field => {
        return {
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
        };
      }),
    });
  }

  // implement filter options means exact match

  if (Object.keys(filterOptions).length > 0) {
    const filterConditions = Object.keys(filterOptions).map((field: any) => {
      return {
        [field]: filterOptions[field],
      };
    });

    andConditions.push({ $and: filterConditions });
  }
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const isCondition = andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await EmployeeRegistration.find(isCondition)
    .limit(limit)
    .skip(skip);

  return {
    meta: {
      page,
      limit,
    },
    data: result,
  };
};

export const EmployeeRegistrationServices = {
  postEmployeeRegistration,
  patchEmployeeRegistration,
  deleteEmployeeRegistration,
  fetchAllEmployeeRegistration,
  fetchSingleEmployeeRegistration,
};
