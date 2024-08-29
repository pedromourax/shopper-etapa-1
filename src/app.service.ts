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
import { v4 as uuidv4 } from 'uuid';
import { ConfirmDto } from './dtos/confirm.dto';
import { customer } from './interfaces/customer.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('customer') private readonly customerModel: Model<customer>,
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

      const customerAlredyExists = await this.customerModel.findOne({
        customer_code: uploadBody.customer_code,
      });
      if (!customerAlredyExists) {
        const newcustomer = {
          customer_code: uploadBody.customer_code,
          measures: [measure],
        };
        await this.customerModel.create(newcustomer);
        return {
          measure_value,
          measure_uuid,
          image_url: uploadBody.image,
        };
      }

      const data = new Date(uploadBody.measure_datetime);
      data.setMonth(data.getMonth() - 1);

      const valorJaConsultado = await this.customerModel.findOne({
        customer_code: uploadBody.customer_code,
        measures: {
          $elemMatch: {
            measure_datetime: {
              $gt: data,
            },
            measure_type: uploadBody.measure_type,
          },
        },
      });
      if (valorJaConsultado) {
        throw new ConflictException('Mês já consultado');
      }

      await customerAlredyExists.updateOne({ $push: { measures: measure } });

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
      const measure = await this.customerModel.findOne({
        measures: { $elemMatch: { measure_uuid: confirmBody.measure_uuid } },
      });

      if (!measure) throw new NotFoundException('Leitura não encontrada');

      if (measure.measures[0].has_confirmed) {
        throw new ConflictException('Leitura já confirmada ');
      }

      await this.customerModel
        .findOneAndUpdate(
          { 'measures.measure_uuid': confirmBody.measure_uuid },
          {
            $set: {
              'measures.$[elem].measure_value': `${confirmBody.confirmed_value}`,
              'measures.$[elem].has_confirmed': true,
            },
          },
          {
            arrayFilters: [{ 'elem.measure_uuid': confirmBody.measure_uuid }],
          },
        )
        .exec();

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

  async listQuery(customer_code, measure_type) {
    try {
      if (measure_type !== 'WATER' && measure_type !== 'GAS')
        throw new BadRequestException('Tipo de medição não permitida');

      console.log('measure type', measure_type);
      // const customer = await this.customerModel
      //   .findOne({
      //     customer_code,
      //     measures: {
      //       $elemMatch: {
      //         measure_uuid: '3bafaaa8-a09d-47e8-9eed-e096e00d3046',
      //       },
      //     },
      //   })
      //   .select([
      //     '-_id',
      //     'customer_code',
      //     'measures.measure_uuid',
      //     'measures.measure_datetime',
      //     'measures.measure_type',
      //     'measures.has_confirmed',
      //     'measures.image_url',
      //   ])
      //   .exec();

      const customer = await this.customerModel
        .aggregate([
          {
            $match: {
              customer_code: customer_code, // Filtra o customer específico pelo ID
            },
          },
          {
            $project: {
              measures: {
                $filter: {
                  input: '$measures',
                  as: 'measure',
                  cond: { $eq: ['$$measure.measure_type', measure_type] }, // Filtra pela measure_uuid específica
                },
              },
            },
          },
        ])
        .exec();

      if (!customer) throw new NotFoundException('Nenhuma leitura encontrada');

      return customer;
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      else if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
    }
  }

  async list(customer_code) {
    try {
      const customer = await this.customerModel
        .findOne({ customer_code })
        .select([
          '-_id',
          'customer_code',
          'measures.measure_uuid',
          'measures.measure_datetime',
          'measures.measure_type',
          'measures.has_confirmed',
          'measures.image_url',
        ]);

      if (!customer) throw new NotFoundException('Nenhuma leitura encontrada');

      return customer;
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      else if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
    }
  }
}
