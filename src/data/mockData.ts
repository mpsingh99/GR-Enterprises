import { Product, User, B2BApplicationDetails, Order, Quote, StoreSettings } from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  companyName: 'GR Enterprises',
  legalEntityName: 'GR Enterprises Private Limited',
  tagline: 'Leading D2C Retail & B2B Wholesale Supply Center • Meerut Hub',
  gstin: '09AABCG1234F1Z8', // 09 is Uttar Pradesh state code
  panNumber: 'AABCG1234F',
  cin: 'U72200UP2026PTC109922',
  street: 'GR Tower, Delhi Road, Near Transport Nagar',
  city: 'Meerut',
  state: 'Uttar Pradesh',
  stateCode: '09',
  postalCode: '250002',
  country: 'India',
  email: 'contact@grenterprises.in',
  phone: '+91 121 255 4321 / +91 98370 12345',
  freeShippingThreshold: 1000,
  defaultGstPercent: 18
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'GRE-MON-4K34',
    hsnCode: '85285200',
    title: 'GR ProView 34" UltraWide Curved 4K HDR Monitor',
    description: 'Ultrawide 21:9 WQHD (3440 x 1440) IPS display with 144Hz refresh rate, USB-C 90W Power Delivery, and built-in KVM switch for multi-device workstations.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=800&q=80'
    ],
    retailPrice: 38990,
    mrp: 49990,
    wholesalePrice: 29500,
    priceTiers: [
      { minQuantity: 5, maxQuantity: 19, pricePerUnit: 28200, savingsPercentage: 27 },
      { minQuantity: 20, maxQuantity: 49, pricePerUnit: 26500, savingsPercentage: 32 },
      { minQuantity: 50, pricePerUnit: 24800, savingsPercentage: 36 }
    ],
    moq: 5,
    casePackSize: 2,
    stock: 140,
    unit: 'unit',
    rating: 4.8,
    reviewsCount: 124,
    isRfqEligible: true,
    taxRatePercent: 18,
    features: [
      '34" UltraWide WQHD (3440 x 1440) 1900R Curved Display',
      '90W USB-C Single-Cable Docking with Ethernet & USB Hub',
      'Hardware KVM Switch for dual-machine productivity',
      'Factory Calibrated 98% DCI-P3 Color Accuracy',
      '3-Year Enterprise On-Site Replacement Warranty'
    ],
    specifications: {
      'Panel Type': 'Nano IPS',
      'Resolution': '3440 x 1440 (21:9)',
      'Refresh Rate': '144Hz',
      'Ports': '2x HDMI 2.1, 1x DP 1.4, 1x USB-C 90W PD, 4x USB 3.2',
      'Weight': '8.4 kg'
    },
    variants: [
      { id: 'v1-silver', name: 'Platinum Silver Stand', sku: 'GRE-MON-4K34-SLV', additionalPrice: 0, stock: 90 },
      { id: 'v1-black', name: 'Stealth Matte Black Stand', sku: 'GRE-MON-4K34-BLK', additionalPrice: 500, stock: 50 }
    ]
  },
  {
    id: 'prod-2',
    sku: 'GRE-CHR-ERGO1',
    hsnCode: '94031090',
    title: 'GR ErgoElite Pro Executive High-Back Mesh Chair',
    description: 'High-performance ergonomic office chair engineered with breathable 4D mesh, self-adjusting lumbar support, multi-tilt lock, and heavy-duty class 4 gas lift.',
    category: 'Office & Workspaces',
    image: 'https://images.unsplash.com/photo-1580481077195-c3a82da0bc74?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1580481077195-c3a82da0bc74?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80'
    ],
    retailPrice: 16499,
    mrp: 22999,
    wholesalePrice: 11200,
    priceTiers: [
      { minQuantity: 6, maxQuantity: 23, pricePerUnit: 10500, savingsPercentage: 36 },
      { minQuantity: 24, maxQuantity: 59, pricePerUnit: 9800, savingsPercentage: 40 },
      { minQuantity: 60, pricePerUnit: 8900, savingsPercentage: 46 }
    ],
    moq: 6,
    casePackSize: 2,
    stock: 320,
    unit: 'chair',
    rating: 4.7,
    reviewsCount: 89,
    isRfqEligible: true,
    taxRatePercent: 18,
    features: [
      'Adaptive Dynamic 3D Lumbar Support mechanism',
      'Korean imported breathable non-sagging mesh',
      '4D adjustable armrests with soft PU padding',
      'BIFMA certified heavy-duty aluminum alloy base'
    ],
    specifications: {
      'Weight Capacity': '150 kg',
      'Warranty': '5 Years Comprehensive',
      'Recline Angle': '90° to 135° with 4-position lock',
      'Gas Lift': 'Class 4 Certified'
    },
    variants: [
      { id: 'v2-gray', name: 'Graphite Gray Mesh', sku: 'GRE-CHR-ERGO1-GRY', additionalPrice: 0, stock: 200 },
      { id: 'v2-allblack', name: 'Onyx Black Mesh', sku: 'GRE-CHR-ERGO1-BLK', additionalPrice: 0, stock: 120 }
    ]
  },
  {
    id: 'prod-3',
    sku: 'GRE-DSK-DUAL1',
    hsnCode: '94033090',
    title: 'GR Rise Dual-Motor Height Adjustable Standing Desk',
    description: 'Commercial grade sit-to-stand desk with dual whisper-quiet motors, anti-collision sensor, 4 memory presets, and 1-inch thick scratch-resistant laminated tabletop.',
    category: 'Office & Workspaces',
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80'
    ],
    retailPrice: 28999,
    mrp: 37999,
    wholesalePrice: 21500,
    priceTiers: [
      { minQuantity: 4, maxQuantity: 15, pricePerUnit: 20200, savingsPercentage: 30 },
      { minQuantity: 16, maxQuantity: 39, pricePerUnit: 18900, savingsPercentage: 35 },
      { minQuantity: 40, pricePerUnit: 17400, savingsPercentage: 40 }
    ],
    moq: 4,
    casePackSize: 2,
    stock: 95,
    unit: 'desk',
    rating: 4.9,
    reviewsCount: 62,
    isRfqEligible: true,
    taxRatePercent: 18,
    features: [
      'Dual German-engineered motors with <45dB sound level',
      'Lift speed of 38mm/s with 120kg weight capacity',
      'Smart anti-collision gyro detection system',
      'Integrated under-desk wire management raceway'
    ],
    specifications: {
      'Height Range': '620mm - 1270mm',
      'Tabletop Dimensions': '1400mm x 700mm x 25mm',
      'Frame Material': 'Industrial Heavy Steel Frame'
    }
  },
  {
    id: 'prod-4',
    sku: 'GRE-BOX-3PLY50',
    hsnCode: '48191010',
    title: 'GR Heavy-Duty 3-Ply Corrugated Shipping Boxes (Pack of 50)',
    description: 'High-burst strength kraft shipping boxes engineered for e-commerce, fulfillment centers, and warehouse logistics. 100% recyclable virgin craft board.',
    category: 'Packaging & Shipping',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
    ],
    retailPrice: 1450,
    mrp: 1890,
    wholesalePrice: 950,
    priceTiers: [
      { minQuantity: 10, maxQuantity: 49, pricePerUnit: 880, savingsPercentage: 39 },
      { minQuantity: 50, maxQuantity: 199, pricePerUnit: 790, savingsPercentage: 45 },
      { minQuantity: 200, pricePerUnit: 690, savingsPercentage: 52 }
    ],
    moq: 10,
    casePackSize: 10,
    stock: 2500,
    unit: 'pack (50 pcs)',
    rating: 4.6,
    reviewsCount: 310,
    isRfqEligible: true,
    taxRatePercent: 12,
    features: [
      'Bursting strength of 14-16 kg/cm²',
      'Dimensions: 10" x 8" x 6" (standard apparel & gadget size)',
      'Pre-creased folds for 3-second rapid assembly',
      'Eco-friendly FSC certified paper'
    ],
    specifications: {
      'Board Grade': '180 GSM Kraft 3-Ply B-Flute',
      'Bundle Quantity': '50 Boxes per strapped bundle',
      'Stacking Strength': 'Up to 25 kg uniform weight'
    }
  },
  {
    id: 'prod-5',
    sku: 'GRE-PRN-THRM4',
    hsnCode: '84433290',
    title: 'GR PrintPro 4-Inch Industrial High-Speed Shipping Label Printer',
    description: 'Direct thermal shipping label printer compatible with Amazon, Flipkart, Shopify, and FedEx shipping labels. Fast 152mm/s print speed without ink or toner.',
    category: 'Packaging & Shipping',
    image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80'
    ],
    retailPrice: 7999,
    mrp: 10999,
    wholesalePrice: 5800,
    priceTiers: [
      { minQuantity: 4, maxQuantity: 15, pricePerUnit: 5300, savingsPercentage: 34 },
      { minQuantity: 16, maxQuantity: 49, pricePerUnit: 4800, savingsPercentage: 40 },
      { minQuantity: 50, pricePerUnit: 4400, savingsPercentage: 45 }
    ],
    moq: 4,
    casePackSize: 2,
    stock: 180,
    unit: 'unit',
    rating: 4.8,
    reviewsCount: 142,
    isRfqEligible: true,
    taxRatePercent: 18,
    features: [
      'Zero ink/toner thermal printing technology',
      'Auto label recognition and intelligent paper return',
      'USB & High-Speed Ethernet interface for multi-operator warehouses',
      'Prints 4x6 inch standard shipping labels in under 1 second'
    ],
    specifications: {
      'Print Resolution': '203 DPI (8 dots/mm)',
      'Label Width': '25.4mm to 108mm',
      'Duty Cycle': 'Up to 10,000 labels per day'
    }
  },
  {
    id: 'prod-6',
    sku: 'GRE-NET-WIFI6',
    hsnCode: '85176290',
    title: 'GR Netlink AX5400 Enterprise Mesh Wi-Fi 6 Access Point',
    description: 'Enterprise grade dual-band Wi-Fi 6 wireless AP supporting 500+ concurrent clients, PoE+ powered, seamless roaming, VLAN isolation, and centralized cloud dashboard.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
    ],
    retailPrice: 12499,
    mrp: 16999,
    wholesalePrice: 8900,
    priceTiers: [
      { minQuantity: 5, maxQuantity: 19, pricePerUnit: 8200, savingsPercentage: 34 },
      { minQuantity: 20, maxQuantity: 49, pricePerUnit: 7600, savingsPercentage: 39 },
      { minQuantity: 50, pricePerUnit: 6990, savingsPercentage: 44 }
    ],
    moq: 5,
    casePackSize: 5,
    stock: 210,
    unit: 'unit',
    rating: 4.9,
    reviewsCount: 78,
    isRfqEligible: true,
    taxRatePercent: 18,
    features: [
      'Speeds up to 5378 Mbps (4804 Mbps 5GHz + 574 Mbps 2.4GHz)',
      'Powered via 802.3at PoE+ (Power over Ethernet)',
      'Captive portal with guest authentication & SMS OTP',
      'Enterprise WPA3 security & dynamic RF management'
    ],
    specifications: {
      'Coverage': 'Up to 2,500 sq ft per unit',
      'Ethernet': '1x 2.5 Gbps Multi-Gig PoE Port',
      'Concurrent Users': '500+ Active Devices'
    }
  },
  {
    id: 'prod-7',
    sku: 'GRE-CUP-BIO500',
    hsnCode: '48236900',
    title: 'GR EcoKraft Compostable Double-Wall Cups 250ml (Case of 500)',
    description: 'PLA plant-lined double-wall hot beverage cups for cafeterias, restaurants, corporate pantries, and catering. Heat insulating, leak-proof, and 100% biodegradable.',
    category: 'Commercial Supplies',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ],
    retailPrice: 2200,
    mrp: 2800,
    wholesalePrice: 1550,
    priceTiers: [
      { minQuantity: 5, maxQuantity: 19, pricePerUnit: 1420, savingsPercentage: 35 },
      { minQuantity: 20, maxQuantity: 49, pricePerUnit: 1300, savingsPercentage: 41 },
      { minQuantity: 50, pricePerUnit: 1180, savingsPercentage: 46 }
    ],
    moq: 5,
    casePackSize: 5,
    stock: 640,
    unit: 'case (500 pcs)',
    rating: 4.7,
    reviewsCount: 195,
    isRfqEligible: true,
    taxRatePercent: 12,
    features: [
      'Double-wall ribbed insulation eliminates need for cup sleeves',
      'Food-grade cornstarch PLA liner, 0% petroleum coating',
      'Certified EN13432 compostable within 90 days',
      'Standard 80mm rim diameter fits standard lids'
    ],
    specifications: {
      'Capacity': '250ml (8 oz)',
      'Case Breakdown': '10 sleeves of 50 cups = 500 cups',
      'Heat Resistance': 'Up to 95°C'
    }
  },
  {
    id: 'prod-8',
    sku: 'GRE-COF-ARAB10',
    hsnCode: '09012100',
    title: 'GR Estate Arabica Espresso Whole Coffee Beans (10kg Commercial Sack)',
    description: 'Freshly roasted whole bean Arabica from Chikmagalur estates. Medium-dark roast with notes of cocoa, roasted almonds, and citrus. Sourced directly for cafes and corporate offices.',
    category: 'Commercial Supplies',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80'
    ],
    retailPrice: 6500,
    mrp: 8500,
    wholesalePrice: 4700,
    priceTiers: [
      { minQuantity: 3, maxQuantity: 9, pricePerUnit: 4300, savingsPercentage: 34 },
      { minQuantity: 10, maxQuantity: 24, pricePerUnit: 3950, savingsPercentage: 39 },
      { minQuantity: 25, pricePerUnit: 3600, savingsPercentage: 45 }
    ],
    moq: 3,
    casePackSize: 1,
    stock: 120,
    unit: 'sack (10kg)',
    rating: 4.9,
    reviewsCount: 88,
    isRfqEligible: true,
    taxRatePercent: 5,
    features: [
      '100% Grade AAA Arabica specialty beans',
      'Roast profile optimized for commercial super-automatic espresso machines',
      'Nitrogen flushed hermetic barrier bag with one-way degassing valve',
      'Direct trade harvested from shade-grown rainforest canopies'
    ],
    specifications: {
      'Net Weight': '10 kg whole beans',
      'Origin': 'Chikmagalur, Karnataka',
      'Roast Date': 'Within 7 days of shipment'
    }
  }
];

