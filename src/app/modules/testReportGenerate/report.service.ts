import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import { ENUM_RESULT_TYPE } from '../../../enums/resultTypeEnum';
import { ENUM_TEST_STATUS } from '../../../enums/testStatusEnum';
import ApiError from '../../../errors/ApiError';
import { Order } from '../order/order.model';
import { ReportGroup } from '../reportGroup/reportGroup.model';
import { ITest } from '../test/test.interfacs';
import { TestReport } from '../testReport/testReport.model';
import { IReportForParameter } from './report.interface';
import {
  DescriptionBasedReport,
  MicrobiologyReport,
  ParameterBasedReport,
} from './report.model';

const post = async (params: IReportForParameter & { test?: string }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orderStatusChanger = async () => {
      const order = await Order.findOne({ oid: params.oid }).populate(
        'tests.test'
      );
      const reportGroup = await ReportGroup.findOne({
        label: params.reportGroup.label,
      });
      if (order && reportGroup) {
        const reportGroupId = reportGroup._id;

        if (reportGroup?.testResultType == ENUM_RESULT_TYPE.PARAMETER_BASED) {
          const tests = order.tests.map((test: any) => {
            const rTest =
              test.test?.reportGroup.toString() == reportGroupId.toString();
            if (rTest && test.status !== ENUM_TEST_STATUS.REFUNDED) {
              test.status = 'completed';
            }
            test.test = test.test._id as unknown as ITest;
            return test;
          });
          order.tests = tests as any;
        } else if (
          reportGroup?.testResultType == ENUM_RESULT_TYPE.DESCRIPTIVE ||
          reportGroup.testResultType == ENUM_RESULT_TYPE.BACTERIAL
        ) {
          const tests = order.tests?.map((test: any) => {
            if (
              test?.test?._id?.toString() == params?.test &&
              test?.status !== ENUM_TEST_STATUS.REFUNDED
            ) {
              test.status = 'completed';
            }
            return test;
          });
          order.tests = tests as any;
        }

        await order.save({ session });
      }
    };

    let result;
    switch (params.reportGroup.testResultType) {
      case 'parameter':
        await orderStatusChanger();
        result = await ParameterBasedReport.create([params], { session });
        break;

      case 'descriptive':
        await orderStatusChanger();
        result = await DescriptionBasedReport.create([params], { session });
        break;

      case 'bacterial':
        await orderStatusChanger();
        result = await MicrobiologyReport.create([params], { session });
        break;
      default:
        throw new Error('Invalid report group');
    }

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error as string);
  } finally {
    await session.endSession();
  }
};

const patch = async (params: IReportForParameter & { test: string }) => {
  console.log(params);
  if ('_id' in params) {
    delete params['_id'];
  }
  switch (params.reportGroup.testResultType) {
    case 'parameter':
      return await ParameterBasedReport.updateOne({ oid: params.oid }, params);

    case 'descriptive':
      return await DescriptionBasedReport.updateOne(
        { oid: params.oid, test: new Types.ObjectId(params.test) },
        params
      );

    case 'bacterial':
      return await MicrobiologyReport.updateOne(
        { oid: params.oid, test: new Types.ObjectId(params.test) },
        params
      );

    default:
      throw new Error('Invalid report group');
  }
};

const fetchSingle = async (
  oid: string,
  params: { reportGroup: string; resultType: string; test: string }
) => {
  const { reportGroup, resultType } = params;
  if (!reportGroup || !resultType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid report group');
  }

  switch (resultType) {
    case 'parameter':
      return await ParameterBasedReport.find({
        oid: oid,
        'reportGroup.label': reportGroup,
      });

    case 'descriptive':
      return await DescriptionBasedReport.find({
        oid: oid,
        test: new Types.ObjectId(params?.test),
      });

    case 'bacterial':
      return await MicrobiologyReport.find({
        oid: oid,
        test: new Types.ObjectId(params?.test),
      });

    default:
      break;
  }
};

const fetchAll = async () => {
  return await TestReport.find();
};

export const ReportService = {
  post,
  patch,
  fetchSingle,
  fetchAll,
};
