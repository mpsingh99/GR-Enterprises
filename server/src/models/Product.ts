import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceTier {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  savingsPercentage: number;
}

export interface IProductVariant {
  id: string;
  name: string;
  sku: string;
  additionalPrice: number;
  stock: number;
}

export interface IProduct extends Document {
  id: string;
  sku: string;
  hsnCode: string;
  title: string;
  description: string;
  category: 'Electronics' | 'Office & Workspaces' | 'Packaging & Shipping' | 'Commercial Supplies';
  image: string;
  images: string[];
  retailPrice: number;
  mrp: number;
  wholesalePrice: number;
  priceTiers: IPriceTier[];
  moq: number;
  casePackSize: number;
  stock: number;
  unit: string;
  rating: number;
  reviewsCount: number;
  isRfqEligible: boolean;
  features: string[];
  specifications: Record<string, string>;
  variants: IProductVariant[];
  taxRatePercent: number;
  createdAt: Date;
  updatedAt: Date;
}

const PriceTierSchema = new Schema<IPriceTier>(
  {
    minQuantity: { type: Number, required: true },
    maxQuantity: { type: Number },
    pricePerUnit: { type: Number, required: true },
    savingsPercentage: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    additionalPrice: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    hsnCode: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Office & Workspaces', 'Packaging & Shipping', 'Commercial Supplies'],
    },
    image: { type: String, required: true },
    images: [{ type: String }],
    retailPrice: { type: Number, required: true },
    mrp: { type: Number, required: true },
    wholesalePrice: { type: Number, required: true },
    priceTiers: [PriceTierSchema],
    moq: { type: Number, required: true, default: 1 },
    casePackSize: { type: Number, required: true, default: 1 },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true, default: 'unit' },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    isRfqEligible: { type: Boolean, default: false },
    features: [{ type: String }],
    specifications: { type: Map, of: String },
    variants: [ProductVariantSchema],
    taxRatePercent: { type: Number, default: 18 },
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

ProductSchema.index({ title: 'text', description: 'text', sku: 'text' });

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
