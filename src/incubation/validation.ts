/** Strict ISO-8601 timestamp guard. Date.parse alone accepts non-ISO strings and invalid dates. */
export function assertIso8601Timestamp(value: string, field: string): void {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!match) throw new Error(`${field} must be a valid ISO-8601 timestamp with timezone`);
  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw, secondRaw, , zone, offsetHourRaw, offsetMinuteRaw] = match;
  const year = Number(yearRaw), month = Number(monthRaw), day = Number(dayRaw);
  const hour = Number(hourRaw), minute = Number(minuteRaw), second = Number(secondRaw);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysByMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysInMonth = daysByMonth[month - 1] ?? 0;
  const offsetHour = Number(offsetHourRaw ?? 0), offsetMinute = Number(offsetMinuteRaw ?? 0);
  if (
    month < 1 || month > 12 || day < 1 || day > daysInMonth ||
    hour > 23 || minute > 59 || second > 59 ||
    (zone !== "Z" && (offsetHour > 23 || offsetMinute > 59)) ||
    !Number.isFinite(Date.parse(value))
  ) throw new Error(`${field} must be a valid ISO-8601 timestamp with timezone`);
}

export function requireNonEmptyRef(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required`);
  if (normalized !== value) throw new Error(`${field} cannot have surrounding whitespace`);
  return normalized;
}
