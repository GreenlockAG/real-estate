import type {
  RealEstateProperty,
  QuarterlyValuation,
  PerformanceIndex,
  GrowthIndex,
  PLLineItem,
  WaterfallItem,
  PropertyPassportData,
  CashflowEntry,
  CashflowCategory,
  CashflowSubcategory,
  PLCategoryType,
} from './types';

import propertyDubai from '@/assets/images/property-dubai.png';
import propertyMiami from '@/assets/images/property-miami.png';
import propertyParis from '@/assets/images/property-paris.png';
import propertyZermatt from '@/assets/images/property-zermatt.png';
import propertyLondon from '@/assets/images/property-london.png';

export const properties: RealEstateProperty[] = [
  {
    id: 'dubai',
    name: 'Dubai Marina Penthouse',
    country: 'UAE',
    countryCode: 'AE',
    city: 'Dubai',
    currentValueUSD: 2850000,
    currentValueLocal: 10459500,
    localCurrency: 'AED',
    fxRate: 3.67,
    investedCapital: 2430000,
    plUSD: 420000,
    plPercent: 17.3,
    irr: 9.8,
    equityPercent: 40,
    debtPercent: 60,
    riskLevel: 'Medium',
    liquidityDays: 90,
    status: 'Operating',
    leverage: 1.5,
    thumbnail: propertyDubai,
  },
  {
    id: 'miami',
    name: 'South Beach Villa',
    country: 'USA',
    countryCode: 'US',
    city: 'Miami',
    currentValueUSD: 4200000,
    currentValueLocal: 4200000,
    localCurrency: 'USD',
    fxRate: 1.0,
    investedCapital: 3520000,
    plUSD: 680000,
    plPercent: 19.3,
    irr: 11.2,
    equityPercent: 100,
    debtPercent: 0,
    riskLevel: 'Low',
    liquidityDays: 60,
    status: 'Operating',
    leverage: 1.0,
    thumbnail: propertyMiami,
  },
  {
    id: 'paris',
    name: 'Champs-Élysées Apartment',
    country: 'France',
    countryCode: 'FR',
    city: 'Paris',
    currentValueUSD: 3100000,
    currentValueLocal: 2852000,
    localCurrency: 'EUR',
    fxRate: 0.92,
    investedCapital: 2945000,
    plUSD: 155000,
    plPercent: 5.3,
    irr: 4.8,
    equityPercent: 50,
    debtPercent: 50,
    riskLevel: 'Medium',
    liquidityDays: 120,
    status: 'Operating',
    leverage: 1.0,
    thumbnail: propertyParis,
  },
  {
    id: 'zermatt',
    name: 'Zermatt Alpine Chalet',
    country: 'Switzerland',
    countryCode: 'CH',
    city: 'Zermatt',
    currentValueUSD: 5500000,
    currentValueLocal: 4840000,
    localCurrency: 'CHF',
    fxRate: 0.88,
    investedCapital: 5720000,
    plUSD: -220000,
    plPercent: -3.8,
    irr: -2.1,
    equityPercent: 30,
    debtPercent: 70,
    riskLevel: 'High',
    liquidityDays: 180,
    status: 'For Sale',
    leverage: 2.3,
    thumbnail: propertyZermatt,
  },
  {
    id: 'london',
    name: 'Mayfair Townhouse',
    country: 'UK',
    countryCode: 'GB',
    city: 'London',
    currentValueUSD: 7800000,
    currentValueLocal: 6162000,
    localCurrency: 'GBP',
    fxRate: 0.79,
    investedCapital: 7410000,
    plUSD: 390000,
    plPercent: 5.3,
    irr: 5.8,
    equityPercent: 60,
    debtPercent: 40,
    riskLevel: 'Low',
    liquidityDays: 45,
    status: 'Renovation',
    leverage: 1.25,
    thumbnail: propertyLondon,
  },
];

