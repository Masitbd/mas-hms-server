import { Request } from 'express';
import { Types } from 'mongoose';

export type IOrder = {
  _id?: Types.ObjectId;
  oid?: string;
  uuid: string;
  tests: [
    {
      SL: number;
      test: Types.ObjectId[];
      status: string;
      discount: number;
      deliveryDate: Date;
      remark?: string;
    }
  ];
  totalPrice: number;
  cashDiscount: number;
  parcentDiscount: number;
  deliveryTime: string;
  status: string;
  dueAmount: number;
  refBy?: Types.ObjectId;
  patientType: string;
  paid: number;
  vat?: number;
};

export type IorderFilterableFields =
  | 'searchTerm'
  | 'deliveryTime'
  | 'patientType'
  | 'minDueAmount'
  | 'maxDueAmount'
  | 'minTotalPrice'
  | 'maxTotalPrice';

export type OrderFilterableFields = {
  searchTerm: string;
  oid: string;
  deliveryTime: string;
  name: string;
  phoneNumber: string;
  email: string;
  patientType: string;
  minDueAmount: number;
  maxDueAmount: number;
  minTotalPrice: number;
  maxTotalPrice: number;
};
export type FilterableFieldsSubset = {
  [K in IorderFilterableFields]?: Request['query'][K];
};

// export type IorderFilterableFields = (
//   'searchTerm',
//   'oid',
//   'dedeliveryTime',
//   'name',
//   'phoneNumber',
//   'email',
//   'patientType',
//   'minDueAmount',
//   'maxDueAmount',
//   'minTotalPrice',
//   'maxTotalPrice'
// )[];

export type OtherFilterOptions = {
  minDueAmount?: number;
  maxDueAmount?: number;
  minTotalPrice?: number;
  maxTotalPrice?: number;
} & Partial<IOrder>;
