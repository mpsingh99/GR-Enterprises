import mongoose, { Schema } from 'mongoose';
const OtpSchema = new Schema({
    phone: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    channel: { type: String, enum: ['sms', 'whatsapp'], default: 'sms' },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, {
    timestamps: true,
});
export const OtpModel = mongoose.model('Otp', OtpSchema);
