import mongoose, { Schema } from 'mongoose';
const StoreSettingsSchema = new Schema({
    companyName: { type: String, required: true, default: 'GR Enterprises' },
    legalEntityName: { type: String, required: true, default: 'GR Enterprises Private Limited' },
    tagline: {
        type: String,
        default: 'Leading D2C Retail & B2B Wholesale Supply Center • Meerut Hub',
    },
    gstin: { type: String, required: true, default: '09AABCG1234F1Z8' },
    panNumber: { type: String, required: true, default: 'AABCG1234F' },
    cin: { type: String, default: 'U72200UP2026PTC109922' },
    street: { type: String, default: 'GR Tower, Delhi Road, Near Transport Nagar' },
    city: { type: String, default: 'Meerut' },
    state: { type: String, default: 'Uttar Pradesh' },
    stateCode: { type: String, default: '09' },
    postalCode: { type: String, default: '250002' },
    country: { type: String, default: 'India' },
    email: { type: String, default: 'contact@grenterprises.in' },
    phone: { type: String, default: '+91 121 255 4321 / +91 98370 12345' },
    freeShippingThreshold: { type: Number, default: 1000 },
    defaultGstPercent: { type: Number, default: 18 },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
export const StoreSettingsModel = mongoose.model('StoreSettings', StoreSettingsSchema);
