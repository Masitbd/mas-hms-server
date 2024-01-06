import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import { errorlogger, logger } from './shared/logger';
let server: Server;
async function bootstrap() {
  try {
    console.log(config.database_url);
    await mongoose.connect(config.database_url as string);
    logger.info(`Database is connected successfully`);

    server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (err) {
    errorlogger.error('Failed to connect database', err);
  }

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        logger.info('Server closed');
      });
    }
    process.exit(1);
  };

  const unexpectedErrorHandler = (error: unknown) => {
    errorlogger.error(error);
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
      server.close();
    }
  });
}

bootstrap();
