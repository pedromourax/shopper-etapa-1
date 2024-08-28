import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UploadDto } from './dtos/upload.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Costumer } from './interfaces/costumer.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Costumer') private readonly costumerModel: Model<Costumer>,
  ) {}

  getHello(): string {
    const envtest = process.env.GEMINI_API_KEY;
    console.log('env test', envtest);
    return envtest;
  }

  async upload(uploadBody: UploadDto): Promise<any> {
    const genIA = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genIA.getGenerativeModel({ model: 'gemini-1.5-pro' });

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
      .then((res) => res.response.text())
      .catch((e) => {
        console.log(e);
        throw new BadRequestException(
          'Os dados fornecidos no corpo da requisição são inválidos',
        );
      });

    if (Number.isNaN(Number(result))) {
      throw new BadRequestException(
        'Não foi possivel detectar conteúdo do hidrômetro ou gasômetro',
      );
    }

    const measure_uuid = uuidv4();

    const costumerAlredyExists = await this.costumerModel.findOne({
      costumer_code: uploadBody.costumer_code,
    });
    if (!costumerAlredyExists) {
      const newCostumer = {
        costumer_code: uploadBody.costumer_code,
        measures: [
          {
            measure_uuid,
            measure_datetime: Date.now(),
            measure_type: uploadBody.measure_type,
            has_confirmed: false,
            image_url: uploadBody.image,
          },
        ],
      };
      await this.costumerModel.create(newCostumer);
    }

    //----- Verificar se já existe uma leitura no mês naquele tipo de leitura.---------
    const data = new Date(uploadBody.measure_datetime);
    data.setMonth(data.getMonth() + 1);
    const valorJaConsultado = await this.costumerModel.find({
      // measures: { $elemMatch: { measure_datetime: { $lt: data } } },
      'measures.measure_datetime': { $lt: data },
    });
    console.log(valorJaConsultado, data);
    // ----------------------------------------------------------------------------------

    return {
      measure_value: result,
      measure_uuid,
      image_url: uploadBody.image,
    };
  }
}
