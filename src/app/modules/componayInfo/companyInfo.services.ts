import { TCompanyInfo } from './companyInfo.interface';
import { CompanyInfo } from './companyInfo.model';

//  create

const createCompanyInfoIntoDB = async (payload: TCompanyInfo) => {
  const isExist = await CompanyInfo.findOne({ phone: payload.phone });

  if (isExist) {
    throw new Error('Already Exist');
  }

  const result = await CompanyInfo.create(payload);
  return result;
};

// get info

const getCompanyInfoFromDB = async () => {
  const result = await CompanyInfo.findOne({
    default: true,
  });
  return result;
};

// update

const updateCompanyInfoIntoDB = async (
  id: string,
  payload: Partial<TCompanyInfo>
) => {
  const result = await CompanyInfo.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

// export

export const CompanyInfoServices = {
  createCompanyInfoIntoDB,
  getCompanyInfoFromDB,
  updateCompanyInfoIntoDB,
};
