export type CustomerMode = 'D2C' | 'B2B';

export type UserRole = 'guest' | 'd2c_customer' | 'b2b_pending' | 'b2b_needs_info' | 'b2b_approved' | 'admin';

export type BusinessType = 
  | 'Private Limited (Pvt Ltd)'
  | 'Sole Proprietorship'
  | 'Partnership Firm'
  | 'Limited Liability Partnership (LLP)'
  | 'Public Limited'
  | 'Trust / Society / NGO';

export type B2BStatus = 'pending' | 'approved' | 'needs_more_info' | 'rejected';

export interface Address {
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface StoreSettings {
  companyName: string;
  legalEntityName: string;
  tagline: string;
  gstin: string; // 09AABCG1234F1Z8 (Meerut, Uttar Pradesh)
  panNumber: string;
  cin: string;
  street: string;
  city: string;
  state: string;
  stateCode: string; // '09' for Uttar Pradesh
  postalCode: string;
  country: string;
  email: string;
  phone: string;
  freeShippingThreshold: number;
  defaultGstPercent: number;
}

export interface B2BApplicationDetails {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  gstin: string; // 15-character GSTIN
  panNumber: string;
  website?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  designation?: string;
  monthlyVolume?: string;
  shopAddress: Address;
  billingAddress: Address;
  shippingAddress: Address;
  sameAsShopAddress: boolean;
  resaleCertFileName?: string;
  supportingDocName?: string;
  status: B2BStatus;
  adminNotes?: string;
  appliedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  creditLimit?: number;
  paymentTerms?: string; // e.g., 'Net 30', 'Advance', 'Net 15'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  businessProfile?: B2BApplicationDetails;
  savedAddresses?: Address[];
  joinedDate?: string;
  authProvider?: 'google' | 'email' | 'guest' | 'phone';
}

export interface PriceTier {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  savingsPercentage: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  additionalPrice: number;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  hsnCode: string; // Harmonized System Nomenclature for tax invoices
  title: string;
  description: string;
  category: 'Electronics' | 'Office & Workspaces' | 'Packaging & Shipping' | 'Commercial Supplies';
  image: string;
  images: string[];
  retailPrice: number; // For D2C customers
  mrp: number; // Maximum Retail Price
  wholesalePrice: number; // Base wholesale price for Approved B2B
  priceTiers: PriceTier[]; // Volume discounts for Approved B2B
  moq: number; // Minimum Order Quantity for B2B
  casePackSize: number; // Sold in multiples of this number in B2B
  stock: number;
  unit: string; // e.g. 'unit', 'box', 'pack', 'kg'
  rating: number;
  reviewsCount: number;
  isRfqEligible: boolean; // Can customer request custom quote for huge volumes?
  features: string[];
  specifications: Record<string, string>;
  variants?: ProductVariant[];
  taxRatePercent: number; // e.g. 18% GST
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  mode: CustomerMode;
  selectedVariant?: ProductVariant;
  unitPrice: number; // Selected tier price if B2B, or retailPrice if D2C
  appliedDiscountPercent?: number;
}

export interface OrderItem {
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

export type OrderStatus = 'Processing' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  mode: CustomerMode;
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
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
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
  status: OrderStatus;
  paymentMethod: 'Credit/Debit Card' | 'UPI / NetBanking' | 'Cash on Delivery' | 'B2B Credit (Net 30)';
  paymentStatus: 'Paid' | 'Pending Invoice' | 'COD';
  trackingNumber?: string;
  invoiceNumber: string;
}

export type QuoteStatus = 'Submitted' | 'Under Review' | 'Quoted' | 'Accepted' | 'Declined';

export interface Quote {
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
  status: QuoteStatus;
  notes: string;
  adminResponseNote?: string;
  validUntil?: string;
}
