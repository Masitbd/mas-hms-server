import { PipelineStage, Types } from 'mongoose';
import { Doctor } from '../doctor/doctor.model';
import { Order } from '../order/order.model';
import { Test } from '../test/test.model';
import { Transation } from '../transaction/transaction.model';
import {
  clientWiseIncomeStatementPipeline,
  departmentWiseCollectionSummeryPipeline,
  departmentWiseIncomeStatement,
  dewCollectionSummeryPipeline,
  doctorOverAllSummeryByRefByPipeline,
  doctorPerformanceSummeryDeptWisePipeline,
  doctorPerformanceSummeryPipeline,
  doctorPerformanceSummeryTestWisePipeline,
  employeePerfromanceSummeryPipeline,
  newBillSummeryPipeline,
  pipelineForOverAllDoctor,
  refByWiseIncomeStatementPipeline,
  testWiseIncomeStatementPipeline,
} from './financialReport.utils';

const fetchOverAllComission = async (params: { from: Date; to: Date }) => {
  const result = await Order.aggregate(
    pipelineForOverAllDoctor(params) as PipelineStage[]
  );
  return result;
};

const fetchDoctorPerformanceSummery = async (params: {
  from: Date;
  to: Date;
  refBy: string;
}) => {
  const summery = await Order.aggregate(
    doctorOverAllSummeryByRefByPipeline(params)
  );

  const overall = await Order.aggregate(
    doctorPerformanceSummeryPipeline(params)
  );
  return {
    summery,
    overall,
  };
};

const fetchTestWiseIncomeStatement = async (params: {
  from: Date;
  to: Date;
}) => {
  return await Order.aggregate(
    testWiseIncomeStatementPipeline(params) as PipelineStage[]
  );
};

const fetchDeptWiseIncomeStatement = async (params: {
  from: Date;
  to: Date;
}) => {
  return await Order.aggregate(
    departmentWiseIncomeStatement(params) as PipelineStage[]
  );
};

const fetchDeptWiseCollectionSummery = async (params: {
  from: Date;
  to: Date;
}) => {
  return await Order.aggregate(
    departmentWiseCollectionSummeryPipeline(params) as PipelineStage[]
  );
};

const fetchDeptWIseDoctorPerformance = async (params: {
  from: Date;
  to: Date;
  refBy: string;
}) => {
  return await Order.aggregate(
    doctorPerformanceSummeryDeptWisePipeline(params)
  );
};
const fetchTestWIseDoctorPerformance = async (params: {
  from: Date;
  to: Date;
  refBy: string;
}) => {
  return await Order.aggregate(
    doctorPerformanceSummeryTestWisePipeline(params)
  );
};

const clientWiseIncomeStatement = async (params: { from: Date; to: Date }) => {
  return await Order.aggregate(clientWiseIncomeStatementPipeline(params));
};

const refByWIseIncomeStatement = async (params: { from: Date; to: Date }) => {
  return await Order.aggregate(refByWiseIncomeStatementPipeline(params));
};

const getEmployeeLedger = async (params: { from: Date; to: Date }) => {
  const dewBillSummery = await Transation.aggregate(
    dewCollectionSummeryPipeline(params)
  );
  const newBillSummery = await Order.aggregate(newBillSummeryPipeline(params));
  const result = {
    dewBills: dewBillSummery,
    newBills: newBillSummery,
  };
  return result;
};

const fetchAllTest = async () => {
  return await Test.aggregate([
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'dd',
      },
    },
    {
      $unwind: '$dd',
    },
    {
      $addFields: {
        rg: {
          $cond: {
            if: { $eq: [{ $type: '$reportGroup' }, 'string'] },
            then: {
              $cond: {
                if: { $eq: [{ $strLenCP: '$reportGroup' }, 24] },
                then: { $toObjectId: '$reportGroup' },
                else: null,
              },
            },
            else: '$reportGroup',
          },
        },
      },
    },

    {
      $lookup: {
        from: 'reportgroups',
        localField: 'rg',
        foreignField: '_id',
        as: 'rgd',
      },
    },
    {
      $unwind: '$rgd',
    },
    {
      $group: {
        _id: {
          department: '$dd.label',
          departmentId: '$dd._id',
          reportGroup: '$rgd.label',
          reportGroupId: '$rgd._id',
        },
        tests: {
          $push: {
            label: '$label',
            price: '$price',
            testCode: '$testCode',
          },
        },
      },
    },
    {
      $sort: { '_id.department': -1 },
    },
  ]);
};
const feacthALlDoctor = async (params: { id: string }) => {
  const id = params?.id ?? null;
  const conditionBasedOnParams = id
    ? {
        $match: {
          'assignedME._id': { $eq: new Types.ObjectId(id) },
        },
      }
    : {
        $match: {
          assignedME: { $ne: null },
        },
      };

  return await Doctor.aggregate([
    {
      $lookup: {
        from: 'employeeregistrations',
        localField: 'assignedME',
        foreignField: '_id',
        as: 'assignedME',
      },
    },
    {
      $unwind: '$assignedME',
    },
    conditionBasedOnParams,

    {
      $project: {
        code: 1,
        name: 1,
        title: 1,
        phone: 1,
        address: 1,
        assignedME: 1,
      },
    },
  ]);
};

const marketingExecutivePerformance = async (params: {
  from: Date;
  to: Date;
  id: string;
}) => {
  return await Order.aggregate(
    employeePerfromanceSummeryPipeline({
      from: params.from,
      to: params.to,
      id: params.id,
    })
  );
};
export const FinancialReportService = {
  fetchOverAllComission,
  fetchDoctorPerformanceSummery,
  fetchTestWiseIncomeStatement,
  fetchDeptWiseIncomeStatement,
  fetchDeptWiseCollectionSummery,
  fetchDeptWIseDoctorPerformance,
  fetchTestWIseDoctorPerformance,
  clientWiseIncomeStatement,
  refByWIseIncomeStatement,
  getEmployeeLedger,
  fetchAllTest,
  feacthALlDoctor,
  marketingExecutivePerformance,
};
