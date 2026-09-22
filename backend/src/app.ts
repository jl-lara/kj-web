import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes';
import { rateLimiter } from './middleware/rateLimiter';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());

  if (env.corsOrigin === '*') {
    app.use(cors({ credentials: true, origin: true }));
  } else {
    app.use(
      cors({
        origin: env.corsOrigin.split(',').map((origin) => origin.trim()),
        credentials: true,
      }),
    );
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  if (env.nodeEnv !== 'test') {
    app.use('/api', rateLimiter);
  }
  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
