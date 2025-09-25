import { Types } from 'mongoose';

export type IReportTypeGroup = {
  group: string;
  resultType: string;
  reportGroup: Types.ObjectId;
  isHidden: boolean;
};

export type reportTypeServiceProps = {
  data: IReportTypeGroup;
  id: string;
};

export type IFilterableOptionsG = {
  [key: string]: Types.ObjectId;
};
export type IFilterableOptions = {
  reportGroup: Types.ObjectId;
} & IFilterableOptionsG;
