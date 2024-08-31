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
import { UploadExceptionFilter } from 'src/common/filters/upload-exception.filter';
import { UploadDto } from 'src/customer/dtos/upload.dto';
import { CustomerService } from './customer.service';
import { ConfirmExceptionFilter } from 'src/common/filters/confirm-exception.filter';
import { ConfirmDto } from 'src/customer/dtos/confirm.dto';
import { ListExceptionFilter } from 'src/common/filters/list-exception.filter';

@Controller('')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('upload')
  @UseFilters(UploadExceptionFilter)
  @UsePipes(ValidationPipe)
  async Upload(@Body() uploadBody: UploadDto) {
    return this.customerService.upload(uploadBody);
  }

  @Patch('confirm')
  @UseFilters(ConfirmExceptionFilter)
  @UsePipes(ValidationPipe)
  async confirm(@Body() confirmBody: ConfirmDto) {
    return this.customerService.confirm(confirmBody);
  }

  @Get(':customer_code/list')
  @UseFilters(ListExceptionFilter)
  async list(
    @Param('customer_code') customer_code: string,
    @Query() query: { measure_type: string },
  ) {
    if (Object.keys(query).length === 0) {
      return this.customerService.list(customer_code);
    }
    return this.customerService.listQuery(customer_code, query.measure_type);
  }
}
