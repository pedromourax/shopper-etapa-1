import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UploadDto } from './dtos/upload.dto';
import { UploadExceptionFilter } from './common/filters/upload-exception.filter';
import { ConfirmDto } from './dtos/confirm.dto';
import { ConfirmExceptionFilter } from './common/filters/confirm-exception.filter';
import { ListExceptionFilter } from './common/filters/list-exception.filter';

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

  @Get(':customer_code/list')
  @UseFilters(ListExceptionFilter)
  async list(
    @Param('customer_code') customer_code: string,
    @Query() query: { measure_type: string },
  ) {
    console.log(query);
    if (Object.keys(query).length === 0) {
      console.log('list');
      return this.appService.list(customer_code);
    }
    console.log('listQuery');

    return this.appService.listQuery(customer_code, query.measure_type);
  }
}
