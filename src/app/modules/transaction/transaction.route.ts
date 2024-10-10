import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TranasctionController } from './transaction.controller';
import { TransactionValidtion } from './transaction.validation';
const routes = express.Router();
routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.USER),
  validateRequest(TransactionValidtion.transactionValidator),
  TranasctionController.createNewTransaciton
);
routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  TranasctionController.getSingleTransaction
);
routes.get(
  '/uuid/:id',
  auth(ENUM_USER_PEMISSION.USER),
  TranasctionController.getTransactionByUuid
);

export const TransactionRoute = { routes };
