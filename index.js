/**
 * Checks whether a fridge temperature reading is within the safe range.
 *
 * Safe range:
 * - Minimum temperature must not be below 2°C.s
 * - Maximum temperature must not be above 8°C.
 *
 * @param {number} minTempC - The lowest recorded temperature.
 * @param {number} maxTempC - The highest recorded temperature.
 * @returns {'ok' | 'excursion'} The status of the reading.
 * @throws {TypeError} If either input is missing or is not a valid number.
 */
function getReadingStatus(minTempC, maxTempC) {
  // Reject missing values, strings, null, NaN and Infinity.
  if (!Number.isFinite(minTempC) || !Number.isFinite(maxTempC)) {
    throw new TypeError(
      'minTempC and maxTempC must both be valid numbers'
    );
  }

  // A reading is an excursion if either limit is outside the safe range.
  if (minTempC < 2 || maxTempC > 8) {
    return 'Excursion Risk';
  }

  return 'Ok';
}

module.exports = { getReadingStatus };