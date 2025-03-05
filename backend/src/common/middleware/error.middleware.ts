import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (error) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';

      if (error instanceof HttpException) {
        status = error.getStatus();
        message = error.message;
      }

      res.status(status).json({
        statusCode: status,
        message: message,
        timestamp: new Date().toISOString(),
        path: req.url,
      });
    }
  }
}
