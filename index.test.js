const { getReadingStatus } = require('./index');

describe('getReadingStatus', () => {

  test('returns ok for a normal in-range reading', () => {
    expect(getReadingStatus(3, 7)).toBe('ok');
  });

  test('returns ok when exactly on the boundaries', () => {
    expect(getReadingStatus(2, 8)).toBe('ok');
  });

  test('returns excursion when minimum temperature is just below 2', () => {
    expect(getReadingStatus(1.9, 7)).toBe('excursion');
  });

  test('returns excursion when maximum temperature is just above 8', () => {
    expect(getReadingStatus(3, 8.1)).toBe('excursion');
  });

  test('returns excursion when both temperatures are out of range', () => {
    expect(getReadingStatus(1.9, 8.1)).toBe('excursion');
  });

  test('throws an error when no arguments are provided', () => {
    expect(() => getReadingStatus()).toThrow(TypeError);
  });

  test('throws an error when a string is provided', () => {
    expect(() => getReadingStatus('3', 7)).toThrow(TypeError);
  });

  test('throws an error when null is provided', () => {
    expect(() => getReadingStatus(null, 7)).toThrow(TypeError);
  });

});