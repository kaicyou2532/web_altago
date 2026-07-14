export const currencies = [
  { code: 'USD', symbol: '$', label: '米ドル' },
  { code: 'JPY', symbol: '¥', label: '日本円' },
  { code: 'EUR', symbol: '€', label: 'ユーロ' },
  { code: 'GBP', symbol: '£', label: '英ポンド' },
  { code: 'KRW', symbol: '₩', label: '韓国ウォン' },
] as const;

export function formatReward(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
  }).format(amount);
}
