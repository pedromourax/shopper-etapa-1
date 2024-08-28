import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class ConfirmDto {
  @IsUUID('4', { message: 'measure_uuid deve ser no formato UUID v4' })
  @IsNotEmpty({ message: 'measure_uuid é obrigatório' })
  measure_uuid: string;

  @IsNumber({}, { message: 'confirmed_value deve ser um número inteiro' })
  @IsNotEmpty({ message: 'confirmed_value é obrigatório' })
  confirmed_value: Number;
}
