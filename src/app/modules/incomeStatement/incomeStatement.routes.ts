import { Router } from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { incomeStatementControllers } from './incomeStatement.controller';

const router = Router();

// get employee income summer

router.get(
  '/',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  incomeStatementControllers.getEmployeeIncomeStatement
);
router.get(
  '/summery',
  auth(ENUM_USER_PEMISSION.GET_FINANCIAL_REPORT),
  incomeStatementControllers.getEmployeeIncomeStatementSummery
);

export const incomeStatementRoutes = { router };
