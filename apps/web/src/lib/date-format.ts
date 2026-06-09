export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

type DateInput = Date | string | number;

const toDate = (value: DateInput) => value instanceof Date ? value : new Date(value);

export function formatVietnamDateTime(value: DateInput, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIME_ZONE,
    ...options,
  }).format(toDate(value));
}

export function formatVietnamDate(value: DateInput, options: Intl.DateTimeFormatOptions = {}) {
  return formatVietnamDateTime(value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  });
}

export function formatVietnamTime(value: DateInput, options: Intl.DateTimeFormatOptions = {}) {
  return formatVietnamDateTime(value, {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}
