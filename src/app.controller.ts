import {
  Body,
  Controller,
  Patch,
  Post,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UploadDto } from './dtos/upload.dto';
import { UploadExceptionFilter } from './common/filters/upload-exception.filter';
import { ConfirmDto } from './dtos/confirm.dto';
import { ConfirmExceptionFilter } from './common/filters/confirm-exception.filter';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseFilters(UploadExceptionFilter)
  @UsePipes(ValidationPipe)
  async Upload(@Body() uploadBody: UploadDto) {
    return this.appService.upload(uploadBody);
  }

  @Patch('confirm')
  @UseFilters(ConfirmExceptionFilter)
  @UsePipes(ValidationPipe)
  async confirm(@Body() confirmBody: ConfirmDto) {
    return this.appService.confirm(confirmBody);
  }
}