const dubaiValuations: QuarterlyValuation[] = [
  { quarter: 'Q1 2023', valueUSD: 2430000, valueLocal: 8918100, fxRate: 3.67, growthPercent: null },
  { quarter: 'Q2 2023', valueUSD: 2480000, valueLocal: 9101600, fxRate: 3.67, growthPercent: 2.1 },
  { quarter: 'Q3 2023', valueUSD: 2520000, valueLocal: 9248400, fxRate: 3.67, growthPercent: 1.6 },
  { quarter: 'Q4 2023', valueUSD: 2550000, valueLocal: 9358500, fxRate: 3.67, growthPercent: 1.2 },
  { quarter: 'Q1 2024', valueUSD: 2610000, valueLocal: 9578700, fxRate: 3.67, growthPercent: 2.4 },
  { quarter: 'Q2 2024', valueUSD: 2680000, valueLocal: 9835600, fxRate: 3.67, growthPercent: 2.7 },
  { quarter: 'Q3 2024', valueUSD: 2720000, valueLocal: 9982400, fxRate: 3.67, growthPercent: 1.5 },
  { quarter: 'Q4 2024', valueUSD: 2750000, valueLocal: 10092500, fxRate: 3.67, growthPercent: 1.1 },
  { quarter: 'Q1 2025', valueUSD: 2790000, valueLocal: 10239300, fxRate: 3.67, growthPercent: 1.5 },
  { quarter: 'Q2 2025', valueUSD: 2820000, valueLocal: 10349400, fxRate: 3.67, growthPercent: 1.1 },
  { quarter: 'Q3 2025', valueUSD: 2800000, valueLocal: 10276000, fxRate: 3.67, growthPercent: -0.7 },
  { quarter: 'Q4 2025', valueUSD: 2850000, valueLocal: 10459500, fxRate: 3.67, growthPercent: 1.8 },
];

const dubaiPerformanceIndex: PerformanceIndex[] = [
  { quarter: 'Q1 2023', propertyIndex: 100.0, benchmarkIndex: 100.0, quarterlyIRR: 6.2, quarterlyBenchmark: 4.8 },
  { quarter: 'Q2 2023', propertyIndex: 101.8, benchmarkIndex: 101.3, quarterlyIRR: 7.1, quarterlyBenchmark: 5.0 },
  { quarter: 'Q3 2023', propertyIndex: 103.8, benchmarkIndex: 102.6, quarterlyIRR: 7.8, quarterlyBenchmark: 5.2 },
  { quarter: 'Q4 2023', propertyIndex: 105.9, benchmarkIndex: 103.9, quarterlyIRR: 8.2, quarterlyBenchmark: 5.3 },
  { quarter: 'Q1 2024', propertyIndex: 108.3, benchmarkIndex: 105.3, quarterlyIRR: 8.9, quarterlyBenchmark: 5.4 },
  { quarter: 'Q2 2024', propertyIndex: 110.9, benchmarkIndex: 106.6, quarterlyIRR: 9.5, quarterlyBenchmark: 5.3 },
  { quarter: 'Q3 2024', propertyIndex: 113.6, benchmarkIndex: 107.9, quarterlyIRR: 9.6, quarterlyBenchmark: 5.2 },
  { quarter: 'Q4 2024', propertyIndex: 116.3, benchmarkIndex: 109.2, quarterlyIRR: 9.4, quarterlyBenchmark: 5.0 },
  { quarter: 'Q1 2025', propertyIndex: 119.1, benchmarkIndex: 110.5, quarterlyIRR: 9.6, quarterlyBenchmark: 4.8 },
  { quarter: 'Q2 2025', propertyIndex: 122.0, benchmarkIndex: 111.7, quarterlyIRR: 9.7, quarterlyBenchmark: 4.6 },
  { quarter: 'Q3 2025', propertyIndex: 124.9, benchmarkIndex: 112.9, quarterlyIRR: 9.5, quarterlyBenchmark: 4.5 },
  { quarter: 'Q4 2025', propertyIndex: 128.0, benchmarkIndex: 114.2, quarterlyIRR: 9.8, quarterlyBenchmark: 4.4 },
];

