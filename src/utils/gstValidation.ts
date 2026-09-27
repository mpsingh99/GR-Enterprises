// GSTIN Validator and State Code Mapper

export const INDIAN_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh'
};

export interface GSTValidationResult {
  isValid: boolean;
  message: string;
  stateCode?: string;
  stateName?: string;
  panNumber?: string;
}

export function validateGSTIN(gstinInput: string): GSTValidationResult {
  const gstin = gstinInput.trim().toUpperCase();

  if (!gstin) {
    return {
      isValid: false,
      message: 'GSTIN is required for B2B registration'
    };
  }

  if (gstin.length !== 15) {
    return {
      isValid: false,
      message: `GSTIN must be exactly 15 characters (currently ${gstin.length})`
    };
  }

  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regex.test(gstin)) {
    return {
      isValid: false,
      message: 'Invalid GSTIN structure. Expected format: 22AAAAA0000A1Z5'
    };
  }

  const stateCode = gstin.substring(0, 2);
  const stateName = INDIAN_STATE_CODES[stateCode] || 'Recognized Indian State / UT';
  const panNumber = gstin.substring(2, 12);

  return {
    isValid: true,
    message: `Valid GSTIN verified for state: ${stateName} (PAN: ${panNumber})`,
    stateCode,
    stateName,
    panNumber
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}
