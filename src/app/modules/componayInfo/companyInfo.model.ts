import { model, Schema } from 'mongoose';
import { TCompanyInfo } from './companyInfo.interface';

const companyInfoSchema = new Schema<TCompanyInfo>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  period: { type: String, required: true },
  photoUrl: { type: String },
  publicId: { type: String }, // For cloudinary image
  default: { type: Boolean },
});

export const CompanyInfo = model('CompanyInfo', companyInfoSchema);
