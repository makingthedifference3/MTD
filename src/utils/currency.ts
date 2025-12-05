export const formatIndianRupee = (value: number): string => {
  const normalized = Number(value) || 0;
  const isNegative = normalized < 0;
  const absoluteValue = Math.abs(normalized);

  if (!absoluteValue) {
    return '₹0';
  }

  const formatNumber = (num: number) => {
    const formatted = num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    return formatted.replace(/\.00$/, '');
  };

  let result: string;
  if (absoluteValue >= 10000000) {
    result = `₹${formatNumber(absoluteValue / 10000000)} crore`;
  } else if (absoluteValue >= 100000) {
    result = `₹${formatNumber(absoluteValue / 100000)} lakh`;
  } else {
    result = `₹${formatNumber(absoluteValue)}`;
  }

  return isNegative ? `-${result}` : result;
};
