import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UploadDto } from './dtos/upload.dto';

@Injectable()
export class AppService {
  getHello(): string {
    const envtest = process.env.GEMINI_API_KEY;
    console.log('env test', envtest);
    return envtest;
  }

  async upload(uploadBody: UploadDto): Promise<any> {
    const genIA = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genIA.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: uploadBody.image,
        },
      },
      {
        text: 'retorne apenas números de quanto marca esse hodômetro',
      },
    ]);
    return result.response.text();
  }
}
