# GR Enterprises — Unified D2C Retail & B2B Wholesale Platform (Meerut)

![GR Enterprises Platform](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80)

**GR Enterprises** is a modern, responsive enterprise e-commerce platform built with React 19, TypeScript, Vite, and Tailwind CSS. It features two strictly separated shopping environments:

1. **🛍️ D2C Retail Direct**: Frictionless consumer shopping with simple 1-click Google / mobile sign-up, express doorstep delivery across India from Meerut, 7-day returns, and official retail GST invoices.
2. **🏢 B2B Wholesale Portal**: Dedicated commercial procurement for companies, contractors, and retailers with volume-tiered discounts (up to 45% OFF), minimum order quantities (MOQs), 18% GST Input Tax Credit (ITC), Net-30 commercial credit terms, and custom Request For Quote (RFQ) generation.
3. **🛡️ 1 Master Admin Control Center**: Unified operational command center to oversee real-time KPIs, verify B2B GST KYC applications, adjust retail and wholesale tier pricing, manage inventory stock, fulfill orders with courier tracking, handle custom RFQs, and configure Meerut facility settings.

---

## 🌟 Key Features

### 1. Strict Isolation between Retail and Wholesale
- **Pure Separation**: When a visitor enters Retail mode, all wholesale options, B2B registration banners, and bulk cross-promotions are hidden. In B2B mode, only commercial wholesale procurement tools are shown.
- **Dedicated Mode Indicators**: Clean active mode pill in the header with a deliberate "Change Store" action that launches the Experience Gate.
- **Isolated Order History & Accounts**: Retail shoppers only view personal orders; B2B buyers only view corporate invoices and credit statuses.

### 2. Price Tags Hidden Until Sign-Up
- To protect member benefits and confidential wholesale rates, prices are locked until customers sign up.
- **Retail**: Simple 30-second sign-up via Google 1-click or phone number + Meerut delivery address immediately unlocks prices.
- **Wholesale**: Verified business registration with valid 15-digit GSTIN (UP State Code `09`), company PAN, monthly volume, and credit terms unlock wholesale rate tiers.

### 3. All-in-One Master Admin Dashboard
Accessible via the prominent **Admin Panel** button in the navigation:
- **Dashboard Overview**: Live gross revenue, order volume, pending B2B approvals, and low stock warnings.
- **B2B GST KYC Verification Desk**: Review applicant GSTIN, inspect corporate documents, approve credit limits, or request additional documentation with custom notes.
- **Product & Inventory Management**: Modify base prices, tier breaks, MOQs, case-pack sizes, stock steppers (+/- 10), add new SKUs, or delete products.
- **Orders & Fulfillment**: Process orders, assign courier tracking numbers (`GRE-EXP-XXXX`), and print official GST invoices.
- **RFQ Volume Quotes Desk**: Manage custom bulk price inquiries (500+ units) and submit counter-offers.
- **Customer Role Management**: Assign permissions between Retail Customer, B2B Pending, B2B Needs Info, B2B Approved, or Administrator.
- **Meerut Facility Configuration**: Live updates for company name, street address, GSTIN, phone, and free delivery thresholds.

### 4. Meerut Hub GST Compliance & Invoicing
- Headquartered in **Meerut, Uttar Pradesh (State Code: 09)**:
  - **Intrastate (UP)**: 9% CGST + 9% SGST
  - **Interstate (Outside UP)**: 18% IGST
- Tax invoices fully compliant with Rule 46 of the CGST Act, including HSN codes, tax breakdowns, and print-ready layout.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Effects**: Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mpsingh99/GR-Enterprises.git

# Navigate into the project directory
cd GR-Enterprises

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

---

## 🎭 Built-in Test Personas

Use the test bar at the top of the application to test all user roles:

| Persona | Role | Description |
| :--- | :--- | :--- |
| **Guest** | Unregistered | Browsing catalog with prices locked until sign-up |
| **Retail Shopper** | Priya Sharma | Direct retail consumer with saved Meerut delivery address |
| **B2B Pending** | Zenith Enterprises | Application under compliance review at Meerut desk |
| **B2B Needs Info** | Metro Distributors | Action required to resolve document submission |
| **B2B Approved** | Acme Logistics Corp | Verified wholesale account with Net-30 credit terms |
| **Admin Portal** | Store Administrator | Full access to the Master Admin Panel |

---

## 📄 License

Copyright © 2026 GR Enterprises Private Limited. Meerut, Uttar Pradesh, India. All rights reserved.
