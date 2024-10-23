import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { ISealFilterableFields, sealFilterableFields } from './seal.interface';
import { DoctorSealService } from './seal.service';

//Controller function for getting all the DoctorSeal
const getAllDoctorSeal = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filteringOption = pick(req.query, sealFilterableFields);
    const result = await DoctorSealService.getAllDoctorSeal(
      filteringOption as Record<ISealFilterableFields, string>
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor Seal all fetched successfully',
      data: result,
    });
  }
);

// Controller function for getting a specific DoctorSeal
const getSingleDoctorSeal = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const result = await DoctorSealService.getSingleDoctorSeal(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor Seal fetched successfully',
      data: result,
    });
  }
);

// For creating new DoctorSeal
const createDoctorSeal = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await DoctorSealService.createDoctorSeal(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor Seal was created successfully',
      data: result,
    });
  }
);

// Controller function for editing existing DoctorSeal
const updateDoctorSeal = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await DoctorSealService.updateDoctorSeal(
      req.body,
      req.params.id
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor Seal was edited successfully',
      data: result,
    });
  }
);

// Controller function for remove DoctorSeal
const deleteDoctorSeal = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await DoctorSealService.deleteDoctorSeal(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor Seal was deleted successfully',
      data: result,
    });
  }
);

export const DoctorSealController = {
  createDoctorSeal,
  updateDoctorSeal,
  getSingleDoctorSeal,
  getAllDoctorSeal,
  deleteDoctorSeal,
};
