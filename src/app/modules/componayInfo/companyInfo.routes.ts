import { Router } from 'express';
import { CompanyInfoControllers } from './companyInfo.controller';

const routes = Router();

//  create
routes.get('/couldianry-sercet', CompanyInfoControllers.getCloudinarySecret);
routes.get('/creatable', CompanyInfoControllers.getCreatable);
routes.get('/default', CompanyInfoControllers.getDefaultCompanyInfo);
routes.post('/', CompanyInfoControllers.createCompanyInfo);

// get
routes.get('/', CompanyInfoControllers.getCompanyInfo);
routes.patch('/:id', CompanyInfoControllers.updateCompanyInfo);
routes.get('/:id', CompanyInfoControllers.getSingleCompanyInfo);
routes.delete('/:id', CompanyInfoControllers.deleteCompanyInfo);

// export

export const CompanyInfoRoutes = { routes };
