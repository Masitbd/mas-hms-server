import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import routes from './app/routes';

import cookieParser from 'cookie-parser';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler';

const app: Application = express();
const corsOptions = {
  origin: 'http://localhost:3000',
};
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

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
