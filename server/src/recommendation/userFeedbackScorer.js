import { clamp, minMaxNormalize } from './normalizer.js';
import { DIVERSITY_CONFIG } from './config.js';

/**
 * User Feedback Scorer
 * Translates explicit likes/dislikes/favourites and implicit telemetry (skips, durations)
 * into a personalized score with fatigue avoidance and hard dislike filtering
 */
export class UserFeedbackScorer {
  /**
   * Filter out songs that the user has explicitly disliked
   * @param {Array} candidates - Candidate songs
   * @param {Set|Array} dislikedSongIds - Song IDs user has marked as 'dislike'
   * @returns {Array} Filtered candidate songs
   */
  static filterDisliked(candidates = [], dislikedSongIds = new Set()) {
    const dislikeSet = dislikedSongIds instanceof Set ? dislikedSongIds : new Set(dislikedSongIds.map(String));
    return candidates.filter(song => {
      const sId = song._id ? song._id.toString() : song.id?.toString();
      return !dislikeSet.has(sId);
    });
  }

  /**
   * Calculate personalized feedback score for a song
   * @param {Object} song - Candidate song
   * @param {Object} userSignals - { favourites, likes, skips, history, lastPlayedTimes }
   * @returns {Number} Score in [0, 1]
   */
  static calculateFeedbackScore(song, userSignals = {}) {
    const sId = song._id ? song._id.toString() : song.id?.toString();
    const {
      favourites = new Set(),
      likes = new Set(),
      skips = new Set(),
      playCounts = {},
      lastPlayedTimes = {}
    } = userSignals;

    let baseScore = 0.5; // neutral prior

    // 1. Explicit positive engagement boost
    if (favourites.has(sId)) {
      baseScore += 0.30;
    }
    if (likes.has(sId)) {
      baseScore += 0.20;
    }

    // 2. Play completion history boost
    const timesListened = playCounts[sId] || 0;
    if (timesListened > 0) {
      baseScore += Math.min(0.15, timesListened * 0.03);
    }

    // 3. Skip penalty
    if (skips.has(sId)) {
      baseScore -= 0.25;
    }

    // 4. Repetition Fatigue Decay Penalty
    // Avoid recommending the same track that was played recently
    const lastPlayed = lastPlayedTimes[sId];
    if (lastPlayed) {
      const hoursAgo = Math.max(0, (Date.now() - new Date(lastPlayed).getTime()) / (1000 * 60 * 60));
      const decayHalfLife = DIVERSITY_CONFIG.fatigueDecayHours || 24;
      // Exponential decay: e^(-hoursAgo / halfLife)
      const fatigue = Math.exp(-hoursAgo / decayHalfLife) * 0.35;
      baseScore -= fatigue;
    }

    return clamp(baseScore, 0, 1);
  }

  /**
   * Batch scores candidate songs
   */
  static scoreCandidates(candidates = [], userSignals = {}) {
    const scores = {};
    for (const song of candidates) {
      const sId = song._id ? song._id.toString() : song.id?.toString();
      scores[sId] = this.calculateFeedbackScore(song, userSignals);
    }
    return scores;
  }
}
