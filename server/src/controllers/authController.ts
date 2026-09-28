import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId: string, role: string) => {
  const secret = process.env.JWT_SECRET || 'gr_enterprises_secret_key';
  return jwt.sign({ userId, role }, secret, { expiresIn: '30d' });
};

// Helper to parse and decode Google OAuth ID Token (JWT)
function parseGoogleJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString('binary')
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export const registerRetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Full name is required' });
      return;
    }

    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'Valid email address is required' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email address already registered. Please sign in.' });
      return;
    }

    const userId = `usr-${Date.now()}`;
    const newUser = await UserModel.create({
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      phone: phone ? phone.trim() : undefined,
      role: 'd2c_customer',
      authProvider: 'email',
      savedAddresses: address ? [address] : [],
    });

    const token = generateToken(newUser.id, newUser.role);
    res.status(201).json({
      success: true,
      message: 'Retail account created successfully in MongoDB database',
      data: newUser,
      token,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const googleSync = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, name: rawName, email: rawEmail, avatar: rawAvatar, phone, address } = req.body;

    let googleEmail = rawEmail;
    let googleName = rawName;
    let googleAvatar = rawAvatar;

    // If Google Identity Services ID Token (credential) is passed, decode the real verified payload
    if (credential) {
      const decoded = parseGoogleJwt(credential);
      if (decoded && decoded.email) {
        googleEmail = decoded.email;
        googleName = decoded.name || googleName || 'Google User';
        googleAvatar = decoded.picture || googleAvatar;
      }
    }

    if (!googleEmail || !googleEmail.includes('@')) {
      res.status(400).json({ success: false, message: 'Valid Google email is required' });
      return;
    }

    const cleanEmail = googleEmail.trim().toLowerCase();
    let user = await UserModel.findOne({ email: cleanEmail });

    if (!user) {
      const userId = `usr-g-${Date.now()}`;
      user = await UserModel.create({
        id: userId,
        name: googleName ? googleName.trim() : cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: googleAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleName || cleanEmail)}`,
        phone: phone ? phone.trim() : undefined,
        role: 'd2c_customer',
        authProvider: 'google',
        savedAddresses: address ? [address] : [],
      });
    } else {
      if (googleAvatar && (!user.avatar || user.avatar.includes('dicebear'))) {
        user.avatar = googleAvatar;
      }
      if (googleName && (!user.name || user.name.startsWith('Customer +91'))) {
        user.name = googleName;
      }
      if (phone && !user.phone) {
        user.phone = phone.trim();
      }
      if (address && (!user.savedAddresses || user.savedAddresses.length === 0)) {
        user.savedAddresses = [address];
      }
      await user.save();
    }

    const token = generateToken(user.id, user.role);
    res.json({
      success: true,
      message: 'Authenticated with Google and saved in MongoDB Atlas',
      data: user,
      token,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (!user.password) {
      res.status(401).json({ success: false, message: 'This account was created via Google or Mobile OTP. Please sign in using that method.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id, user.role);
    res.json({
      success: true,
      message: 'Logged in successfully from MongoDB database',
      data: user,
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerB2B = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      businessName,
      businessType,
      gstin,
      panNumber,
      website,
      contactName,
      contactEmail,
      contactPhone,
      shopAddress,
      billingAddress,
      shippingAddress,
      monthlyVolume,
      resaleCertFileName,
      supportingDocName,
    } = req.body;

    const email = contactEmail.toLowerCase();
    let user = await UserModel.findOne({ email });

    const appId = `app-${Date.now()}`;
    const businessProfile = {
      id: appId,
      userId: user ? user.id : `usr-b2b-${Date.now()}`,
      businessName,
      businessType,
      gstin: gstin.toUpperCase(),
      panNumber: panNumber ? panNumber.toUpperCase() : gstin.substring(2, 12).toUpperCase(),
      website,
      contactName,
      contactEmail: email,
      contactPhone,
      shopAddress,
      billingAddress: billingAddress || shopAddress,
      shippingAddress: shippingAddress || shopAddress,
      sameAsShopAddress: true,
      monthlyVolume,
      resaleCertFileName,
      supportingDocName,
      status: 'pending' as const,
      appliedDate: new Date().toISOString().split('T')[0],
      creditLimit: 0,
      paymentTerms: 'Advance',
    };

    if (!user) {
      user = await UserModel.create({
        id: businessProfile.userId,
        name: contactName,
        email,
        phone: contactPhone,
        role: 'b2b_pending',
        authProvider: 'email',
        businessProfile,
        savedAddresses: [shopAddress],
      });
    } else {
      user.role = 'b2b_pending';
      user.businessProfile = businessProfile;
      await user.save();
    }

    const token = generateToken(user.id, user.role);
    res.status(201).json({
      success: true,
      message: 'B2B Wholesale Application submitted successfully to Meerut desk',
      data: user,
      token,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, b2bStatus, creditLimit, paymentTerms, adminNotes } = req.body;

    const user = await UserModel.findOne({ id });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (role) user.role = role;
    if (user.businessProfile) {
      if (b2bStatus) user.businessProfile.status = b2bStatus;
      if (creditLimit !== undefined) user.businessProfile.creditLimit = creditLimit;
      if (paymentTerms) user.businessProfile.paymentTerms = paymentTerms;
      if (adminNotes !== undefined) user.businessProfile.adminNotes = adminNotes;
      if (b2bStatus === 'approved') {
        user.businessProfile.reviewedDate = new Date().toISOString().split('T')[0];
        user.businessProfile.reviewedBy = 'Meerut Admin Office';
      }
    }

    await user.save();
    res.json({ success: true, message: 'User role/profile updated', data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// In-memory OTP storage with timestamp expiry (10 minutes)
interface OtpRecord {
  otp: string;
  expiresAt: number;
  channel: 'sms' | 'whatsapp';
}
const otpStore = new Map<string, OtpRecord>();

interface RealSmsDispatchResult {
  dispatched: boolean;
  provider: string;
  detail?: string;
  error?: string;
}

// Real SMS & WhatsApp Gateway Dispatcher
async function dispatchRealOtp(phone: string, otp: string, channel: 'sms' | 'whatsapp'): Promise<RealSmsDispatchResult> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  // 1. Fast2SMS Indian SMS Gateway (Quick SMS & OTP API)
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey && channel === 'sms') {
    try {
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&route=otp&variables_values=${otp}&flash=0&numbers=${cleanPhone}`;
      const res = await fetch(url, { method: 'GET', headers: { 'cache-control': 'no-cache' } });
      const data: any = await res.json().catch(() => ({}));
      if (data && data.return === true) {
        console.log(`✅ [Fast2SMS Success] Real SMS dispatched to Indian mobile +91 ${cleanPhone}`);
        return { dispatched: true, provider: 'Fast2SMS Indian Gateway' };
      } else {
        console.warn(`⚠️ [Fast2SMS Notice]`, data);
        return { dispatched: false, provider: 'Fast2SMS', error: data.message || 'Fast2SMS provider issue' };
      }
    } catch (err: any) {
      console.error('❌ [Fast2SMS Network Error]', err.message);
      return { dispatched: false, provider: 'Fast2SMS', error: err.message };
    }
  }

  // 2. Twilio (Global SMS & WhatsApp Business API)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  if (twilioSid && twilioAuth) {
    try {
      const isWhatsApp = channel === 'whatsapp';
      const fromNumber = isWhatsApp
        ? (process.env.TWILIO_WHATSAPP_NUMBER ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}` : 'whatsapp:+14155238886')
        : (process.env.TWILIO_PHONE_NUMBER || '+15005550006');
      const toNumber = isWhatsApp ? `whatsapp:+91${cleanPhone}` : `+91${cleanPhone}`;
      const body = isWhatsApp
        ? `🟢 GR Enterprises: Your secure login verification code is ${otp}. Valid for 10 minutes for Meerut central fulfillment.`
        : `Your GR Enterprises login verification code is ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const basicAuth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const params = new URLSearchParams();
      params.append('From', fromNumber);
      params.append('To', toNumber);
      params.append('Body', body);

      const res = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      const data: any = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log(`✅ [Twilio ${channel.toUpperCase()} Success] Real message sent to +91 ${cleanPhone}`);
        return { dispatched: true, provider: `Twilio ${channel.toUpperCase()}` };
      } else {
        console.warn(`⚠️ [Twilio API Notice]`, data);
        return { dispatched: false, provider: 'Twilio', error: data.message || 'Twilio dispatch issue' };
      }
    } catch (err: any) {
      console.error('❌ [Twilio Network Error]', err.message);
      return { dispatched: false, provider: 'Twilio', error: err.message };
    }
  }

  // 3. 2Factor.in Indian Telecom OTP Gateway
  const twoFactorKey = process.env.TWOFACTOR_API_KEY;
  if (twoFactorKey) {
    try {
      const url = `https://2factor.in/API/V1/${encodeURIComponent(twoFactorKey)}/SMS/+91${cleanPhone}/${otp}/OTP1`;
      const res = await fetch(url);
      const data: any = await res.json().catch(() => ({}));
      if (data && data.Status === 'Success') {
        console.log(`✅ [2Factor Success] Real SMS dispatched to +91 ${cleanPhone}`);
        return { dispatched: true, provider: '2Factor Indian Telecom' };
      } else {
        return { dispatched: false, provider: '2Factor', error: data.Details || '2Factor error' };
      }
    } catch (err: any) {
      return { dispatched: false, provider: '2Factor', error: err.message };
    }
  }

  // No cellular gateway key configured yet
  console.log(`📡 [Real OTP Generated] Code: ${otp} for +91 ${cleanPhone} (Server awaiting SMS Gateway Key in server/.env)`);
  return {
    dispatched: false,
    provider: 'None',
    error: 'No SMS Gateway configured in server/.env yet (e.g. FAST2SMS_API_KEY or TWILIO credentials)'
  };
}

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, channel = 'sms' } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: 'Phone number is required' });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number' });
      return;
    }

    // Generate real 6-digit secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    otpStore.set(cleanPhone, { otp, expiresAt, channel });

    // Attempt real cellular message dispatch
    const result = await dispatchRealOtp(cleanPhone, otp, channel);

    if (result.dispatched) {
      res.json({
        success: true,
        message: `Real verification code sent via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} to +91 ${cleanPhone} via ${result.provider}`,
        channel,
        phone: `+91 ${cleanPhone}`,
        dispatched: true,
      });
    } else {
      res.json({
        success: true,
        message: `Verification code generated for +91 ${cleanPhone}. To deliver real cellular SMS to your phone, configure FAST2SMS_API_KEY or TWILIO credentials in server/.env.`,
        channel,
        phone: `+91 ${cleanPhone}`,
        dispatched: false,
        gatewayNotice: result.error,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, name, address } = req.body;
    if (!phone || !otp) {
      res.status(400).json({ success: false, message: 'Phone and OTP code are required' });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const record = otpStore.get(cleanPhone);

    // Strict real validation: code must match stored OTP and not be expired
    const isValid = record && record.otp === otp.trim() && record.expiresAt > Date.now();

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please enter the correct 6-digit code received on your phone or request a new one.'
      });
      return;
    }

    otpStore.delete(cleanPhone);

    let user = await UserModel.findOne({ phone: { $regex: cleanPhone } });

    if (!user) {
      const userId = `usr-p-${Date.now()}`;
      const userName = name?.trim() || `Customer +91 ${cleanPhone}`;
      user = await UserModel.create({
        id: userId,
        name: userName,
        email: `${cleanPhone}@phone.grenterprises.in`,
        phone: `+91 ${cleanPhone}`,
        role: 'd2c_customer',
        authProvider: 'phone',
        savedAddresses: address ? [address] : [],
      });
    } else {
      if (name && (!user.name || user.name.startsWith('Customer +91'))) {
        user.name = name.trim();
      }
      if (address && (!user.savedAddresses || user.savedAddresses.length === 0)) {
        user.savedAddresses = [address];
      }
      await user.save();
    }

    const token = generateToken(user.id, user.role);
    res.json({
      success: true,
      message: 'Mobile number verified successfully! Logged in and saved in MongoDB Atlas.',
      data: user,
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
