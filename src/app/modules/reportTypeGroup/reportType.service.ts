import { Types } from 'mongoose';
import { ReportTypeGroup } from './reportType.model';
import {
  IFilterableOptions,
  IReportTypeGroup,
  reportTypeServiceProps,
} from './reportTypeGroup.interface';

const post = async (params: IReportTypeGroup) => {
  return await ReportTypeGroup.create(params);
};
const patch = async (params: reportTypeServiceProps) => {
  const { id, data } = params;
  return await ReportTypeGroup.findOneAndUpdate({ _id: id }, data);
};

const fetchSingle = async (params: string) => {
  return await ReportTypeGroup.findOne({ _id: params });
};
const fetchAll = async (params: Partial<IFilterableOptions>) => {
  const condition: { [x: string]: string | Types.ObjectId | undefined }[] = [];
  if (Object.keys(params).length)
    Object.keys(params).map((value: string) => {
      if (params[value] !== undefined)
        condition.push({ [value]: params[value] });
    });

  const iFcondition = condition.length > 0 ? { $and: condition } : {};
  return await ReportTypeGroup.find(iFcondition)
    .populate('reportGroup')
    .populate('department');
};

export const ReportTypeGroupService = { post, patch, fetchSingle, fetchAll };
