import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import routes from './app/routes';

import cookieParser from 'cookie-parser';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler';

const app: Application = express();
const corsOptions = {
  origin: 'https://mas-hms-frontend.vercel.app',
};
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);
app.get('/', async (req: Request, res: Response, next: NextFunction) => {
  res.send('Server is working');
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
  next();
});
app.use(globalErrorHandler);
export default app;
