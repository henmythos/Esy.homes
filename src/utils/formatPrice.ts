/**
 * Indian Price Formatter for ezy.homes
 *
 * Formats INR amounts in the Indian numbering system (Lakhs / Crores).
 * Examples:
 *   1000       → ₹1,000
 *   50000      → ₹50,000
 *   150000     → ₹1.5 Lakh
 *   4500000    → ₹45 Lakhs
 *   10000000   → ₹1 Crore
 *   25000000   → ₹2.5 Crore
 */

export function formatINR(amount: number, compact = false): string {
  if (!amount || isNaN(amount)) return '₹0';

  if (compact) {
    if (amount >= 1_00_00_000) {
      const crore = amount / 1_00_00_000;
      return `₹${crore % 1 === 0 ? crore : crore.toFixed(2)} Cr`;
    }
    if (amount >= 1_00_000) {
      const lakh = amount / 1_00_000;
      return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(1)} L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  }

  // Full Indian format: Crores
  if (amount >= 1_00_00_000) {
    const crore = amount / 1_00_00_000;
    const display = crore % 1 === 0 ? crore.toString() : crore.toFixed(2);
    return `₹${display} Crore`;
  }

  // Lakhs
  if (amount >= 1_00_000) {
    const lakh = amount / 1_00_000;
    const display = lakh % 1 === 0 ? lakh.toString() : lakh.toFixed(1);
    return `₹${display} Lakh${lakh >= 2 ? 's' : ''}`;
  }

  // Thousands with Indian comma format
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Formats a rental price with period suffix.
 * e.g. ₹12,500/month or ₹1,500/night
 */
export function formatRentINR(amount: number, period: 'night' | 'month' | 'year' = 'month'): string {
  const periodLabel = period === 'night' ? '/night' : period === 'year' ? '/year' : '/month';
  return `${formatINR(amount)}${periodLabel}`;
}

/**
 * Formats a sale price in the most legible Indian format.
 * e.g. ₹45 Lakhs, ₹2.5 Crore
 */
export function formatSalePrice(amount: number): string {
  return formatINR(amount, false);
}
