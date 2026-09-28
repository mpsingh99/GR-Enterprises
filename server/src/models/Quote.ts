import mongoose, { Schema, Document } from 'mongoose';

export interface IQuote extends Document {
  id: string;
  quoteNumber: string;
  date: string;
  businessId: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  productId: string;
  productTitle: string;
  sku: string;
  requestedQuantity: number;
  targetPricePerUnit?: number;
  offeredPricePerUnit?: number;
  status: 'Submitted' | 'Under Review' | 'Quoted' | 'Accepted' | 'Declined';
  notes: string;
  adminResponseNote?: string;
  validUntil?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    id: { type: String, required: true, unique: true },
    quoteNumber: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    businessId: { type: String, required: true },
    businessName: { type: String, required: true },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    productId: { type: String, required: true },
    productTitle: { type: String, required: true },
    sku: { type: String, required: true },
    requestedQuantity: { type: Number, required: true },
    targetPricePerUnit: { type: Number },
    offeredPricePerUnit: { type: Number },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Quoted', 'Accepted', 'Declined'],
      default: 'Submitted',
    },
    notes: { type: String, default: '' },
    adminResponseNote: { type: String },
    validUntil: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const QuoteModel = mongoose.model<IQuote>('Quote', QuoteSchema);
