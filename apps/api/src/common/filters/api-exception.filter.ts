import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 50001;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message = typeof exResponse === 'string' ? exResponse : (exResponse as { message?: string }).message || message;

      if (status === 400) code = 40001;
      else if (status === 401) code = 40101;
      else if (status === 403) code = 40301;
      else if (status === 404) code = 40002;
      else if (status === 409) code = 40901;
    }

    response.status(status).json({
      code,
      message: Array.isArray(message) ? message.join(', ') : message,
      data: null,
    });
  }
}
