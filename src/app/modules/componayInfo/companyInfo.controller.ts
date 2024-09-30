import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CompanyInfoServices } from './companyInfo.services';

const createCompanyInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyInfoServices.createCompanyInfoIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'company info created Successfully',
    data: result,
  });
});

// get

const getCompanyInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyInfoServices.getCompanyInfoFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'company info retrived Successfully',
    data: result,
  });
});

// update

const updateCompanyInfo = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CompanyInfoServices.updateCompanyInfoIntoDB(
    id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'company info updated Successfully',
    data: result,
  });
});

const getCloudinarySecret = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyInfoServices.getCloudinarySecret();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cloudinary secreat feacthed Successfully',
    data: result,
  });
});

const getCreatable = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyInfoServices.creatable();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Confermation Featched  Successfully',
    data: result,
  });
});

const deleteCompanyInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyInfoServices.deleteCompanyInfo(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Company info deleted successfully',
    data: result,
  });
});

const getSingleCompanyInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyInfoServices.getSingleCompanyInfo(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Single company info retrived  Successfully',
    data: result,
  });
});

const getDefaultCompanyInfo = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CompanyInfoServices.getDefaultCompanyInfo();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Default  company info retrived  Successfully',
      data: result,
    });
  }
);
// exports

export const CompanyInfoControllers = {
  createCompanyInfo,
  getCompanyInfo,
  updateCompanyInfo,
  getCloudinarySecret,
  getCreatable,
  deleteCompanyInfo,
  getDefaultCompanyInfo,
  getSingleCompanyInfo,
};