const dubaiGrowthIndex: GrowthIndex[] = [
  { quarter: 'Q1 2023', propertyIndex: 100.0, benchmarkIndex: 100.0, quarterlyGrowth: 8.4, quarterlyBenchmark: 7.8 },
  { quarter: 'Q2 2023', propertyIndex: 102.2, benchmarkIndex: 102.0, quarterlyGrowth: 8.8, quarterlyBenchmark: 8.1 },
  { quarter: 'Q3 2023', propertyIndex: 104.0, benchmarkIndex: 104.0, quarterlyGrowth: 7.2, quarterlyBenchmark: 8.0 },
  { quarter: 'Q4 2023', propertyIndex: 105.6, benchmarkIndex: 106.0, quarterlyGrowth: 6.5, quarterlyBenchmark: 7.9 },
  { quarter: 'Q1 2024', propertyIndex: 108.1, benchmarkIndex: 108.1, quarterlyGrowth: 9.6, quarterlyBenchmark: 8.2 },
  { quarter: 'Q2 2024', propertyIndex: 110.8, benchmarkIndex: 110.2, quarterlyGrowth: 10.8, quarterlyBenchmark: 8.5 },
  { quarter: 'Q3 2024', propertyIndex: 112.4, benchmarkIndex: 112.3, quarterlyGrowth: 6.2, quarterlyBenchmark: 8.3 },
  { quarter: 'Q4 2024', propertyIndex: 113.6, benchmarkIndex: 114.3, quarterlyGrowth: 4.8, quarterlyBenchmark: 8.0 },
  { quarter: 'Q1 2025', propertyIndex: 115.1, benchmarkIndex: 116.2, quarterlyGrowth: 6.0, quarterlyBenchmark: 7.8 },
  { quarter: 'Q2 2025', propertyIndex: 116.2, benchmarkIndex: 118.0, quarterlyGrowth: 4.4, quarterlyBenchmark: 7.5 },
  { quarter: 'Q3 2025', propertyIndex: 114.5, benchmarkIndex: 119.8, quarterlyGrowth: -2.8, quarterlyBenchmark: 7.2 },
  { quarter: 'Q4 2025', propertyIndex: 116.3, benchmarkIndex: 121.6, quarterlyGrowth: 7.2, quarterlyBenchmark: 7.4 },
];

const dubaiPLItems: PLLineItem[] = [
  { category: 'Rental Income', q1: 165000, q2: 165000, q3: 172000, q4: 175000, usdTotal: 184500 },
  { category: 'Operating Costs', q1: -28000, q2: -29500, q3: -28200, q4: -30000, usdTotal: -31500 },
  { category: 'Maintenance', isExpandable: true, q1: -12500, q2: -15200, q3: -13800, q4: -14000, usdTotal: -15100 },
  { category: 'Pool', isSubItem: true, q1: -3000, q2: -3000, q3: -3000, q4: -3000, usdTotal: -3300 },
  { category: 'Painting', isSubItem: true, q1: 0, q2: -5500, q3: 0, q4: 0, usdTotal: -1500 },
  { category: 'HVAC', isSubItem: true, q1: -4500, q2: -4500, q3: -4500, q4: -4500, usdTotal: -4900 },
  { category: 'Landscaping', isSubItem: true, q1: -5000, q2: -2200, q3: -6300, q4: -6500, usdTotal: -5400 },
  { category: 'Interest', q1: -44000, q2: -44000, q3: -44000, q4: -44000, usdTotal: -48000 },
  { category: 'FX Adjustment', q1: 2800, q2: -800, q3: 1400, q4: 1200, usdTotal: 1250 },
  { category: 'Net Profit', q1: 83300, q2: 75500, q3: 87400, q4: 88200, usdTotal: 91150 },
];

const dubaiWaterfall: WaterfallItem[] = [
  { name: 'Cost Basis', valueUSD: 4200000, valueAED: 15400000, percent: 0, isTotal: true },
  { name: 'Rental Income', valueUSD: 738000, valueAED: 2708000, percent: 17.6 },
  { name: 'Price Increase', valueUSD: 840000, valueAED: 3080000, percent: 20.0 },
  { name: 'Maintenance', valueUSD: -168000, valueAED: -616000, percent: -4.0 },
  { name: 'Interest Paid', valueUSD: -528000, valueAED: -1937000, percent: -12.6 },
  { name: 'FX Adjustment', valueUSD: -294000, valueAED: -1078000, percent: -7.0 },
  { name: 'Final Value', valueUSD: 4788000, valueAED: 17557000, percent: 14.0, isTotal: true },
];

export const propertyPassportData: Record<string, PropertyPassportData> = {
  dubai: {
    property: properties[0],
    valuations: dubaiValuations,
    performanceIndex: dubaiPerformanceIndex,
    growthIndex: dubaiGrowthIndex,
    plItems: dubaiPLItems,
    waterfall: dubaiWaterfall,
  },
};

