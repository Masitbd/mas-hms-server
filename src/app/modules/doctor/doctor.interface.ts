import { Types } from 'mongoose';

export type IDoctor = {
  name: string;
  fatherName: string;
  designation: string;
  phone: string;
  image?: string;
  account: Types.ObjectId;
  uuid: string;
};

export type IDoctorFilters = {
  searchTerm?: string;
  name?: string;
  phone?: string;
  email?: string;
};
