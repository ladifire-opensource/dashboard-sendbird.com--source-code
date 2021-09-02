import { DAYS_PER_MONTH_OF_TERM } from '@constants';

/* when calculate voucher duration, a month is counted as DAYS_PER_MONTH_OF_TERM(31) days, but a year (12 months) is counted as 365 days. (e.g. 31 → 1 month, 62 → 2 months, ..., 341 → 11 months, 365 → 12 months */
export const getDurationMonths = (durationDays: number) => Math.ceil(durationDays / DAYS_PER_MONTH_OF_TERM);