export const INITIAL_B2B_APPLICATIONS: B2BApplicationDetails[] = [
  {
    id: 'app-acme-1',
    userId: 'user-b2b-approved',
    businessName: 'Acme Logistics & Supply Corp',
    businessType: 'Private Limited (Pvt Ltd)',
    gstin: '09AABCU9603R1ZM', // UP GSTIN (Meerut / Western UP)
    panNumber: 'AABCU9603R',
    website: 'https://acmelogistics.in',
    contactName: 'Rajesh Gupta',
    contactEmail: 'rajesh@acmelogistics.in',
    contactPhone: '+91 98200 45678',
    shopAddress: {
      street: 'Plot 42, Partapur Industrial Area, Bypass Road',
      landmark: 'Near Partapur Flyover',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250103',
      country: 'India'
    },
    billingAddress: {
      street: 'Tower B, 4th Floor, Meerut Business Center, Delhi Road',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250002',
      country: 'India'
    },
    shippingAddress: {
      street: 'GR Regional Logistics Hub, Transport Nagar',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250002',
      country: 'India'
    },
    sameAsShopAddress: false,
    resaleCertFileName: 'UP_GST_Certificate_Acme_Meerut.pdf',
    supportingDocName: 'Acme_Trade_License_Partapur.pdf',
    status: 'approved',
    adminNotes: 'Verified on GST portal. PAN matches MCA records. ₹5,00,000 credit limit sanctioned.',
    appliedDate: '2026-08-15',
    reviewedDate: '2026-08-16',
    reviewedBy: 'Admin (GR Staff)',
    creditLimit: 500000,
    paymentTerms: 'Net 30'
  },
  {
    id: 'app-zenith-2',
    userId: 'user-b2b-pending',
    businessName: 'Zenith Retail & Workspaces Pvt Ltd',
    businessType: 'Private Limited (Pvt Ltd)',
    gstin: '09AABCP1234D1Z2', // UP GSTIN
    panNumber: 'AABCP1234D',
    website: 'https://zenithspaces.com',
    contactName: 'Vikram Malhotra',
    contactEmail: 'vikram@zenithenterprises.in',
    contactPhone: '+91 98450 11223',
    shopAddress: {
      street: '14/3, Civil Lines, Near Commissioner Residence',
      landmark: 'Opposite Gandhi Ashram',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250001',
      country: 'India'
    },
    billingAddress: {
      street: '14/3, Civil Lines',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250001',
      country: 'India'
    },
    shippingAddress: {
      street: 'Zenith Distribution Point, Rithani Industrial Complex',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250103',
      country: 'India'
    },
    sameAsShopAddress: false,
    resaleCertFileName: 'UP_GSTIN_Registration_Zenith.pdf',
    supportingDocName: 'COI_Zenith_UP.pdf',
    status: 'pending',
    adminNotes: undefined,
    appliedDate: '2026-09-24'
  },
  {
    id: 'app-metro-3',
    userId: 'user-b2b-needsinfo',
    businessName: 'Metro Regional Supermarts LLP',
    businessType: 'Limited Liability Partnership (LLP)',
    gstin: '07AAAFM9876E1Z9', // Delhi interstate
    panNumber: 'AAAFM9876E',
    website: 'https://metrodelhi.in',
    contactName: 'Sunita Rao',
    contactEmail: 'sunita@metrodistributors.com',
    contactPhone: '+91 98110 99887',
    shopAddress: {
      street: 'D-44, Okhla Industrial Area Phase 1',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110020',
      country: 'India'
    },
    billingAddress: {
      street: 'D-44, Okhla Industrial Area Phase 1',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110020',
      country: 'India'
    },
    shippingAddress: {
      street: 'D-44, Okhla Industrial Area Phase 1',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110020',
      country: 'India'
    },
    sameAsShopAddress: true,
    resaleCertFileName: 'GST_Delhi_Doc_Scanned.pdf',
    status: 'needs_more_info',
    adminNotes: 'Uploaded GST certificate copy is missing authorized signatory seal. Please re-upload verified copy matching your billing address.',
    appliedDate: '2026-09-20',
    reviewedDate: '2026-09-21',
    reviewedBy: 'Admin (GR Compliance Desk)'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-d2c-priya',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 99301 23456',
    role: 'd2c_customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    joinedDate: '2026-07-10',
    savedAddresses: [
      {
        street: 'A-304, Green Heights, Shastri Nagar',
        landmark: 'Near Central Park',
        city: 'Meerut',
        state: 'Uttar Pradesh',
        postalCode: '250004',
        country: 'India'
      }
    ]
  },
  {
    id: 'user-b2b-approved',
    name: 'Rajesh Gupta (Acme Logistics)',
    email: 'rajesh@acmelogistics.in',
    phone: '+91 98200 45678',
    role: 'b2b_approved',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    joinedDate: '2026-08-15',
    businessProfile: INITIAL_B2B_APPLICATIONS[0]
  },
  {
    id: 'user-b2b-pending',
    name: 'Vikram Malhotra (Zenith Enterprises)',
    email: 'vikram@zenithenterprises.in',
    phone: '+91 98450 11223',
    role: 'b2b_pending',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    joinedDate: '2026-09-24',
    businessProfile: INITIAL_B2B_APPLICATIONS[1]
  },
  {
    id: 'user-b2b-needsinfo',
    name: 'Sunita Rao (Metro Supermarts)',
    email: 'sunita@metrodistributors.com',
    phone: '+91 98110 99887',
    role: 'b2b_needs_info',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    joinedDate: '2026-09-20',
    businessProfile: INITIAL_B2B_APPLICATIONS[2]
  },
  {
    id: 'user-admin',
    name: 'Gaurav Rawat (Store Owner & Admin)',
    email: 'admin@grenterprises.in',
    phone: '+91 98370 12345',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    joinedDate: '2026-01-01'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-b2b-101',
    orderNumber: 'GRE-B2B-2026-0891',
    date: '2026-09-22',
    mode: 'B2B',
    customerId: 'user-b2b-approved',
    customerName: 'Rajesh Gupta',
    customerEmail: 'rajesh@acmelogistics.in',
    customerPhone: '+91 98200 45678',
    businessDetails: {
      businessName: 'Acme Logistics & Supply Corp',
      gstin: '09AABCU9603R1ZM',
      businessType: 'Private Limited (Pvt Ltd)',
      panNumber: 'AABCU9603R'
    },
    shippingAddress: {
      street: 'GR Regional Logistics Hub, Transport Nagar',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250002',
      country: 'India'
    },
    billingAddress: {
      street: 'Tower B, 4th Floor, Meerut Business Center, Delhi Road',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250002',
      country: 'India'
    },
    items: [
      {
        productId: 'prod-1',
        productTitle: 'GR ProView 34" UltraWide Curved 4K HDR Monitor',
        sku: 'GRE-MON-4K34-SLV',
        hsnCode: '85285200',
        unit: 'unit',
        quantity: 20,
        unitPrice: 26500,
        totalPrice: 530000,
        taxAmount: 95400,
        variantName: 'Platinum Silver Stand'
      },
      {
        productId: 'prod-4',
        productTitle: 'GR Heavy-Duty 3-Ply Corrugated Shipping Boxes (Pack of 50)',
        sku: 'GRE-BOX-3PLY50',
        hsnCode: '48191010',
        unit: 'pack (50 pcs)',
        quantity: 50,
        unitPrice: 790,
        totalPrice: 39500,
        taxAmount: 4740
      }
    ],
    subtotal: 569500,
    discountAmount: 15000,
    promoCode: 'CORP5',
    shippingFee: 0,
    taxAmount: 100140,
    taxBreakdown: {
      cgst: 50070,
      sgst: 50070,
      igst: 0
    },
    totalAmount: 654640,
    status: 'Dispatched',
    paymentMethod: 'B2B Credit (Net 30)',
    paymentStatus: 'Pending Invoice',
    trackingNumber: 'DTDC-GRE-9988221',
    invoiceNumber: 'INV-2026-GRE-B2B-0429'
  },
  {
    id: 'ord-d2c-201',
    orderNumber: 'GRE-D2C-2026-4432',
    date: '2026-09-25',
    mode: 'D2C',
    customerId: 'user-d2c-priya',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    customerPhone: '+91 99301 23456',
    shippingAddress: {
      street: 'A-304, Green Heights, Shastri Nagar',
      landmark: 'Near Central Park',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250004',
      country: 'India'
    },
    billingAddress: {
      street: 'A-304, Green Heights, Shastri Nagar',
      city: 'Meerut',
      state: 'Uttar Pradesh',
      postalCode: '250004',
      country: 'India'
    },
    items: [
      {
        productId: 'prod-2',
        productTitle: 'GR ErgoElite Pro Executive High-Back Mesh Chair',
        sku: 'GRE-CHR-ERGO1-BLK',
        hsnCode: '94031090',
        unit: 'chair',
        quantity: 1,
        unitPrice: 16499,
        totalPrice: 16499,
        taxAmount: 2969.82,
        variantName: 'Onyx Black Mesh'
      }
    ],
    subtotal: 16499,
    discountAmount: 1000,
    promoCode: 'WELCOME1000',
    shippingFee: 0,
    taxAmount: 2789.82,
    taxBreakdown: {
      cgst: 1394.91,
      sgst: 1394.91,
      igst: 0
    },
    totalAmount: 18288.82,
    status: 'Delivered',
    paymentMethod: 'Credit/Debit Card',
    paymentStatus: 'Paid',
    trackingNumber: 'BLUEDART-EXP-817263',
    invoiceNumber: 'INV-2026-GRE-RET-1182'
  }
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'q-101',
    quoteNumber: 'RFQ-GRE-2026-0045',
    date: '2026-09-23',
    businessId: 'user-b2b-approved',
    businessName: 'Acme Logistics & Supply Corp',
    contactName: 'Rajesh Gupta',
    contactEmail: 'rajesh@acmelogistics.in',
    contactPhone: '+91 98200 45678',
    productId: 'prod-4',
    productTitle: 'GR Heavy-Duty 3-Ply Corrugated Shipping Boxes (Pack of 50)',
    sku: 'GRE-BOX-3PLY50',
    requestedQuantity: 500, // 500 packs = 25,000 boxes
    targetPricePerUnit: 600,
    offeredPricePerUnit: 640,
    status: 'Quoted',
    notes: 'Require monthly recurring replenishment for our 3 Western UP fulfillment hubs. Need branded tape seal compatible craft finish.',
    adminResponseNote: 'We can offer ₹640/pack for 500+ packs with palletized delivery included from our Meerut warehouse.',
    validUntil: '2026-10-15'
  },
  {
    id: 'q-102',
    quoteNumber: 'RFQ-GRE-2026-0046',
    date: '2026-09-26',
    businessId: 'user-b2b-approved',
    businessName: 'Acme Logistics & Supply Corp',
    contactName: 'Rajesh Gupta',
    contactEmail: 'rajesh@acmelogistics.in',
    contactPhone: '+91 98200 45678',
    productId: 'prod-6',
    productTitle: 'GR Netlink AX5400 Enterprise Mesh Wi-Fi 6 Access Point',
    sku: 'GRE-NET-WIFI6',
    requestedQuantity: 80,
    targetPricePerUnit: 6500,
    status: 'Under Review',
    notes: 'Campus IT infrastructure upgrade for regional educational institute in Meerut. Require pre-configured corporate SSID profile.',
    validUntil: '2026-10-20'
  }
];
