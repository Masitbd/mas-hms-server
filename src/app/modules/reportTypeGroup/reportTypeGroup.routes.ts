import express from 'express';
import { ReportTypeGroupController } from './reportTypeGroup.controller';
const routes = express.Router();
routes.post('/', ReportTypeGroupController.createNew);
routes.patch('/:id', ReportTypeGroupController.update);
routes.get('/:id', ReportTypeGroupController.getSingle);
routes.get('/', ReportTypeGroupController.getAll);

export const ReportTypeGroupRoutes = { routes };
