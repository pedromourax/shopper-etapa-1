import {
  Body,
  Controller,
  Get,
  Post,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UploadDto } from './dtos/upload.dto';
import { UploadExceptionFilter } from './common/filters/upload-exception.filter';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
    // return this.appService.test(uploadBody);
  }

  @Post()
  @UseFilters(UploadExceptionFilter)
  @UsePipes(ValidationPipe)
  async Upload(@Body() uploadBody: UploadDto) {
    return this.appService.upload(uploadBody);
  }
}
