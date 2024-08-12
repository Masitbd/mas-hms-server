import httpStatus from 'http-status';
import { FilterQuery, Types } from 'mongoose';
import { ENUM_RESULT_TYPE } from '../../../enums/resultTypeEnum';
import ApiError from '../../../errors/ApiError';
import { ReportTypeGroup } from '../reportTypeGroup/reportType.model';
import {
  DescriptiveBasedReportType,
  MicrobiologyBasedReportType,
  ParameterBasedReportType,
  ReportType,
} from './reportType.model';
import {
  IReportType,
  fetchAllreportTypeProps,
  patchReportTypeProps,
  reportTypeFlterableField,
} from './reporttype.interface';

const postReportType = async (params: IReportType) => {
  const group = await ReportTypeGroup.findOne({ _id: params.reportTypeGroup });
  if (!group)
    throw new ApiError(httpStatus.NOT_FOUND, 'ReportTypeGroup not found');

  switch (group?.resultType) {
    case ENUM_RESULT_TYPE.PARAMETER_BASED:
      return await ParameterBasedReportType.create(params);

    case ENUM_RESULT_TYPE.DESCRIPTIVE:
      return await DescriptiveBasedReportType.create(params);

    case ENUM_RESULT_TYPE.BACTERIAL:
      return await MicrobiologyBasedReportType.create(params);

    case ENUM_RESULT_TYPE.OTHER:
      return await ReportType.create(params);

    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Result type');
  }
};

const patchReportType = async (params: patchReportTypeProps) => {
  const { data, id } = params;
  const reportType = await ReportType.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: 'reporttypegroups',
        localField: 'reportTypeGroup',
        foreignField: '_id',
        as: 'reportTypeGroup',
      },
    },
    {
      $unwind: '$reportTypeGroup',
    },
    {
      $addFields: {
        resultType: '$reportTypeGroup.resultType',
      },
    },
    {
      $project: {
        resultType: 1,
      },
    },
  ]);

  switch (reportType[0].resultType) {
    case ENUM_RESULT_TYPE.PARAMETER_BASED:
      return await ParameterBasedReportType.findByIdAndUpdate(id, data, {
        new: true,
      });

    case ENUM_RESULT_TYPE.DESCRIPTIVE:
      return await DescriptiveBasedReportType.findByIdAndUpdate(id, data, {
        new: true,
      });

    case ENUM_RESULT_TYPE.BACTERIAL:
      return await MicrobiologyBasedReportType.findByIdAndUpdate(id, data, {
        new: true,
      });

    case ENUM_RESULT_TYPE.OTHER:
      return await ReportType.findByIdAndUpdate(id, data, {
        new: true,
      });

    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Result type');
  }
};

const fetchSingleReportType = async (params: string) => {
  return await ReportType.findOne({ _id: params });
};

const fetchAllReportType = async (props: Partial<fetchAllreportTypeProps>) => {
  const condition: { [x: string]: string | Types.ObjectId | undefined }[] = [];

  if (Object.keys(props).length > 0) {
    reportTypeFlterableField.forEach((value: keyof typeof props) => {
      if (props[value] !== undefined) {
        condition.push({ [value]: props[value] });
      }
    });
  }
  const isCondition: FilterQuery<IReportType> =
    condition.length > 0 ? { $and: condition } : {};
  const result = await ReportType.find(isCondition);
  return result;
};

export const ReportTypeService = {
  postReportType,
  patchReportType,
  fetchSingleReportType,
  fetchAllReportType,
};
