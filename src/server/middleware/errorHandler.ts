import { BaseException } from '../../shared/exceptions/base';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (!(err instanceof BaseException)) {
    res.status(500).end();
  }

  const base = err as BaseException;

  if (process.env.NODE_ENV === 'development') {
    base.extensions = {
      ...(base.extensions || {}),
      stack: err.stack,
    };
  }

  return res.status(base.status).json(base.toJson());
};

export default errorHandler;
