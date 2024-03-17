import { Types } from 'mongoose';

export type IPatient = {
  name: string;
  age: string;
  gender: string;
  address: string;
  uuid: string;
  ref_by?: Types.ObjectId;
  consultant?: Types.ObjectId;
  phone: string;
  email?: string;
  image: string;
};
