import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { enviroment } from 'src/enviroment';
import { customerSchema } from 'src/customer/interfaces/customer.schema';

@Module({
  imports: [
    MongooseModule.forRoot(enviroment.mongodb_uri),
    MongooseModule.forFeature([{ name: 'customer', schema: customerSchema }]),
  ],
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
