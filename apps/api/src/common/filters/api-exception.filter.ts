import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException, PayloadTooLargeException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ApiExceptionFilter');

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
      else if (status === 413) code = 40001;
    } else if (exception instanceof MulterError) {
      if (exception.code === 'LIMIT_FILE_SIZE') {
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        code = 40001;
        message = '文件大小不能超过 10MB';
      } else {
        status = HttpStatus.BAD_REQUEST;
        code = 40001;
        message = exception.message || '文件上传失败';
      }
    } else if (exception instanceof Error && exception.message.includes('仅支持')) {
      status = HttpStatus.BAD_REQUEST;
      code = 40001;
      message = exception.message;
    } else {
      this.logger.error(exception, exception instanceof Error ? exception.stack : undefined);
    }

    response.status(status).json({
      code,
      message: Array.isArray(message) ? message.join(', ') : message,
      data: null,
    });
  }
}
