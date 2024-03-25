import { Types } from 'mongoose';
import { IAccount } from '../account/account.interface';

export type IDoctor = {
  name: string;
  fatherName: string;
  email: string;
  designation: string;
  phone: string;
  image?: string;
  account_number: string; // as account.uuid
  account_id: Types.ObjectId | IAccount; // as account_.id
};

export type IDoctorFilters = {
  searchTerm?: string;
  name?: string;
  phone?: string;
  email?: string;
};
