import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  phone: string;
  otp: string;
  channel: 'sms' | 'whatsapp';
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    phone: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    channel: { type: String, enum: ['sms', 'whatsapp'], default: 'sms' },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: true,
  }
);

export const OtpModel = mongoose.model<IOtp>('Otp', OtpSchema);
