export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

export function formatBDTFull(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function parseBDT(value: string): number {
  return parseFloat(value.replace(/[৳,]/g, ''));
}
