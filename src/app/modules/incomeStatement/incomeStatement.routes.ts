import { Router } from 'express';
import { incomeStatementControllers } from './incomeStatement.controller';

const router = Router();

// get employee income summer

router.get('/', incomeStatementControllers.getEmployeeIncomeStatement);
router.get(
  '/summery',
  incomeStatementControllers.getEmployeeIncomeStatementSummery
);
router.get(
  '/last-paid',
  incomeStatementControllers.getLastTwentyEightDaysPaidAmount
);

export const incomeStatementRoutes = { router };
