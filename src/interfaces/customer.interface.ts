import { Document } from 'mongoose';
import { Measure } from './measure.interface';

export interface customer extends Document {
  readonly _id: string;
  customer_code: string;
  measures: Measure[];
}
