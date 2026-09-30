import mongoose, { Schema } from 'mongoose';
const PriceTierSchema = new Schema({
    minQuantity: { type: Number, required: true },
    maxQuantity: { type: Number },
    pricePerUnit: { type: Number, required: true },
    savingsPercentage: { type: Number, required: true, default: 0 },
}, { _id: false });
const ProductVariantSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    additionalPrice: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
}, { _id: false });
const ProductSchema = new Schema({
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
ProductSchema.index({ title: 'text', description: 'text', sku: 'text' });
export const ProductModel = mongoose.model('Product', ProductSchema);
