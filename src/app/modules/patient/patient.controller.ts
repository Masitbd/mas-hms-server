import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IPatient } from './patient.interface';
import { PatientService } from './patient.service';

const createNewPatient = catchAsync(async (req: Request, res: Response) => {
  const testData = req.body;

  const result = await PatientService.postPatient(
    testData as unknown as IPatient
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Test successfully created',
    data: result,
    success: true,
  });
});

const updatePatient = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await PatientService.patchPatient(req.body);

    sendResponse<IPatient>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order created successfully',
      data: result,
    });
  }
);
const getSingle = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await PatientService.fetchSingel(req.params.id);

    sendResponse<IPatient>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order created successfully',
      data: result,
    });
  }
);

const getAll = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await PatientService.fetchAll();

    sendResponse<IPatient[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order created successfully',
      data: result,
    });
  }
);
export const PatientController = {
  createNewPatient,
  updatePatient,
  getSingle,
  getAll,
};
