import { PipelineStage } from 'mongoose';
import { Order } from '../order/order.model';
import {
  departmentWiseCollectionSummeryPipeline,
  departmentWiseIncomeStatement,
  doctorOverAllSummeryByRefByPipeline,
  doctorPerformanceSummeryDeptWisePipeline,
  doctorPerformanceSummeryPipeline,
  doctorPerformanceSummeryTestWisePipeline,
  pipelineForOverAllDoctor,
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
export const FinancialReportService = {
  fetchOverAllComission,
  fetchDoctorPerformanceSummery,
  fetchTestWiseIncomeStatement,
  fetchDeptWiseIncomeStatement,
  fetchDeptWiseCollectionSummery,
  fetchDeptWIseDoctorPerformance,
  fetchTestWIseDoctorPerformance,
};