import { Document } from 'mongoose';
import { Measure } from './measure.interface';

export interface Costumer extends Document {
  readonly _id: string;
  costumer_code: string;
  measures: Measure[];
}
