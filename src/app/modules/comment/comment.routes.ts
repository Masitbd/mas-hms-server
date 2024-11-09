import express from 'express';
import { ENUM_USER_PEMISSION } from '../../../enums/userPermissions';
import auth from '../../middlewares/auth';
import { CommentController } from './comment.controller';
const routes = express.Router();
routes.post(
  '/',
  auth(ENUM_USER_PEMISSION.MANAGE_COMMENT),
  CommentController.create
);
routes.patch(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_COMMENT),
  CommentController.update
);
routes.delete(
  '/:id',
  auth(ENUM_USER_PEMISSION.MANAGE_COMMENT),
  CommentController.Remove
);
routes.get(
  '/',
  auth(
    ENUM_USER_PEMISSION.GET_COMMENT,
    ENUM_USER_PEMISSION.MANAGE_COMMENT,
    ENUM_USER_PEMISSION.MANAGE_LAB_REPORTS,
    ENUM_USER_PEMISSION.GET_LAB_REPORTS
  ),
  CommentController.getAll
);
routes.get(
  '/:id',
  auth(
    ENUM_USER_PEMISSION.GET_COMMENT,
    ENUM_USER_PEMISSION.MANAGE_COMMENT,
    ENUM_USER_PEMISSION.MANAGE_LAB_REPORTS,
    ENUM_USER_PEMISSION.GET_LAB_REPORTS
  ),
  CommentController.getsingle
);

export const CommentRoutes = { routes };
