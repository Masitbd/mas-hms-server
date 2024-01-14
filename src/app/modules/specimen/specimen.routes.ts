import express from 'express';
import { SpecimenController } from './specimen.controllers';
import validateRequest from '../../middlewares/validateRequest';
import { SpecimenValidation } from './specimen.validation';


const routes = express.Router();

routes.get('/', SpecimenController.getAllSpecimen);

routes.post(
  '/',
  validateRequest(SpecimenValidation.SpecimenValidator),
  SpecimenController.createSpecimen
);

routes.get('/:id', SpecimenController.getSingleSpecimen);

routes.patch(
  '/:id',
  validateRequest(SpecimenValidation.SpecimenValidatorForUpdate),
  SpecimenController.updateSpecimen
);

routes.delete('/:id', SpecimenController.deleteSpecimen);

export const SpecimenRoutes = { routes };