export function getPropertyById(id: string): RealEstateProperty | undefined {
  return properties.find((p) => p.id === id);
}

export function getPropertyPassportData(id: string): PropertyPassportData | undefined {
  return propertyPassportData[id];
}

export function getLast4QuartersSparkline(id: string): number[] {
  const data = propertyPassportData[id];
  if (data && data.valuations.length >= 4) {
    const last4 = data.valuations.slice(-4);
    return last4.map((v) => v.valueUSD);
  }
  
  const property = getPropertyById(id);
  if (!property) return [0, 0, 0, 0];
  
  const base = property.investedCapital;
  const current = property.currentValueUSD;
  const step = (current - base) / 3;
  return [base, base + step, base + step * 2, current];
}

const categorySubcategoryMap: Record<CashflowCategory, { subcategories: CashflowSubcategory[]; plCategory: PLCategoryType }> = {
  Rental: { subcategories: ['Monthly Rent', 'Security Deposit', 'Late Fees'], plCategory: 'Income' },
  Maintenance: { subcategories: ['Pool', 'Electrical', 'Plumbing', 'HVAC', 'Cleaning', 'Landscaping'], plCategory: 'Expense' },
  Taxes: { subcategories: ['Property Tax', 'City Tax', 'VAT'], plCategory: 'Expense' },
  Insurance: { subcategories: ['Building Insurance', 'Contents Insurance'], plCategory: 'Expense' },
  Utilities: { subcategories: ['Electricity', 'Water', 'Gas', 'Internet'], plCategory: 'Expense' },
  Management: { subcategories: ['Property Mgmt Fee', 'Legal', 'Accounting'], plCategory: 'Expense' },
  Renovation: { subcategories: ['Kitchen', 'Bathroom', 'Flooring', 'Painting'], plCategory: 'Expense' },
};

const payeesBySubcategory: Record<CashflowSubcategory, string[]> = {
  'Monthly Rent': ['Al Futtaim Properties', 'Emaar Rentals', 'Dubai Holdings'],
  'Security Deposit': ['Al Futtaim Properties', 'Emaar Rentals'],
  'Late Fees': ['Al Futtaim Properties'],
  'Pool': ['AquaCare Dubai', 'Blue Wave Pool Services', 'Crystal Clear Pools'],
  'Electrical': ['Dubai Electrical Services', 'PowerTech UAE', 'Emirates Electric'],
  'Plumbing': ['PlumbRight Dubai', 'AquaFix Services', 'Dubai Plumbing Co'],
  'HVAC': ['CoolTech Services', 'Arctic Air UAE', 'Emirates HVAC'],
  'Cleaning': ['Sparkle Clean Dubai', 'Premium Maids', 'CleanCo UAE'],
  'Landscaping': ['Green Thumb Dubai', 'Desert Gardens', 'Oasis Landscaping'],
  'Property Tax': ['Dubai Land Department', 'RERA Dubai'],
  'City Tax': ['Dubai Municipality', 'DLD Services'],
  'VAT': ['Federal Tax Authority UAE'],
  'Building Insurance': ['Zurich Insurance UAE', 'AXA Gulf', 'Emirates Insurance'],
  'Contents Insurance': ['Zurich Insurance UAE', 'AXA Gulf'],
  'Electricity': ['DEWA', 'Dubai Electricity'],
  'Water': ['DEWA', 'Dubai Water Authority'],
  'Gas': ['ENOC Gas', 'Emirates Gas'],
  'Internet': ['Etisalat', 'Du Telecom', 'Virgin Mobile UAE'],
  'Property Mgmt Fee': ['Dubai PM Services', 'Asteco Property Management', 'Better Homes'],
  'Legal': ['Baker McKenzie Dubai', 'Al Tamimi & Co', 'Hadef & Partners'],
  'Accounting': ['KPMG UAE', 'Deloitte Dubai', 'PwC Middle East'],
  'Kitchen': ['IKEA Dubai', 'Danube Home', 'Home Centre UAE'],
  'Bathroom': ['Kohler Dubai', 'Grohe Middle East', 'Duravit UAE'],
  'Flooring': ['Carpet Centre Dubai', 'Floor & Decor UAE', 'Tarkett Middle East'],
  'Painting': ['Jotun Paints UAE', 'Dulux Arabia', 'National Paints'],
};

