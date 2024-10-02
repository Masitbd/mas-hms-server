import { Request } from 'express';
import { Types } from 'mongoose';
import { IRefund } from '../refund/refund.inrerface';
import { ITest } from '../test/test.interfacs';

export type IOrder = {
  _id?: Types.ObjectId;
  oid?: string;
  uuid: string;
  tests: {
    _id?: string;
    SL: number;
    test: Types.ObjectId | ITest;
    status: string;
    discount: number;
    deliveryDate: Date;
    remark?: string;
  }[];
  totalPrice: number;
  consultant?: Types.ObjectId;
  cashDiscount: number;
  parcentDiscount: number;
  deliveryTime: string;
  status: string;
  dueAmount: number;
  refBy?: Types.ObjectId;
  patientType: string;
  paid: number;
  vat?: number;
  discountedBy: string;
  postedBy: string;
  refundData?: Partial<IRefund>;
  tubePrice: number;
};

export type IorderFilterableFields =
  | 'searchTerm'
  | 'deliveryTime'
  | 'patientType'
  | 'minDueAmount'
  | 'maxDueAmount'
  | 'minTotalPrice'
  | 'maxTotalPrice'
  | 'oid'
  | 'postedBy';

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

export type ITestsFromOrder = {
  _id?: string;
  SL: number;
  test: Types.ObjectId | ITest;
  status: string;
  discount: number;
  deliveryDate: Date;
  remark?: string;
};
