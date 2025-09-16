import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import { ENUM_RESULT_TYPE } from '../../../enums/resultTypeEnum';
import { ENUM_TEST_STATUS } from '../../../enums/testStatusEnum';
import ApiError from '../../../errors/ApiError';
import { Order } from '../order/order.model';
import { ReportGroup } from '../reportGroup/reportGroup.model';
import { ITest } from '../test/test.interfacs';
import { TestReport } from '../testReport/testReport.model';
import { splitReportByTestId, TestResult } from './report.helper';
import { IReportForParameter } from './report.interface';
import {
  DescriptionBasedReport,
  MicrobiologyReport,
  ParameterBasedReport,
} from './report.model';

const post = async (
  params: IReportForParameter & { test?: string; testIds?: string[] }
) => {
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
        if (reportGroup?.testResultType == ENUM_RESULT_TYPE.PARAMETER_BASED) {
          const tests = order.tests.map((test: any) => {
            const rTest = params?.testIds?.includes(test.test?._id.toString());
            if (rTest && test.status !== ENUM_TEST_STATUS.REFUNDED) {
              test.status = 'completed';
            }
            test.test = test.test._id as unknown as ITest;
            return test;
          });
          order.tests = tests as any;
        } else if (
          reportGroup?.testResultType == ENUM_RESULT_TYPE.DESCRIPTIVE ||
          reportGroup.testResultType == ENUM_RESULT_TYPE.BACTERIAL ||
          reportGroup?.testResultType == ENUM_RESULT_TYPE.PARAMETER_BASED
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
        result = await ParameterBasedReport.insertMany(
          splitReportByTestId(params as unknown as TestResult),
          { session }
        );
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

const patch = async (
  params: IReportForParameter & { test: string; testIds: string[] }
) => {
  if ('_id' in params) {
    delete params['_id'];
  }
  switch (params.reportGroup.testResultType) {
    case 'parameter':
      return await params?.testIds?.map(async (id: string) => {
        const data = {
          ...params,
          testResult: params?.testResult?.filter(
            tr => tr?.testId?.toString() == id?.toString()
          ),
          testId: new Types.ObjectId(id),
        };
        await ParameterBasedReport.updateOne(
          {
            oid: params.oid,
            testId: new Types.ObjectId(id),
          },
          data
        );
      });

    case 'descriptive':
      return await DescriptionBasedReport.updateOne(
        { oid: params.oid, test: new Types.ObjectId(params.testIds[0]) },
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
  params: {
    reportGroup: string;
    resultType: string;
    test: string;
    testIds: string;
  }
) => {
  const { reportGroup, resultType } = params;
  if (!reportGroup || !resultType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid report group');
  }

  const queryForParameterBasedReport = async () => {
    const result = await ParameterBasedReport.find({
      oid: oid,
      testId: {
        $in: params?.testIds?.split("'").map(id => new Types.ObjectId(id)),
      },
    });

    return result;
  };

  switch (resultType) {
    case 'parameter':
      return await queryForParameterBasedReport();

    case 'descriptive':
      return await DescriptionBasedReport.find({
        oid: oid,
        test: {
          $in: params?.testIds?.split("'").map(id => new Types.ObjectId(id)),
        },
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
