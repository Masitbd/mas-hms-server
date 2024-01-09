import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { SensitivityController } from './sensitivity.controllers';
import { sensitivityValidation } from './sentitivity.validators';
const router = express.Router();

// Routes for getting all the sensitivity
router.get('/', SensitivityController.FetchSensitivity);

// Route for creating new sensitivity
router.post(
  '/',
  validateRequest(sensitivityValidation.sensitivityValidator),
  SensitivityController.CreateSensitivity
);

// Routes for getting a single sensitivity
router.get('/:id', SensitivityController.FetchSingleSensitivity);
// Route for Editing existing sensitivity
router.patch(
  '/:id',
  validateRequest(sensitivityValidation.sensitivityValidatorForPatch),
  SensitivityController.EditSensitivity
);

// Routes for deleting a sensitivity
router.delete('/:id', SensitivityController.RemoveSensitivity);

export const SensitivityRoutes = { router };
