export function convertToBDT(amount) {
  const numericAmount = Number(amount ?? 0);
  return Number.isFinite(numericAmount) ? numericAmount : 0;
}

export function formatBDT(amount) {
  const numericAmount = convertToBDT(amount);
  return `৳${Math.round(numericAmount).toLocaleString("en-BD")}`;
}
