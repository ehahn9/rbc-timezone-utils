import moment from 'moment-timezone';

/**
 * Returns the date portion only (e.g. T00:00:00).
 *
 * @param {*} d
 */
export const toDate = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Returns true if two dates are the same (ignoring times).
 *
 * @param {*} a
 * @param {*} b
 */
export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Shift the date +/- an amount
 *
 * It is safe to do this with simple epoch-ticks math
 * since yesterday is always exactly 24 hours before today.
 *
 * @param {*} d
 * @param {*} n
 */
export const shiftDate = (d, n) => shift(d, n * 24 * 60 * 60 * 1000);

/**
 * Shift the hours +/- an amount
 *
 * It is safe to do this with simple epoch-ticks math
 * since yesterday is always exactly 24 hours before today.
 *
 * @param {*} d
 * @param {*} n
 */
export const shiftHour = (d, n) => shift(d, n * 60 * 60 * 1000);

/**
 * Determines whether there is a time value other than 00:00:00 local
 *
 *
 * @param {*} d
 */
export const hasTime = (d) => {
  return (
    d.getHours() ||
    d.getMinutes() ||
    d.getSeconds() ||
    d.getMilliseconds()
  );
};

/**
 * Like moment.duration.humanize() but with better handling of minutes/hours
 *
 */
export const humanizedDuration = (start, end) => {
  const diff = moment(end).diff(start);
  const duration = moment.duration(diff);
  const minutes = duration.asMinutes();
  if (minutes <= 60 || (minutes % 60 === 0)) return duration.humanize();
  return `${(minutes / 60.0).toFixed(1)} hours`;
};

const shift = (d, millis) => new Date(d.valueOf() + millis);
