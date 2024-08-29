import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { enviroment } from './enviroment';
import { customerSchema } from './interfaces/customer.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(enviroment.mongodb_uri),
    MongooseModule.forFeature([{ name: 'customer', schema: customerSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
