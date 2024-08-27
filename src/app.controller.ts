import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UploadDto } from './dtos/upload.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
    // return this.appService.test(uploadBody);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async Upload(@Body() uploadBody: UploadDto) {
    return this.appService.upload(uploadBody);
  }
}
