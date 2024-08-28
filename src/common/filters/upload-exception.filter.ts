import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class UploadExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UploadExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseMessage =
      exception instanceof HttpException ? exception.getResponse() : exception;

    const { error, statusCode, message } = responseMessage;

    this.logger.error(
      `Error na rota: ${request.path} \n Status: ${status} \n Message: ${JSON.stringify(message)}`,
    );

    const erros = {
      400: 'INVALID_DATA',
      409: 'DOUBLE_REPORT',
    };

    response.status(status).json({
      error_code: erros[statusCode],
      error_description: message,
      // timestamp: new Date().toISOString(),
      // path: request.url,
      // message,
      // error,
      // statusCode,
    });
  }
}
