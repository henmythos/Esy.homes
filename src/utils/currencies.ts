import { Currency, CurrencyInfo, RentalType } from '../types';

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rateToUSD: 83.5 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rateToUSD: 129.0 },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rateToUSD: 58.2 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateToUSD: 18.2 },
  MXN: { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', rateToUSD: 18.1 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.92 },
};

export function formatPrice(amountInINR: number, targetCurrency: Currency = 'INR'): string {
  const curr = CURRENCIES[targetCurrency] || CURRENCIES.INR;
  
  if (targetCurrency === 'INR') {
    return `₹${Math.round(amountInINR).toLocaleString('en-IN')}`;
  }

  // Convert from INR to target currency (via USD base)
  const amountUSD = amountInINR / 83.5;
  const converted = Math.round(amountUSD * curr.rateToUSD);
  
  if (curr.code === 'KES') {
    return `${curr.symbol} ${converted.toLocaleString()}`;
  }
  return `${curr.symbol}${converted.toLocaleString()}`;
}

export function formatRentalRate(priceINR: number, rentalType: RentalType, currency: Currency = 'INR'): string {
  const formattedPrice = formatPrice(priceINR, currency);
  switch (rentalType) {
    case 'daily_rental':
      return `${formattedPrice} / night`;
    case 'pg_hostel':
      return `${formattedPrice} / month`;
    case 'monthly_room':
      return `${formattedPrice} / month`;
    default:
      return `${formattedPrice} / night`;
  }
}

