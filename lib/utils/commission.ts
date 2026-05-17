export function calculateCommission(priceBDT: number) {
  const rate = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_COMMISSION_RATE || '0.18');
  const platformFee = Math.round(priceBDT * rate);
  const expertEarnings = priceBDT - platformFee;
  return { platformFee, expertEarnings, rate };
}
