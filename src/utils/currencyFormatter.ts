/**
 * Format currency amount in Indian format (Lakhs and Crores)
 * @param amount - The amount to format
 * @param showSymbol - Whether to show ₹ symbol (default: true)
 * @returns Formatted string like "9.25 L" or "1.50 Cr"
 */
export const formatIndianCurrency = (amount: number | null | undefined, showSymbol: boolean = true): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0.00 L' : '0.00 L';
  }

  const absoluteAmount = Math.abs(amount);
  const isNegative = amount < 0;
  const prefix = isNegative ? '-' : '';
  const symbol = showSymbol ? '₹' : '';

  // Less than 1 lakh - show in thousands or actual amount
  if (absoluteAmount < 100000) {
    if (absoluteAmount < 1000) {
      return `${prefix}${symbol}${absoluteAmount.toFixed(2)}`;
    }
    // Show in lakhs with more decimals for small amounts
    const lakhs = absoluteAmount / 100000;
    return `${prefix}${symbol}${lakhs.toFixed(2)} L`;
  }
  
  // 1 lakh to 99.99 lakhs - show in Lakhs
  if (absoluteAmount < 10000000) {
    const lakhs = absoluteAmount / 100000;
    return `${prefix}${symbol}${lakhs.toFixed(2)} L`;
  }
  
  // 1 crore and above - show in Crores
  const crores = absoluteAmount / 10000000;
  return `${prefix}${symbol}${crores.toFixed(2)} Cr`;
};

/**
 * Format currency for display in tables and cards
 * Shorter version without symbol for compact display
 */
export const formatCurrencyCompact = (amount: number | null | undefined): string => {
  return formatIndianCurrency(amount, false);
};

/**
 * Format currency with symbol for full display
 */
export const formatCurrencyFull = (amount: number | null | undefined): string => {
  return formatIndianCurrency(amount, true);
};
