import { Types } from 'mongoose';
import { IAccount } from '../account/account.interface';
import { IEmployeeRegistration } from '../employeeRegistration/employeeRegistration.interface';

export type IDoctor = {
  title: string;
  name: string;
  fatherName: string;
  email: string;
  designation: string;
  phone: string;
  image?: string;
  code?: string;
  account_number: string; // as account.uuid
  account_id: Types.ObjectId | IAccount; // as account_.id
  uuid?: string;
  address?: string;
  assignedME: Types.ObjectId | IEmployeeRegistration;
};

export type IDoctorFilters = {
  searchTerm?: string;
  name?: string;
  phone?: string;
  email?: string;
};
