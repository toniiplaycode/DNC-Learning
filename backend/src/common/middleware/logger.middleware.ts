import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    console.log(`[${method}] ${originalUrl} - ${ip} - ${userAgent}`);

    // Ghi thời gian bắt đầu request
    const start = Date.now();

    // Khi response hoàn thành
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[${method}] ${originalUrl} - ${res.statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
