import { Equals, IsBase64, IsDateString, IsNotEmpty } from 'class-validator';

export class UploadDto {
  @IsBase64()
  image: string;

  @IsNotEmpty()
  costumer_code: string;

  @IsNotEmpty()
  @IsDateString()
  measure_datetime: Date;

  @IsNotEmpty()
  @Equals('WATER' || 'GAS', {
    message: 'measure_type must be equal to WATER or GAS',
  })
  measure_type: 'WATER' | 'GAS';
}
