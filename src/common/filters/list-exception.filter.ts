import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class ListExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ListExceptionFilter.name);

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

    const { statusCode, message } = responseMessage;

    this.logger.error(
      `Erro na rota: ${request.path} \n Status: ${status} \n Message: ${JSON.stringify(message)}`,
    );

    const erros = {
      400: 'INVALID_TYPE',
      404: 'MEASURES_NOT_FOUND',
    };

    const msg = Array.isArray(message) ? message.join(', ') : message;

    response.status(status).json({
      error_code: erros[statusCode],
      error_description: msg,
    });
  }
}
