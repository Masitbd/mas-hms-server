import { model, Schema } from 'mongoose';
import { TCompanyInfo, TCompanyInfoForOffline } from './companyInfo.interface';

const companyInfoSchema = new Schema<TCompanyInfo>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  period: { type: String, required: true },
  photoUrl: { type: String },
  publicId: { type: String }, // For cloudinary image
  default: { type: Boolean },
});

const companyInfoSchemaForOffline = new Schema<TCompanyInfoForOffline>({
  photo: { type: String, required: true },
});
export const CompanyInfo = model('CompanyInfo', companyInfoSchema);
export const CompanyInfoForOffline = model(
  'CompanyInfoForOffline',
  companyInfoSchemaForOffline
);
