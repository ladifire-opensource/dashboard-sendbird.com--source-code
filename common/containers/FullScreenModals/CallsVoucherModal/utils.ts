import numbro from 'numbro';

export const formatCurrency = (value: number) => `$${numbro(value).format('0,0.00')}`;

export const formatPercentage = (value: number) =>
  numbro(value).format({ output: 'percent', mantissa: 2, optionalMantissa: true });
