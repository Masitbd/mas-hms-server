import { Router } from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { CompanyInfoControllers } from './companyInfo.controller';

const routes = Router();

//  create
routes.get(
  '/couldianry-sercet',
  auth(ENUM_USER_PEMISSION.USER),
  CompanyInfoControllers.getCloudinarySecret
);
routes.get('/creatable', CompanyInfoControllers.getCreatable);
routes.get(
  '/default',
  auth(ENUM_USER_PEMISSION.USER),
  CompanyInfoControllers.getDefaultCompanyInfo
);
routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_COMPANY_INFO),
  CompanyInfoControllers.createCompanyInfo
);

// get
routes.get(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_COMPANY_INFO),
  CompanyInfoControllers.getCompanyInfo
);
routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_COMPANY_INFO),
  CompanyInfoControllers.updateCompanyInfo
);
routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  CompanyInfoControllers.getSingleCompanyInfo
);
routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_COMPANY_INFO),
  CompanyInfoControllers.deleteCompanyInfo
);

// export

export const CompanyInfoRoutes = { routes };
