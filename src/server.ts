import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
let server: Server;
async function bootstrap() {
  try {
    await mongoose.connect(config.database_url as string);
    // logger.info(`Database is connected successfully`);
    console.log(`Database is connected successfully`);

    server = app.listen(config.port, () => {

      // logger.info(`Server running on port ${config.port}`);
      console.log(`Server running on port ${config.port}`);

    });
  } catch (err) {
    // errorlogger.error('Failed to connect database', err);
    console.log('Failed to connect database', err);
  }

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        // logger.info('Server closed');
        console.log('Server closed');
      });
    }
    process.exit(1);
  };

  const unexpectedErrorHandler = (error: unknown) => {
    // errorlogger.error(error);
    console.log(error);
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    // logger.info('SIGTERM received');
    console.log('SIGTERM received');
    if (server) {
      server.close();
    }
  });
}

bootstrap();
