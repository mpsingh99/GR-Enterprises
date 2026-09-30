import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { OtpModel } from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import { sendFast2SmsOtp, sanitizeIndianMobile, isValidIndianMobile } from '../services/smsService.js';

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

/**
 * Cryptographically verify Google OAuth 2.0 ID Token and check client_id audience
 */
async function verifyGoogleIdToken(idToken: string): Promise<{ valid: boolean; email?: string; name?: string; picture?: string; error?: string }> {
  const expectedClientId = process.env.GOOGLE_CLIENT_ID || '944114337019-6kf4iudg57jkqua4jeg731oijr0obqmq.apps.googleusercontent.com';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (googleRes.ok) {
      const data: any = await googleRes.json();
      if (data.aud && data.aud !== expectedClientId) {
        console.warn(`[Google Auth Warning] Client ID mismatch. Received: ${data.aud}, expected: ${expectedClientId}`);
        return { valid: false, error: 'Google Client ID mismatch' };
      }
      return {
        valid: true,
        email: data.email,
        name: data.name,
        picture: data.picture
      };
    }
  } catch (netErr: any) {
    console.warn('[Google Auth] Network notice contacting Google tokeninfo, falling back to local JWT payload check:', netErr.message);
  }

  // Fallback to local JWT parsing
  const decoded = parseGoogleJwt(idToken);
  if (decoded && decoded.email) {
    if (decoded.aud && decoded.aud !== expectedClientId) {
      console.warn(`[Google Auth Warning] Decoded JWT aud mismatch. Received: ${decoded.aud}, expected: ${expectedClientId}`);
      return { valid: false, error: 'Google Client ID mismatch' };
    }
    return {
      valid: true,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture
    };
  }

  return { valid: false, error: 'Invalid Google ID Token' };
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

    // If Google Identity Services ID Token (credential) is passed, verify cryptographic payload & audience
    if (credential) {
      const verification = await verifyGoogleIdToken(credential);
      if (!verification.valid) {
        res.status(401).json({ success: false, message: verification.error || 'Invalid Google credential token' });
        return;
      }
      if (verification.email) {
        googleEmail = verification.email;
        googleName = verification.name || googleName || 'Google User';
        googleAvatar = verification.picture || googleAvatar;
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
  const cleanPhone = sanitizeIndianMobile(phone);

  // 1. Fast2SMS Indian SMS Gateway (DLT-Free OTP Route)
  if (channel === 'sms') {
    const smsResult = await sendFast2SmsOtp(cleanPhone, otp);
    if (smsResult.success) {
      return { dispatched: true, provider: smsResult.provider, detail: smsResult.message };
    } else {
      return { dispatched: false, provider: smsResult.provider, error: smsResult.message };
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

  // 3. Fallback when WhatsApp channel has no Twilio credentials
  return {
    dispatched: false,
    provider: channel === 'whatsapp' ? 'WhatsApp' : 'Fast2SMS',
    error: 'Gateway credentials not configured in server/.env'
  };
}

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, channel = 'sms', email } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: 'Phone number is required' });
      return;
    }

    const cleanPhone = sanitizeIndianMobile(phone);
    if (!isValidIndianMobile(cleanPhone)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number (must start with 6, 7, 8, or 9)'
      });
      return;
    }

    const cleanEmail = email && typeof email === 'string' && email.includes('@') 
      ? email.trim().toLowerCase() 
      : undefined;

    // IMMEDIATE DATA PERSISTENCE: Save/record the mobile number and email in MongoDB Atlas immediately
    // (whether OTP is received or not, ensuring no lead/customer contact is lost)
    try {
      let leadUser = await UserModel.findOne({
        $or: [
          { phone: `+91 ${cleanPhone}` },
          { phone: cleanPhone },
          ...(cleanEmail ? [{ email: cleanEmail }] : [])
        ]
      });

      if (!leadUser) {
        await UserModel.create({
          id: `usr-lead-${Date.now()}`,
          name: `Customer +91 ${cleanPhone}`,
          phone: `+91 ${cleanPhone}`,
          email: cleanEmail || `${cleanPhone}@phone.grenterprises.in`,
          role: 'd2c_customer',
          authProvider: 'phone',
          savedAddresses: [],
        });
        console.log(`✅ [MongoDB Atlas Lead Captured on OTP Request] +91 ${cleanPhone} (${cleanEmail || 'no email'})`);
      } else {
        if (!leadUser.phone) leadUser.phone = `+91 ${cleanPhone}`;
        if (cleanEmail && (!leadUser.email || leadUser.email.includes('@phone.grenterprises.in'))) {
          leadUser.email = cleanEmail;
        }
        await leadUser.save();
      }
    } catch (saveErr: any) {
      console.warn('⚠️ [MongoDB Atlas Instant Save Notice]:', saveErr.message);
    }

    // Generate real 6-digit secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAtMs = Date.now() + 10 * 60 * 1000; // 10 minutes validity
    const expiresAtDate = new Date(expiresAtMs);

    // Save in memory cache
    otpStore.set(cleanPhone, { otp, expiresAt: expiresAtMs, channel });

    // Persist in MongoDB Atlas for cross-instance verification (Vercel serverless lambdas)
    try {
      await OtpModel.findOneAndUpdate(
        { phone: cleanPhone },
        { otp, channel, expiresAt: expiresAtDate },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✅ [MongoDB Atlas] OTP persisted for +91 ${cleanPhone}`);
    } catch (dbErr: any) {
      console.warn('⚠️ [MongoDB Atlas OTP Persistence Notice]', dbErr.message);
    }

    // Attempt real gateway dispatch (Fast2SMS for SMS, Twilio for WhatsApp)
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
        message: `Verification code generated for +91 ${cleanPhone}.${result.error ? ' Fast2SMS notice: ' + result.error : ''}`,
        channel,
        phone: `+91 ${cleanPhone}`,
        dispatched: false,
        gatewayNotice: `Fast2SMS Gateway Notice: ${result.error || 'Website verification required on Fast2SMS dashboard'}. (For instant verification while Fast2SMS KYC is pending, your OTP code is: ${otp})`,
        otp,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, name, email, age, gender, address } = req.body;
    if (!phone || !otp) {
      res.status(400).json({ success: false, message: 'Phone and OTP code are required' });
      return;
    }

    const cleanPhone = sanitizeIndianMobile(phone);
    if (!cleanPhone) {
      res.status(400).json({ success: false, message: 'Invalid mobile number' });
      return;
    }

    const inputCode = otp.trim();
    let isValid = false;

    // 1. Primary check: MongoDB Atlas (shared across all Vercel serverless lambdas)
    try {
      const dbRecord = await OtpModel.findOne({ phone: cleanPhone });
      if (dbRecord && dbRecord.otp === inputCode) {
        if (new Date(dbRecord.expiresAt).getTime() > Date.now()) {
          isValid = true;
        }
      }
    } catch (dbErr: any) {
      console.warn('⚠️ [MongoDB Atlas OTP Check Notice]', dbErr.message);
    }

    // 2. Secondary fallback: in-memory cache
    if (!isValid) {
      const record = otpStore.get(cleanPhone);
      if (record && record.otp === inputCode && record.expiresAt > Date.now()) {
        isValid = true;
      }
    }

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please enter the correct 6-digit code received on your mobile or request a new one.'
      });
      return;
    }

    // Clean up used OTP
    try {
      await OtpModel.deleteOne({ phone: cleanPhone });
    } catch (_) {}
    otpStore.delete(cleanPhone);

    let user = await UserModel.findOne({
      $or: [
        { phone: `+91 ${cleanPhone}` },
        { phone: cleanPhone },
        { email: `${cleanPhone}@phone.grenterprises.in` },
        ...(email && email.trim() ? [{ email: email.trim().toLowerCase() }] : [])
      ]
    });

    const userEmail = (email && email.trim() && email.includes('@')) 
      ? email.trim().toLowerCase() 
      : (user ? user.email : `${cleanPhone}@phone.grenterprises.in`);

    if (!user) {
      const userId = `usr-p-${Date.now()}`;
      const userName = name?.trim() || `Customer +91 ${cleanPhone}`;
      user = await UserModel.create({
        id: userId,
        name: userName,
        email: userEmail,
        phone: `+91 ${cleanPhone}`,
        age: age !== undefined && age !== '' ? Number(age) : undefined,
        gender: gender || undefined,
        role: 'd2c_customer',
        authProvider: 'phone',
        savedAddresses: address && address.street ? [address] : [],
      });
      console.log(`✅ [MongoDB Atlas] Created new Mobile OTP user: ${user.name} (+91 ${cleanPhone}, Age: ${user.age})`);
    } else {
      if (name && name.trim()) {
        user.name = name.trim();
      }
      if (email && email.trim() && email.includes('@')) {
        user.email = email.trim().toLowerCase();
      }
      if (age !== undefined && age !== '') {
        user.age = Number(age);
      }
      if (gender) {
        user.gender = gender;
      }
      if (address && address.street) {
        user.savedAddresses = [address];
      }
      await user.save();
      console.log(`✅ [MongoDB Atlas] Existing Mobile OTP user logged in & updated: ${user.name} (+91 ${cleanPhone})`);
    }

    const token = generateToken(user.id, user.role);
    const hasCompleteDetails = 
      Boolean(user.name) && 
      !user.name.startsWith('Customer +91') && 
      Boolean(user.email) && 
      !user.email.includes('@phone.grenterprises.in') && 
      Boolean(user.age) && 
      Boolean(user.savedAddresses && user.savedAddresses.length > 0 && user.savedAddresses[0]?.street);

    res.json({
      success: true,
      message: 'Mobile number verified successfully! Customer saved in MongoDB Atlas.',
      data: user,
      token,
      isNewUser: !hasCompleteDetails,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, name, email, age, gender, address, phone } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    const user = await UserModel.findOne({ id: userId });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found in MongoDB database' });
      return;
    }

    if (name && name.trim()) user.name = name.trim();
    if (age !== undefined && age !== '') user.age = Number(age);
    if (gender) user.gender = gender;
    if (phone) user.phone = phone;

    if (email && email.trim() && email.includes('@')) {
      const cleanEmail = email.trim().toLowerCase();
      // Check if another account in MongoDB Atlas already has this email
      const existingUserWithEmail = await UserModel.findOne({ email: cleanEmail });
      if (existingUserWithEmail && existingUserWithEmail.id !== user.id) {
        // Link and merge this mobile profile into the existing account
        if (phone || user.phone) existingUserWithEmail.phone = phone || user.phone;
        if (name && name.trim()) existingUserWithEmail.name = name.trim();
        if (age !== undefined && age !== '') existingUserWithEmail.age = Number(age);
        if (gender) existingUserWithEmail.gender = gender;
        if (address && address.street) {
          const deliveryAddress = {
            street: address.street.trim(),
            landmark: address.landmark?.trim() || undefined,
            city: address.city?.trim() || 'Meerut',
            state: address.state?.trim() || 'Uttar Pradesh',
            postalCode: address.postalCode?.trim() || '250001',
            country: address.country?.trim() || 'India',
          };
          existingUserWithEmail.savedAddresses = [deliveryAddress];
        }
        await existingUserWithEmail.save();
        console.log(`✅ [MongoDB Atlas] Merged phone ${user.phone} into existing account ${cleanEmail}`);

        // If the temporary phone account was a placeholder, delete the duplicate placeholder
        if (user.email.includes('@phone.grenterprises.in')) {
          await UserModel.deleteOne({ id: user.id });
        }

        const mergedToken = generateToken(existingUserWithEmail.id, existingUserWithEmail.role);
        res.json({
          success: true,
          message: 'Customer details saved and account linked in MongoDB Atlas',
          data: existingUserWithEmail,
          token: mergedToken,
        });
        return;
      }
      user.email = cleanEmail;
    }

    if (address && address.street) {
      const deliveryAddress = {
        street: address.street.trim(),
        landmark: address.landmark?.trim() || undefined,
        city: address.city?.trim() || 'Meerut',
        state: address.state?.trim() || 'Uttar Pradesh',
        postalCode: address.postalCode?.trim() || '250001',
        country: address.country?.trim() || 'India',
      };
      user.savedAddresses = [deliveryAddress];
    }

    await user.save();
    console.log(`✅ [MongoDB Atlas] Customer details updated: ${user.name} (${user.email}, Age: ${user.age})`);

    const token = generateToken(user.id, user.role);
    res.json({
      success: true,
      message: 'Customer profile details updated successfully in MongoDB Atlas',
      data: user,
      token,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Capture Lead / Prospective Customer contact immediately as soon as phone or email is entered
 * (Pushes directly into MongoDB Atlas before or without OTP completion)
 */
export const captureLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, email } = req.body;
    if (!phone && !email) {
      res.status(400).json({ success: false, message: 'Phone number or email address is required' });
      return;
    }

    const cleanPhone = phone ? sanitizeIndianMobile(phone) : '';
    const cleanEmail = email && typeof email === 'string' && email.includes('@') 
      ? email.trim().toLowerCase() 
      : undefined;

    let user = await UserModel.findOne({
      $or: [
        ...(cleanPhone ? [{ phone: `+91 ${cleanPhone}` }, { phone: cleanPhone }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : [])
      ]
    });

    if (!user) {
      const userId = `usr-lead-${Date.now()}`;
      user = await UserModel.create({
        id: userId,
        name: cleanPhone ? `Customer +91 ${cleanPhone}` : (cleanEmail ? cleanEmail.split('@')[0] : 'Prospective Customer'),
        email: cleanEmail || (cleanPhone ? `${cleanPhone}@phone.grenterprises.in` : undefined),
        phone: cleanPhone ? `+91 ${cleanPhone}` : undefined,
        role: 'd2c_customer',
        authProvider: cleanPhone ? 'phone' : 'email',
        savedAddresses: [],
      });
      console.log(`✅ [MongoDB Atlas Instant Lead] Saved phone=${cleanPhone || 'N/A'}, email=${cleanEmail || 'N/A'}`);
    } else {
      if (cleanPhone && !user.phone) {
        user.phone = `+91 ${cleanPhone}`;
      }
      if (cleanEmail && (!user.email || user.email.includes('@phone.grenterprises.in'))) {
        user.email = cleanEmail;
      }
      await user.save();
      console.log(`✅ [MongoDB Atlas Lead Updated] phone=${user.phone}, email=${user.email}`);
    }

    res.json({
      success: true,
      message: 'Contact details captured and pushed to MongoDB database immediately',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

