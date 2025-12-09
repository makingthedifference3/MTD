export const formatIndianRupee = (value: number): string => {
  const normalized = Number(value) || 0;
  const isNegative = normalized < 0;
  const absoluteValue = Math.abs(normalized);

  const prefix = isNegative ? '-' : '';
  
  // If zero or very small, return with Lakhs notation
  if (!absoluteValue) {
    return '₹0.00 L';
  }

  // Less than 1 lakh - show in actual rupees or small lakhs
  if (absoluteValue < 100000) {
    if (absoluteValue < 1000) {
      return `${prefix}₹${absoluteValue.toFixed(2)}`;
    }
    const lakhs = absoluteValue / 100000;
    return `${prefix}₹${lakhs.toFixed(2)} L`;
  }
  
  // 1 lakh to 99.99 lakhs
  if (absoluteValue < 10000000) {
    const lakhs = absoluteValue / 100000;
    return `${prefix}₹${lakhs.toFixed(2)} L`;
  }
  
  // 1 crore and above
  const crores = absoluteValue / 10000000;
  return `${prefix}₹${crores.toFixed(2)} Cr`;
};
