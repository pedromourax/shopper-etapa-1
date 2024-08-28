import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UploadDto } from './dtos/upload.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Costumer } from './interfaces/costumer.interface';
import { v4 as uuidv4 } from 'uuid';
import { ConfirmDto } from './dtos/confirm.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Costumer') private readonly costumerModel: Model<Costumer>,
  ) {}

  async upload(uploadBody: UploadDto): Promise<any> {
    try {
      const genIA = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = genIA.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model
        .generateContent([
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: uploadBody.image,
            },
          },
          {
            text: 'retorne apenas números de quanto marca esse hidrômetro ou gasômetro',
          },
        ])
        .then((res) => {
          console.log(res.response);
          return res.response.text();
        })
        .catch((e) => {
          console.log(e.message);
          throw new BadRequestException(
            'Os dados fornecidos no corpo da requisição são inválidos',
          );
        });

      const test = result.match(/\d/g).join('');
      console.log(result, test);
      const measure_value = parseInt(test.trim());
      if (Number.isNaN(test)) {
        throw new BadRequestException(
          'Não foi possivel detectar conteúdo do hidrômetro ou gasômetro',
        );
      }

      const measure_uuid = uuidv4();

      const measure = {
        measure_uuid,
        measure_datetime: uploadBody.measure_datetime,
        measure_type: uploadBody.measure_type,
        has_confirmed: false,
        measure_value,
        image_url: uploadBody.image,
      };

      const costumerAlredyExists = await this.costumerModel.findOne({
        costumer_code: uploadBody.costumer_code,
      });
      if (!costumerAlredyExists) {
        const newCostumer = {
          costumer_code: uploadBody.costumer_code,
          measures: [measure],
        };
        await this.costumerModel.create(newCostumer);
      }

      const data = new Date(uploadBody.measure_datetime);
      data.setMonth(data.getMonth() - 1);

      const valorJaConsultado = await this.costumerModel.findOne({
        costumer_code: uploadBody.costumer_code,
        measures: { $elemMatch: { measure_datetime: { $gt: data } } },
      });
      if (valorJaConsultado) {
        throw new ConflictException('Mês já consultado');
      }

      await costumerAlredyExists.updateOne({ $push: { measures: measure } });

      return {
        measure_value,
        measure_uuid,
        image_url: uploadBody.image,
      };
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      else if (error instanceof ConflictException)
        throw new ConflictException(error.message);
    }
  }

  async confirm(confirmBody: ConfirmDto): Promise<any> {
    try {
      const measure = await this.costumerModel.findOne({
        measures: { $elemMatch: { measure_uuid: confirmBody.measure_uuid } },
      });

      if (!measure) throw new NotFoundException('Leitura não encontrada');

      if (measure.measures[0].has_confirmed) {
        throw new ConflictException('Leitura já confirmada ');
      }

      await this.costumerModel.findOneAndUpdate(
        {
          measures: { $elemMatch: { measure_uuid: confirmBody.measure_uuid } },
        },
        { 'measures.confirmed_value': confirmBody.confirmed_value },
      );

      // await measure.updateOne({
      //   measures: { measure_value: confirmBody.confirmed_value },
      // });

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      else if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      else if (error instanceof ConflictException)
        throw new ConflictException(error.message);
    }
  }
}