const banks = ['Emirates NBD', 'HSBC UAE', 'Mashreq Bank', 'FAB'];

const fxRatesByQuarter: Record<string, number> = {
  'Q1-2025': 0.2723,
  'Q2-2025': 0.2719,
  'Q3-2025': 0.2715,
  'Q4-2025': 0.2710,
};

function generateDubaiCashflows(): CashflowEntry[] {
  const entries: CashflowEntry[] = [];
  let id = 1;

  const months = [
    { month: 'Jan', quarter: 'Q1-2025', days: 31 },
    { month: 'Feb', quarter: 'Q1-2025', days: 28 },
    { month: 'Mar', quarter: 'Q1-2025', days: 31 },
    { month: 'Apr', quarter: 'Q2-2025', days: 30 },
    { month: 'May', quarter: 'Q2-2025', days: 31 },
    { month: 'Jun', quarter: 'Q2-2025', days: 30 },
    { month: 'Jul', quarter: 'Q3-2025', days: 31 },
    { month: 'Aug', quarter: 'Q3-2025', days: 31 },
    { month: 'Sep', quarter: 'Q3-2025', days: 30 },
    { month: 'Oct', quarter: 'Q4-2025', days: 31 },
    { month: 'Nov', quarter: 'Q4-2025', days: 30 },
    { month: 'Dec', quarter: 'Q4-2025', days: 31 },
  ];

  const addEntry = (
    month: string,
    day: number,
    quarter: string,
    category: CashflowCategory,
    subcategory: CashflowSubcategory,
    amount: number,
    description: string
  ) => {
    const payees = payeesBySubcategory[subcategory];
    const payee = payees[Math.floor(Math.random() * payees.length)];
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const fxRate = fxRatesByQuarter[quarter];
    const plCategory = categorySubcategoryMap[category].plCategory;
    const hasInvoice = Math.random() > 0.2;
    const hasReceipt = Math.random() > 0.3;

    entries.push({
      id: `cf-${id++}`,
      date: `${month} ${day}, 2025`,
      plCategory,
      category,
      subcategory,
      payee,
      description,
      amount: plCategory === 'Income' ? amount : -amount,
      currency: 'AED',
      fxRate,
      bank,
      quarter,
      invoiceLink: hasInvoice ? `#invoice-${id}` : null,
      receiptLink: hasReceipt ? `#receipt-${id}` : null,
    });
  };

  months.forEach(({ month, quarter }) => {
    addEntry(month, 5, quarter, 'Rental', 'Monthly Rent', 165000, `${month} rent payment - Dubai Marina Penthouse`);
    addEntry(month, 8, quarter, 'Management', 'Property Mgmt Fee', 4950, `Monthly management fee - 3% of rent`);
    addEntry(month, 15, quarter, 'Utilities', 'Electricity', 2100 + Math.floor(Math.random() * 500), `${month} electricity bill`);
    addEntry(month, 16, quarter, 'Utilities', 'Water', 750 + Math.floor(Math.random() * 200), `${month} water usage`);
    addEntry(month, 18, quarter, 'Maintenance', 'Pool', 1800, `Monthly pool cleaning and maintenance`);
  });

  addEntry('Jan', 28, 'Q1-2025', 'Insurance', 'Building Insurance', 8500, 'Quarterly premium Q1 2025');
  addEntry('Apr', 28, 'Q2-2025', 'Insurance', 'Building Insurance', 8500, 'Quarterly premium Q2 2025');
  addEntry('Jul', 28, 'Q3-2025', 'Insurance', 'Building Insurance', 8500, 'Quarterly premium Q3 2025');
  addEntry('Oct', 28, 'Q4-2025', 'Insurance', 'Building Insurance', 8500, 'Quarterly premium Q4 2025');

  addEntry('Feb', 10, 'Q1-2025', 'Taxes', 'Property Tax', 12400, 'Annual property tax installment 1/4');
  addEntry('May', 10, 'Q2-2025', 'Taxes', 'Property Tax', 12400, 'Annual property tax installment 2/4');
  addEntry('Aug', 10, 'Q3-2025', 'Taxes', 'Property Tax', 12400, 'Annual property tax installment 3/4');
  addEntry('Nov', 10, 'Q4-2025', 'Taxes', 'Property Tax', 12400, 'Annual property tax installment 4/4');

  addEntry('Feb', 14, 'Q1-2025', 'Maintenance', 'HVAC', 650, 'AC filter replacement - master bedroom');
  addEntry('Feb', 20, 'Q1-2025', 'Management', 'Legal', 3200, 'Lease renewal consultation');
  addEntry('Mar', 5, 'Q1-2025', 'Maintenance', 'Electrical', 1250, 'Light fixture repair - living room');
  addEntry('Mar', 22, 'Q1-2025', 'Utilities', 'Internet', 450, 'Q1 internet service');

  addEntry('Apr', 12, 'Q2-2025', 'Maintenance', 'Plumbing', 890, 'Kitchen sink repair');
  addEntry('May', 3, 'Q2-2025', 'Maintenance', 'HVAC', 4500, 'Annual AC servicing');
  addEntry('May', 18, 'Q2-2025', 'Renovation', 'Painting', 5500, 'Living room repaint');
  addEntry('Jun', 8, 'Q2-2025', 'Maintenance', 'Landscaping', 2200, 'Terrace garden maintenance');
  addEntry('Jun', 22, 'Q2-2025', 'Utilities', 'Internet', 450, 'Q2 internet service');

  addEntry('Jul', 5, 'Q3-2025', 'Insurance', 'Contents Insurance', 2400, 'Annual contents insurance premium');
  addEntry('Jul', 15, 'Q3-2025', 'Maintenance', 'Cleaning', 1800, 'Deep cleaning service');
  addEntry('Aug', 8, 'Q3-2025', 'Maintenance', 'HVAC', 3200, 'AC compressor repair');
  addEntry('Aug', 20, 'Q3-2025', 'Maintenance', 'Landscaping', 6300, 'Terrace renovation - plants');
  addEntry('Sep', 12, 'Q3-2025', 'Management', 'Accounting', 2800, 'Q3 bookkeeping services');
  addEntry('Sep', 22, 'Q3-2025', 'Utilities', 'Internet', 450, 'Q3 internet service');

  addEntry('Oct', 5, 'Q4-2025', 'Maintenance', 'Electrical', 1800, 'Smart home system update');
  addEntry('Oct', 18, 'Q4-2025', 'Renovation', 'Bathroom', 8500, 'Guest bathroom renovation');
  addEntry('Nov', 8, 'Q4-2025', 'Maintenance', 'Landscaping', 4200, 'Winter planting');
  addEntry('Nov', 22, 'Q4-2025', 'Taxes', 'City Tax', 3600, 'Annual city tax');
  addEntry('Dec', 5, 'Q4-2025', 'Maintenance', 'Cleaning', 2400, 'End of year deep clean');
  addEntry('Dec', 15, 'Q4-2025', 'Management', 'Accounting', 3500, 'Annual tax preparation');
  addEntry('Dec', 22, 'Q4-2025', 'Utilities', 'Internet', 450, 'Q4 internet service');

  addEntry('Jan', 12, 'Q1-2025', 'Rental', 'Late Fees', 1650, 'Late payment fee - previous tenant');
  addEntry('Mar', 15, 'Q1-2025', 'Maintenance', 'Cleaning', 1200, 'Move-in cleaning');
  addEntry('Jun', 28, 'Q2-2025', 'Taxes', 'VAT', 4200, 'VAT on services Q1-Q2');
  addEntry('Sep', 28, 'Q3-2025', 'Taxes', 'VAT', 3800, 'VAT on services Q3');
  addEntry('Dec', 28, 'Q4-2025', 'Taxes', 'VAT', 4100, 'VAT on services Q4');

  addEntry('Apr', 25, 'Q2-2025', 'Utilities', 'Gas', 380, 'Q1 gas usage');
  addEntry('Jul', 25, 'Q3-2025', 'Utilities', 'Gas', 420, 'Q2 gas usage');
  addEntry('Oct', 25, 'Q4-2025', 'Utilities', 'Gas', 350, 'Q3 gas usage');

  entries.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  return entries;
}

const dubaiCashflows = generateDubaiCashflows();

export const propertyCashflows: Record<string, CashflowEntry[]> = {
  dubai: dubaiCashflows,
};

export function getCashflowsByPropertyId(propertyId: string): CashflowEntry[] {
  return propertyCashflows[propertyId] || [];
}
