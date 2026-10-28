/**
 * Score Normalization Utilities
 * Ensures fair combination of heterogeneous signals (ratings, BPMs, probabilities)
 */

export const clamp = (val, min = 0, max = 1) => {
  if (isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
};

/**
 * Min-Max normalization mapping array of numbers to [targetMin, targetMax]
 */
export const minMaxNormalize = (values, targetMin = 0, targetMax = 1) => {
  if (!values || values.length === 0) return [];
  if (values.length === 1) return [targetMax];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    // If all scores are identical, map to median
    const mid = (targetMin + targetMax) / 2;
    return values.map(() => mid);
  }

  return values.map(v => {
    const norm = (v - min) / range;
    return clamp(targetMin + norm * (targetMax - targetMin), targetMin, targetMax);
  });
};

/**
 * Normalizes an object map of { [id]: score } into { [id]: normalizedScore }
 */
export const normalizeScoreMap = (scoreMap, targetMin = 0, targetMax = 1) => {
  const keys = Object.keys(scoreMap);
  if (keys.length === 0) return {};

  const values = keys.map(k => scoreMap[k]);
  const normalizedValues = minMaxNormalize(values, targetMin, targetMax);

  const result = {};
  keys.forEach((key, idx) => {
    result[key] = normalizedValues[idx];
  });
  return result;
};
