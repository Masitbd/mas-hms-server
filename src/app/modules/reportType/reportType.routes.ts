import express from 'express';
import { ReportTypeController } from './reportTypeController';
const routes = express.Router();
routes.post('/', ReportTypeController.postNewReportType);
routes.patch('/:id', ReportTypeController.updateReportType);
routes.get('/:id', ReportTypeController.getSingleReportType);
routes.get('/', ReportTypeController.getAllReportType);

export const reportTypeRoutes = { routes };
