import { zonedToLocal, localToZoned, parseInZone } from './timezones';

describe('zonedToLocal', () => {
  it('should make a local time from a zoned time', () => {
    const date = new Date('2018-01-23T12:34:56.789+1100');
    const expected = new Date('2018-01-23T12:34:56.789');
    expect(zonedToLocal(date, 'Australia/Sydney')).toEqual(expected);
  });

  it('should make a local time from a UTC time', () => {
    const date = new Date('2018-01-23T12:34:56.789Z');
    const expected = new Date('2018-01-23T12:34:56.789');
    expect(zonedToLocal(date, 'UTC')).toEqual(expected);
  });

  it('should round-trip through localToZoned', () => {
    const date = new Date('2018-01-23T12:34:56.789Z');
    const actual = localToZoned(zonedToLocal(date, 'UTC'), 'UTC');
    expect(actual).toEqual(date);
  });
});

describe('localToZoned', () => {
  it('should make a zoned time from a local time', () => {
    const date = new Date('2018-01-23T12:34:56.789');
    const expected = new Date('2018-01-23T12:34:56.789+1100');
    expect(localToZoned(date, 'Australia/Sydney')).toEqual(expected);
  });

  it('should make a UTC time from a local time', () => {
    const date = new Date('2018-01-23T12:34:56.789');
    const expected = new Date('2018-01-23T12:34:56.789Z');
    expect(localToZoned(date, 'UTC')).toEqual(expected);
  });

  it('should round-trip through zonedToLocal', () => {
    const date = new Date('2018-01-23T12:34:56.789Z');
    const actual = zonedToLocal(localToZoned(date, 'UTC'), 'UTC');
    expect(actual).toEqual(date);
  });
});

describe('parseInZone', () => {
  it('should parse strings without explicit zones', () => {
    const str = '2018-01-23T12:34:56.789';
    const expected = new Date('2018-01-23T12:34:56.789+1100');
    expect(parseInZone(str, 'Australia/Sydney')).toEqual(expected);
  });

  it('should parse strings with an explicit zones', () => {
    const str = '2018-01-23T12:34:56.789+0000';
    const expected = new Date('2018-01-23T12:34:56.789+0000');
    expect(parseInZone(str, 'Australia/Sydney')).toEqual(expected);
  });
});
