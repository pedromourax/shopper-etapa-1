import { Schema } from 'mongoose';

export const CostumerSchema = new Schema({
  costumer_code: String,
  measures: [
    {
      measure_uuid: String,
      measure_datetime: Date,
      measure_type: String,
      has_confirmed: Boolean,
      image_url: String,
    },
  ],
});
