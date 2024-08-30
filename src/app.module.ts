import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CustomerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
