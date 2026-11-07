export function parseBrDate(value: string) {
  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12);
}

export function parseIsoDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function latestDate(dates: Array<Date | null>, fallback = new Date()) {
  const validDates = dates.filter((date): date is Date => date !== null);
  return validDates.length
    ? new Date(Math.max(...validDates.map((date) => date.getTime())))
    : fallback;
}

export function formatPercentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? '0%' : '+100%';
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1).replace('.', ',')}%`;
}
