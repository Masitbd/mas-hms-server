import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { FinancialReportController } from './financialReportController';

const routes = express.Router();
routes.get(
  '/commission/all',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.getOverAllComission
);
routes.get(
  '/commission/single/:id',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.getDoctorPerformanceSUmmery
);
routes.get(
  '/incomeStatement/testWise',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.getTestWiseIncomeStatement
);
routes.get(
  '/incomeStatement/clientWise',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.clientWiseIncomeStatement
);

routes.get(
  '/incomeStatement/refByWise',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.refByWiseIncomeStatement
);
routes.get(
  '/incomeStatement/deptWise',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.getDeptWiseIncomeStatement
);

routes.get(
  '/collectionStatement/deptWise',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.getDeptWIseCollectionSummery
);

routes.get(
  '/doctorsPerformance/deptWise/:id',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.getDeptWiseDoctorPerformance
);
routes.get(
  '/doctorsPerformance/testWise/:id',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.getTestWiseDoctorPerformance
);
routes.get(
  '/employeeLedger',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.getEmployeeLedger
);

routes.get(
  '/tests',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.getAllTests
);
routes.get(
  '/doctors',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.getAllDoctors
);
routes.get(
  '/marketing-executive-performance',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  FinancialReportController.marketingExecutivePerformance
);

export const FinancialReportRoutes = { routes };
