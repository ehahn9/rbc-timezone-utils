/**
 * Time zone aware date methods
 *
 * Much of this has to do with time zones. See https://codesandbox.io/s/j2p1904p19 for
 * a live example of these concepts.
 *
 * I spent a lot of time wrestling with time zone support. Here's what I've learned:
 *
 * Dates are always stored as miilliseconds past 1/1/1970T00:00:00. Let's refere to
 * that as a "UTC time". Most of the time, the zone is presentational (think of
 * console.log or some UI component). You need to be zone-aware in a few cases (see below):
 *
 * 1) If you want to know the date of a utc time, you can't just look at year/month/date because
 * getDate() will return the date in local (browser) time and getUTCDate() will return the
 * date in UTC time. If you want to know the date in Sydney so need to do something like this:
 *
 *    date = new Date('2018-01-15T01:00:00-0500')
 *    date2 = zonedToLocal(date, 'America/New_York');
 *
 *    // assuming your browser is pacific (-0800)
 *
 *    // the original UTC time presents as the equivelent time in the browser's
 *    // time zone:
 *    console.log(date)   // 2018-01-14T22:00:00-0800
 *
 *    // but zonedToLocal effectively strips the zone out so we get the
 *    // original times year/month/date/hour/minute/second in the browser's
 *    // local zone:
 *    console.log(date2)  // 2018-01-15T01:00:00-0800
 *
 *
 * 2) The ideal components would take a time and a zone. Changing the zone would change
 * the behavior of the component, etc. However some components (notably react-big-calendar)
 * work only in "local" (browser) time. For components like that, you need to "fake out"
 * the component and give it local times which have the same y/m/d h:m:s as the zoned time.
 * And you need to do the same on the reverse. See stripZone() and addZone().
 *
 * 3) Sometimes you're given a parseable date string separately from its time zone. See
 * parseInZone() for that.
 *
 */

import { sortBy, map } from 'lodash';
import moment from 'moment-timezone';

const TIMEZONES = Object.freeze(require('./timezones.json'));
const COMMON_ZONES = Object.freeze(sortZones(Object.keys(TIMEZONES)));

/**
 * Logically "removes" a time zone, returning a local time with the same values as the zoned time.
 *
 * Use this when you need to supply a zoned time to a time zone unaware method
 * or component. It basically strips the zone away without changing any of the
 * values:
 *
 *    date = new Date('2018-01-15T01:00:00-0500')
 *    date2 = zonedToLocal(date, 'America/New_York');
 *
 *    // assuming your browser is pacific (-0800)
 *
 *    // the original UTC time presents as the equivelent time in the browser's
 *    // time zone:
 *    console.log(date)   // 2018-01-14T22:00:00-0800
 *
 *    // but zonedToLocal effectively strips the zone out so we get the
 *    // original times year/month/date/hour/minute/second in the browser's
 *    // local zone:
 *    console.log(date2)  // 2018-01-15T01:00:00-0800
 *
 *
 * Relies on the fact that the new Date(year, month, day, ...) constructor constructs a local
 * time with those values. So we just pass the values we want.
 *
 * @param {*} t
 * @param {*} zone
 */
export const zonedToLocal = (t, zone) => {
  const m = moment(t).tz(zone);
  return new Date(
    m.year(),
    m.month(),
    m.date(),
    m.hour(),
    m.minute(),
    m.second(),
    m.millisecond()
  );
};

/**
 * Locally "adds" a time zone, returning a zoned time with the same values as the local time.
 *
 * Use this when you receive an unzoned time from a time zone unaware method
 * or component. It basically adds a time zone value without changing the
 * underlying values:
 *
 *    const date = new Date("2018-01-15T17:00:00")  // 5pm on the 15th, browser time
 *    addZone(date, 'Australia/Sydney')             // => 2018-01-15T17:00:00+1100 -- 5pm on the 15th, Sydney time
 *    addZone(date, 'America/Los_Angeles')          // => 2018-01-15T17:00:00+0800 -- 5pm on the 15th, New York time
 *
 * Think of this as the inverse of stripTime:
 *
 *    time = new Date();
 *    zone = 'America/Chicago'
 *    assert(addZone(stripZone(time, zone), zon) === time)
 *
 * @param {*} t
 * @param {*} zone
 */
export const localToZoned = (t, zone) =>
  moment.tz([
    t.getFullYear(),
    t.getMonth(),
    t.getDate(),
    t.getHours(),
    t.getMinutes(),
    t.getSeconds(),
    t.getMilliseconds()
  ], zone).toDate();

/**
 * Parses date strings.
 * Unlike new Date(str), unzoned inputs are parsed in the specified zone.
 * If no zone is supplied, this is just like new Date(str).
 *
 * @param {*} str
 * @param {*} zone
 */
export const parseInZone = (str, zone) =>
  zone ? moment.tz(str, zone).toDate() : new Date(str);

  /**
 * Format a datetime, optionally first converting to another time zone.
 * The format strings are from moment and moment-timezone:
 * https://momentjs.com/docs/#/displaying/format/
 * https://momentjs.com/timezone/docs/#/using-timezones/formatting/
 *
 * @param {*} t
 * @param {*} format
 * @param {*} zone
 */
export const formatInZone = (t, format, zone) => toMoment(t, zone).format(format);

/**
 * Gets the current (browser) time zone value.
 *
 * Note that this isn't the same as the time zones human readable display name.
 * For example, "Pacific/Honolulu" and "US/Pacific" are both known as "Hawaii Time".
 */
export const currentZone = moment.tz.guess;

/**
 * Gets a list of common timezones, nominally sorted in a reasonable
 * order
 */
export const getCommonZones = () => COMMON_ZONES;

/**
 * Returns a human-readable name for a time zone.
 *
 * If we know this zone in our timezones.json file, we use
 * the friendly name there, otherwise we reformat the
 * IANA zone name.
 *
 * We also embellish the name with the GMT offset.
 *
 * @param {*} zone
 */
export function humanizeZone(zone) {
  const offset = moment.tz(Date.now(), zone).format('Z');
  const name = TIMEZONES[zone] || beautify(zone);
  return `(GMT${offset}) ${name}`;
}

function beautify(zone) {
  return zone.replace(/_/, ' ');
}

/**
 * Provides a sort key for time zone names.
 *
 * We sort first by the GMT offset, then by the zone name itself.
 *
 * @param {*} zone
 */

function sortZones(zones) {
  const nowM = moment(Date.now());
  zones = zones.map(z => ({ name: z, offset: parseInt(nowM.tz(z).format('ZZ')) }));
  zones = sortBy(zones, ['offset', 'name']);
  return map(zones, 'name');
}

const toMoment = (d, zone) => zone ? moment(d).tz(zone) : moment(d);
// LATER: lazy-load the TIMEZONES since there's a startup delay in requiring the data file
