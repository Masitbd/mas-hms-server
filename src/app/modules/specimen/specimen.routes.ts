import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SpecimenController } from './specimen.controllers';
import { SpecimenValidation } from './specimen.validators';

const routes = express.Router();

routes.get(
  '/',
  auth(ENUM_USER_PEMISSION.USER),
  SpecimenController.getAllSpecimen
);

routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.USER, ENUM_USER_PEMISSION.MANAGE_TESTS),
  validateRequest(SpecimenValidation.SpecimenValidator),
  SpecimenController.createSpecimen
);

routes.get(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER),
  SpecimenController.getSingleSpecimen
);

routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER, ENUM_USER_PEMISSION.MANAGE_TESTS),
  validateRequest(SpecimenValidation.SpecimenValidatorForUpdate),
  SpecimenController.updateSpecimen
);

routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.USER, ENUM_USER_PEMISSION.MANAGE_TESTS),
  SpecimenController.deleteSpecimen
);

export const SpecimenRoutes = { routes };
