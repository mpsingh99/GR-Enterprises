import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const AddressSchema = new Schema({
    street: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
}, { _id: false });
const B2BProfileSchema = new Schema({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    businessName: { type: String, required: true },
    businessType: { type: String, required: true },
    gstin: { type: String, required: true, uppercase: true },
    panNumber: { type: String, required: true, uppercase: true },
    website: { type: String },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    designation: { type: String },
    monthlyVolume: { type: String },
    shopAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema, required: true },
    shippingAddress: { type: AddressSchema, required: true },
    sameAsShopAddress: { type: Boolean, default: true },
    resaleCertFileName: { type: String },
    supportingDocName: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'needs_more_info', 'rejected'],
        default: 'pending',
    },
    adminNotes: { type: String },
    appliedDate: { type: String, required: true },
    reviewedDate: { type: String },
    reviewedBy: { type: String },
    creditLimit: { type: Number, default: 0 },
    paymentTerms: { type: String, default: 'Advance' },
}, { _id: false });
const UserSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    phone: { type: String },
    role: {
        type: String,
        required: true,
        enum: ['guest', 'd2c_customer', 'b2b_pending', 'b2b_needs_info', 'b2b_approved', 'admin'],
        default: 'd2c_customer',
    },
    avatar: { type: String },
    age: { type: Number },
    gender: { type: String },
    businessProfile: { type: B2BProfileSchema },
    savedAddresses: [AddressSchema],
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    authProvider: { type: String, enum: ['google', 'email', 'guest', 'phone'], default: 'email' },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            delete ret._id;
            delete ret.__v;
            delete ret.password;
            return ret;
        },
    },
});
UserSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.comparePassword = async function (candidate) {
    if (!this.password)
        return false;
    return bcrypt.compare(candidate, this.password);
};
export const UserModel = mongoose.model('User', UserSchema);
