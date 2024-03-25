import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { paginationFields } from './../../../constants/pagination';
import { doctorFilterableFields } from './doctor.constant';
import { IDoctor } from './doctor.interface';
import { DoctorServices } from './doctor.service';

const getDoctor = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    console.log(req.query);
    const filters = pick(req.query, doctorFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await DoctorServices.getAllDoctor(
      filters,
      paginationOptions
    );

    sendResponse<IDoctor[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor all fetched successfully',
      meta: result.meta,
      data: result.data,
    });
  }
);
const getSingleDoctor = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await DoctorServices.getSingleDoctor(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor fetched successfully',
      data: result,
    });
  }
);
const createDoctor = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await DoctorServices.createDoctor(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor was created successfully',
      data: result,
    });
  }
);
const updateDoctor = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await DoctorServices.updateDoctor(req.params.id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor was edited successfully',
      data: result,
    });
  }
);
const deleteDoctor = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await DoctorServices.deleteDoctor(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Doctor was deleted successfully',
      data: result,
    });
  }
);

export const DoctorControllers = {
  getDoctor,
  deleteDoctor,
  createDoctor,
  getSingleDoctor,
  updateDoctor,
};
