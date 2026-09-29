// Fast2SMS DLT-Free Real OTP Service for GR Enterprises

export interface SmsDispatchResponse {
  success: boolean;
  message: string;
  provider: string;
  phone?: string;
  responseData?: any;
  error?: string;
}

/**
 * Sanitize Indian mobile number to exactly 10 digits
 * Strips leading '+91', leading '91', leading '0', dashes, spaces, and non-digits
 */
export function sanitizeIndianMobile(rawPhone: string): string {
  if (!rawPhone) return '';

  // Remove all non-numeric characters (dashes, spaces, parentheses, +)
  let digits = rawPhone.replace(/\D/g, '');

  // Strip leading '0'
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Strip leading Indian country code '91' if length is greater than 10
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  }

  // Take the last 10 digits
  const cleanPhone = digits.slice(-10);
  return cleanPhone;
}

/**
 * Validate that a cleaned phone number is a valid 10-digit Indian mobile
 */
export function isValidIndianMobile(cleanPhone: string): boolean {
  // Indian mobile numbers start with 6, 7, 8, or 9 and have 10 digits
  return /^[6-9]\d{9}$/.test(cleanPhone);
}

/**
 * Send real 6-digit OTP via Fast2SMS DLT-Free OTP Route
 * Endpoint: POST https://www.fast2sms.com/dev/bulkV2
 * Headers: authorization, Content-Type: application/json
 * Payload: { route: 'otp', variables_values: <otp>, numbers: <clean_phone> }
 */
export async function sendFast2SmsOtp(rawPhone: string, otp: string): Promise<SmsDispatchResponse> {
  const cleanPhone = sanitizeIndianMobile(rawPhone);

  if (!isValidIndianMobile(cleanPhone)) {
    return {
      success: false,
      message: 'Please enter a valid 10-digit Indian mobile number (must start with 6, 7, 8, or 9)',
      provider: 'Fast2SMS',
      phone: cleanPhone,
      error: 'Invalid mobile number format'
    };
  }

  const apiKey = process.env.FAST2SMS_API_KEY || 'sOn3LvpZjDBIP9N2fCwcQYW81iE5yUr6G0azJMuxVHgqTKbRlFJNhckoAz9tbTKrg0qaCd8lZxQnsBu7';

  if (!apiKey) {
    console.error('❌ [Fast2SMS] Missing FAST2SMS_API_KEY in environment variables');
    return {
      success: false,
      message: 'SMS Gateway authorization key is not configured in server/.env',
      provider: 'Fast2SMS',
      phone: cleanPhone,
      error: 'Missing FAST2SMS_API_KEY'
    };
  }

  try {
    const endpoint = 'https://www.fast2sms.com/dev/bulkV2';
    const payload = {
      route: 'otp',
      variables_values: otp.trim(),
      numbers: cleanPhone
    };

    console.log(`📡 [Fast2SMS Dispatch Initiated] Sending OTP ${otp} to +91 ${cleanPhone} via POST ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'authorization': apiKey.trim(),
        'Content-Type': 'application/json',
        'cache-control': 'no-cache'
      },
      body: JSON.stringify(payload)
    });

    const data: any = await response.json().catch(() => ({}));

    // Verify Fast2SMS response: check for return === true
    const isSuccess = data && (data.return === true || data.status_code === 200);

    if (isSuccess) {
      console.log(`✅ [Fast2SMS Dispatched Successfully] Message sent to +91 ${cleanPhone}. Request ID:`, data.request_id || 'N/A');
      return {
        success: true,
        message: `Real verification OTP code dispatched to +91 ${cleanPhone} via Fast2SMS`,
        provider: 'Fast2SMS OTP Gateway',
        phone: `+91 ${cleanPhone}`,
        responseData: data
      };
    } else {
      const errMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Fast2SMS returned error');
      console.warn(`⚠️ [Fast2SMS Dispatch Warning] Fast2SMS returned:`, data);
      return {
        success: false,
        message: errMsg,
        provider: 'Fast2SMS OTP Gateway',
        phone: `+91 ${cleanPhone}`,
        responseData: data,
        error: errMsg
      };
    }
  } catch (err: any) {
    console.error('❌ [Fast2SMS Network Error]', err.message);
    return {
      success: false,
      message: `Network error reaching Fast2SMS gateway: ${err.message}`,
      provider: 'Fast2SMS OTP Gateway',
      phone: `+91 ${cleanPhone}`,
      error: err.message
    };
  }
}
