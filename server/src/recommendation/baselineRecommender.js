import { minMaxNormalize } from './normalizer.js';

/**
 * Baseline Recommender Engine
 * Implements a naive Popularity-Weighted Mood Filter
 * Used as a control baseline to compare performance against the Adaptive Hybrid Engine
 */
export class BaselineRecommender {
  /**
   * Recommend tracks using baseline popularity + basic mood matching
   * @param {Array} candidateSongs - Full catalog of songs
   * @param {String} targetMood - Target mood ('Happy', 'Energetic', etc.)
   * @param {Number} topN - Number of songs to return (default: 10)
   * @returns {Array} Top N baseline recommendations with scores
   */
  static recommend(candidateSongs = [], targetMood = 'Energetic', topN = 10) {
    if (!candidateSongs || candidateSongs.length === 0) return [];

    const scored = candidateSongs.map(song => {
      // 1. Basic Mood match: 1.0 if identical, 0.2 otherwise
      const isMoodMatch = song.mood?.toLowerCase() === targetMood.toLowerCase();
      const moodScore = isMoodMatch ? 0.70 : 0.20;

      // 2. Naive Popularity Score (playCount + likeCount)
      const popularityRaw = (song.playCount || 0) + (song.likeCount || 0) * 10;
      const popularityScore = Math.min(0.30, (popularityRaw / 6000) * 0.30);

      const totalScore = moodScore + popularityScore;

      return {
        song,
        totalScore,
        method: 'Baseline-Popularity-Mood',
        explanation: `Baseline recommendation: Ranked by ${targetMood} mood filter and global play count.`
      };
    });

    // Normalize scores across candidates
    const rawScores = scored.map(s => s.totalScore);
    const normalized = minMaxNormalize(rawScores, 0.3, 0.95);

    scored.forEach((item, idx) => {
      item.totalScore = Math.round(normalized[idx] * 100);
    });

    // Sort descending by score
    scored.sort((a, b) => b.totalScore - a.totalScore);

    return scored.slice(0, topN);
  }
}
