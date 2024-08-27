import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CostumerSchema } from './interfaces/costumer.schema';
import { enviroment } from './enviroment';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(enviroment.mongodb_uri),
    MongooseModule.forFeature([{ name: 'Costumer', schema: CostumerSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
