import { toDate, isSameDay, shiftDate } from './date';

describe('toDate', () => {
  it('should return the beginning of the date', () => {
    const date = new Date('2018-01-23T23:59:59.999');
    const expected = new Date('2018-01-23T00:00:00.000');
    expect(toDate(date)).toEqual(expected);
  });
});

describe('isSameDay', () => {
  it('should be true when the day is the same', () => {
    const date1 = new Date('2018-01-23T00:00:00');
    const date2 = new Date('2018-01-23T23:59:59');
    expect(isSameDay(date1, date2)).toBeTruthy();
  });

  it('should false when the day is different', () => {
    const date1 = new Date('2018-01-23T00:00:00');
    const date2 = new Date('2018-01-22T23:59:59');
    expect(isSameDay(date1, date2)).toBeFalsy();
  });
});

describe('shiftDate', () => {
  it('should shift dates forward', () => {
    const date = new Date('2018-01-23T12:34:56.789');
    expect(shiftDate(date, 1)).toEqual(new Date('2018-01-24T12:34:56.789'));
  });

  it('should shift dates backward', () => {
    const date = new Date('2018-01-23T12:34:56.789');
    expect(shiftDate(date, -1)).toEqual(new Date('2018-01-22T12:34:56.789'));
  });
});
