import { MOOD_PROFILES } from './config.js';
import { clamp } from './normalizer.js';

/**
 * Mood Matching Module
 * Computes affective alignment between user selected mood and song features
 */
export class MoodMatcher {
  constructor(profiles = MOOD_PROFILES) {
    this.profiles = profiles;
  }

  /**
   * Score how well a song matches the target mood
   * @param {Object} song - Song metadata with audioFeatures & moodConfidence
   * @param {String} targetMood - 'Happy' | 'Energetic' | 'Relaxed' | 'Sad'
   * @returns {Number} Score between 0.0 and 1.0
   */
  calculateMoodScore(song, targetMood) {
    if (!targetMood || !this.profiles[targetMood]) {
      return 0.5; // neutral fallback
    }

    const profile = this.profiles[targetMood];

    // 1. Discrete label match (weight: 50%)
    const isDirectMatch = song.mood?.toLowerCase() === targetMood.toLowerCase();
    const labelScore = isDirectMatch ? 1.0 : 0.0;

    // 2. Continuous mood confidence distribution from classifier (weight: 25%)
    let confidenceScore = 0.25;
    if (song.moodConfidence && song.moodConfidence[targetMood] !== undefined) {
      confidenceScore = song.moodConfidence[targetMood];
    } else if (isDirectMatch) {
      confidenceScore = 0.85;
    }

    // 3. Continuous 2D Valence-Arousal Euclidean distance (weight: 25%)
    const valence = song.audioFeatures?.valence ?? 0.5;
    const arousal = song.audioFeatures?.arousal ?? 0.5;

    const vaDistance = Math.sqrt(
      Math.pow(valence - profile.valence, 2) +
      Math.pow(arousal - profile.arousal, 2)
    );
    // Max distance on unit square is sqrt(2) ≈ 1.4142
    const vaProximity = clamp(1 - (vaDistance / Math.SQRT2), 0, 1);

    const rawScore = (0.50 * labelScore) + (0.25 * confidenceScore) + (0.25 * vaProximity);
    return clamp(rawScore, 0, 1);
  }

  /**
   * Batch scores an array of candidate songs
   */
  scoreCandidates(candidates, targetMood) {
    const scores = {};
    for (const song of candidates) {
      const songId = song._id ? song._id.toString() : song.id;
      scores[songId] = this.calculateMoodScore(song, targetMood);
    }
    return scores;
  }
}
