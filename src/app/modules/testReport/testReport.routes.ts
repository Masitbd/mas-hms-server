import express from 'express';
import { TestReportController } from './testReport.controller';
const routes = express.Router();

routes.post('/', TestReportController.createTestReport);
routes.get('/', TestReportController.getAllTestReport);
routes.get('/:id', TestReportController.getSingleTestReport);
routes.get('/print/:id', TestReportController.getSingleTestReportPrint);
routes.delete('/:id', TestReportController.deleteTestReport);

export const TestReportRoutes = { routes };
