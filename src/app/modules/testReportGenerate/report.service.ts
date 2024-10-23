import httpStatus from 'http-status';
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

const post = async (params: IReportForParameter) => {
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

        await order.save();
      }
    };

    switch (params.reportGroup.testResultType) {
      case 'parameter':
        orderStatusChanger();
        return await ParameterBasedReport.create(params);

      case 'descriptive':
        orderStatusChanger();
        return await DescriptionBasedReport.create(params);

      case 'bacterial':
        orderStatusChanger();
        return await MicrobiologyReport.create(params);
      default:
        throw new Error('Invalid report group');
    }
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'InterNal server error'
    );
  }
};

const patch = async (params: IReportForParameter) => {
  if ('_id' in params) {
    delete params['_id'];
  }
  switch (params.reportGroup.testResultType) {
    case 'parameter':
      return await ParameterBasedReport.updateOne({ oid: params.oid }, params);

    case 'descriptive':
      return await DescriptionBasedReport.updateOne(
        { oid: params.oid },
        params
      );

    case 'bacterial':
      return await MicrobiologyReport.updateOne({ oid: params.oid }, params);

    default:
      throw new Error('Invalid report group');
  }
};

const fetchSingle = async (
  oid: string,
  params: { reportGroup: string; resultType: string }
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
        'reportGroup.label': reportGroup,
      });

    case 'bacterial':
      return await MicrobiologyReport.find({
        oid: oid,
        'reportGroup.label': reportGroup,
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
