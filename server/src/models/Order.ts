import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './User.js';

export interface IOrderItem {
  productId: string;
  productTitle: string;
  sku: string;
  hsnCode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
  variantName?: string;
}

export interface IOrder extends Document {
  id: string;
  orderNumber: string;
  date: string;
  mode: 'D2C' | 'B2B';
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isGuest?: boolean;
  businessDetails?: {
    businessName: string;
    gstin: string;
    businessType: string;
    panNumber?: string;
  };
  shippingAddress: IAddress;
  billingAddress: IAddress;
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  shippingFee: number;
  taxAmount: number;
  taxBreakdown?: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  totalAmount: number;
  status: 'Processing' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Credit/Debit Card' | 'UPI / NetBanking' | 'Cash on Delivery' | 'B2B Credit (Net 30)';
  paymentStatus: 'Paid' | 'Pending Invoice' | 'COD';
  trackingNumber?: string;
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
  },
  { _id: false }
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    productTitle: { type: String, required: true },
    sku: { type: String, required: true },
    hsnCode: { type: String, required: true },
    unit: { type: String, required: true, default: 'unit' },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    taxAmount: { type: Number, required: true, default: 0 },
    variantName: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true },
    orderNumber: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    mode: { type: String, enum: ['D2C', 'B2B'], required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    isGuest: { type: Boolean, default: false },
    businessDetails: {
      businessName: { type: String },
      gstin: { type: String },
      businessType: { type: String },
      panNumber: { type: String },
    },
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    promoCode: { type: String },
    shippingFee: { type: Number, default: 0 },
    taxAmount: { type: Number, required: true },
    taxBreakdown: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Processing', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    paymentMethod: {
      type: String,
      enum: ['Credit/Debit Card', 'UPI / NetBanking', 'Cash on Delivery', 'B2B Credit (Net 30)'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending Invoice', 'COD'],
      default: 'Paid',
    },
    trackingNumber: { type: String },
    invoiceNumber: { type: String, required: true, unique: true },
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

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
