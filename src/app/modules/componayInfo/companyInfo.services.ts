import cloudinary from 'cloudinary';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { TCompanyInfo } from './companyInfo.interface';
import { CompanyInfo } from './companyInfo.model';
cloudinary.v2.config({
  cloud_name: config.claudinary_config.cloud_name,
  api_key: config.claudinary_config.api_key,
  api_secret: config.claudinary_config.api_secret,
});
//  create

const createCompanyInfoIntoDB = async (payload: TCompanyInfo) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (payload.default) {
      const doesDefaultExists = await CompanyInfo.find({
        default: true,
      }).session(session);
      if (doesDefaultExists.length > 0) {
        // Update the existing default company info
        doesDefaultExists[0].default = false;
        await doesDefaultExists[0].save({ session });
      }
    }

    const result = await CompanyInfo.create([payload], { session });
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// get info

const getCompanyInfoFromDB = async () => {

  const result = await CompanyInfo.find();
  return result;
};

// update
const updateCompanyInfoIntoDB = async (
  id: string,
  payload: Partial<TCompanyInfo>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (payload.default) {
      const doesDefaultExists = await CompanyInfo.find({
        default: true,
      }).session(session);
      if (doesDefaultExists.length > 0) {
        // Update the existing default company info
        doesDefaultExists[0].default = false;
        await doesDefaultExists[0].save({ session });
      }
    }

    const doesExists = await CompanyInfo.findById(id).session(session);

    if (doesExists && doesExists.publicId !== payload?.publicId) {
      if (doesExists.publicId) {
        await cloudinary.v2.uploader.destroy(doesExists.publicId);
      }
    }

    const result = await CompanyInfo.findByIdAndUpdate(id, payload, {
      new: true,
      session,
    });

    await session.commitTransaction(); // Ensure you wait for commit
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error; // Re-throw to handle it upstream
  } finally {
    session.endSession(); // Always end the session
  }
};
const getCloudinarySecret = async () => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.v2.utils.api_sign_request(
    {
      timestamp,
    },
    cloudinary.v2.config().api_secret as string
  );
  return {
    signature,
    timestamp,
    apiKey: cloudinary.v2.config().api_key,
    cloudName: cloudinary.v2.config().cloud_name,
  };
};
// export

// Checking if creatable
const creatable = async () => {
  const doesDefaultExists = await CompanyInfo.find({ default: true });

  return doesDefaultExists.length === 0;
};

// delete company info
const deleteCompanyInfo = async (id: string) => {
  const doesExists = await CompanyInfo.findById(id);
  if (doesExists && doesExists.default) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Default company info cannot be deleted. Please change default and try again.'
    );
  }
  if (doesExists && doesExists.publicId) {
    await cloudinary.v2.uploader.destroy(doesExists.publicId);
  }
  return await CompanyInfo.deleteOne({ _id: id });
};

// Get single CompanyInfo
const getSingleCompanyInfo = async (id: string) => {
  const result = await CompanyInfo.findById(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company info not found');
  }
  return result;
};

const getDefaultCompanyInfo = async () => {
  const result = await CompanyInfo.findOne({ default: true });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Default company info not found');
  }
  return result;
};

export const CompanyInfoServices = {
  createCompanyInfoIntoDB,
  getCompanyInfoFromDB,
  updateCompanyInfoIntoDB,
  getCloudinarySecret,
  creatable,
  deleteCompanyInfo,
  getSingleCompanyInfo,
  getDefaultCompanyInfo,
};
