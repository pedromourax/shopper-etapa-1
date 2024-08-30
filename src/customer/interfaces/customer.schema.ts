import { Schema } from 'mongoose';

export const customerSchema = new Schema({
  customer_code: String,
  measures: [
    {
      measure_uuid: String,
      measure_datetime: Date,
      measure_type: String,
      measure_value: String,
      has_confirmed: Boolean,
      image_url: String,
    },
  ],
});
