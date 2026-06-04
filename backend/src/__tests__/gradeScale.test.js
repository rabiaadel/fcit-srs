// =============================================================================
// Grade Scale Unit Tests — verifies FIX-C4 (40-49% band returns D- not F)
// =============================================================================
const { percentageToPoints, percentageToLetter, isCoursePassed } = require('../services/gpa.service');

describe('Grade Scale - 40-49% Band (FIX-C4)', () => {
  test('percentageToLetter(40) === "D-"', () => {
    expect(percentageToLetter(40)).toBe('D-');
  });

  test('percentageToLetter(49) === "D-"', () => {
    expect(percentageToLetter(49)).toBe('D-');
  });

  test('percentageToPoints(40) === 0.7', () => {
    expect(percentageToPoints(40)).toBe(0.7);
  });

  test('percentageToPoints(49) === 0.7', () => {
    expect(percentageToPoints(49)).toBe(0.7);
  });

  test('isCoursePassed(40, 30) === true', () => {
    expect(isCoursePassed(40, 30)).toBe(true);
  });

  test('percentageToLetter(39) === "F"', () => {
    expect(percentageToLetter(39)).toBe('F');
  });

  test('percentageToPoints(39) === 0', () => {
    expect(percentageToPoints(39)).toBe(0);
  });

  test('isCoursePassed(39, 30) === false', () => {
    expect(isCoursePassed(39, 30)).toBe(false);
  });
});

describe('Grade Scale - Existing Bands Unaffected', () => {
  test('percentageToLetter(50) === "D-" with 1.0 points', () => {
    expect(percentageToLetter(50)).toBe('D-');
    expect(percentageToPoints(50)).toBe(1);
  });

  test('percentageToLetter(96) === "A+"', () => {
    expect(percentageToLetter(96)).toBe('A+');
    expect(percentageToPoints(96)).toBe(4);
  });

  test('percentageToLetter(0) === "F"', () => {
    expect(percentageToLetter(0)).toBe('F');
    expect(percentageToPoints(0)).toBe(0);
  });
});
