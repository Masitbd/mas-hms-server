import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { employeeFilterableFilds } from './employeeRegistration.conatant';
import { EmployeeRegistrationServices } from './employeeRegistration.service';

const createNewEmployeeRegistration = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await EmployeeRegistrationServices.postEmployeeRegistration(
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'New employee was created successfully',
      data: result,
    });
  }
);

const updateEmployeeRegistration = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await EmployeeRegistrationServices.patchEmployeeRegistration(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Employee was edited successfully',
      data: result,
    });
  }
);

const removeEmployeeRegistration = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result =
      await EmployeeRegistrationServices.deleteEmployeeRegistration(
        req.params.id
      );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'One employee was deleted successfully',
      data: result,
    });
  }
);

const getSingleEmployeeRegistration = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result =
      await EmployeeRegistrationServices.fetchSingleEmployeeRegistration(
        req.params.id
      );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Employee fetched successfully',
      data: result,
    });
  }
);
/// pagination in module 14
const getAllEmplloyeeRegistration = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filters = pick(req.query, employeeFilterableFilds);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result =
      await EmployeeRegistrationServices.fetchAllEmployeeRegistration(
        filters,
        options
      );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All Employee fetched successfully',
      data: result,
    });
  }
);

export const EmployeeRegistrationController = {
  createNewEmployeeRegistration,
  updateEmployeeRegistration,
  removeEmployeeRegistration,
  getSingleEmployeeRegistration,
  getAllEmplloyeeRegistration,
};
