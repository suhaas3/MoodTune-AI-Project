import { clamp, minMaxNormalize } from './normalizer.js';

/**
 * Collaborative Filtering Engine
 * Implements Memory-Based User-User Collaborative Filtering
 * Predicts song affinity using preference patterns of similar users
 */
export class CollaborativeFilter {
  /**
   * Build interaction matrix from feedback, favourites, and history records
   * @param {Array} interactions - Array of { userId, songId, type, weight }
   */
  static buildInteractionMatrix(interactions = []) {
    const userItemMap = {}; // { userId: { songId: implicitScore } }
    const allSongIds = new Set();

    for (const record of interactions) {
      const uId = record.userId?.toString();
      const sId = record.songId?.toString();
      if (!uId || !sId) continue;

      allSongIds.add(sId);
      if (!userItemMap[uId]) {
        userItemMap[uId] = {};
      }

      // Interaction weights:
      // Favourite: +3.0, Like: +2.5, Complete: +1.5, Partial Play: +0.5, Skip: -1.5, Dislike: -3.0
      let weight = record.weight !== undefined ? record.weight : 1.0;
      if (record.type === 'favourite') weight = 3.0;
      else if (record.type === 'like') weight = 2.5;
      else if (record.type === 'complete') weight = 1.5;
      else if (record.type === 'skip') weight = -1.5;
      else if (record.type === 'dislike') weight = -3.0;

      userItemMap[uId][sId] = (userItemMap[uId][sId] || 0) + weight;
    }

    return { userItemMap, allSongIds: Array.from(allSongIds) };
  }

  /**
   * Calculate Cosine Similarity between two user rating vectors
   */
  static cosineSimilarity(ratingsA = {}, ratingsB = {}) {
    const commonSongs = Object.keys(ratingsA).filter(sId => ratingsB[sId] !== undefined);
    if (commonSongs.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const sId of Object.keys(ratingsA)) {
      normA += Math.pow(ratingsA[sId], 2);
    }
    for (const sId of Object.keys(ratingsB)) {
      normB += Math.pow(ratingsB[sId], 2);
    }

    for (const sId of commonSongs) {
      dotProduct += ratingsA[sId] * ratingsB[sId];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Predict scores for candidate songs for target user
   * @param {String} targetUserId
   * @param {Array} candidateSongs - Array of song objects
   * @param {Object} userItemMap - { userId: { songId: rating } }
   * @returns {Object} { [songId]: scoreIn[0,1] }
   */
  static predictScores(targetUserId, candidateSongs, userItemMap = {}) {
    const targetRatings = userItemMap[targetUserId] || {};
    const otherUserIds = Object.keys(userItemMap).filter(id => id !== targetUserId);

    // If target user is brand new or alone in system (cold start), return global collaborative prior
    if (Object.keys(targetRatings).length === 0 || otherUserIds.length === 0) {
      return this.computeGlobalPopularityPrior(candidateSongs, userItemMap);
    }

    // 1. Calculate similarity with all other users
    const similarities = {};
    for (const otherId of otherUserIds) {
      const sim = this.cosineSimilarity(targetRatings, userItemMap[otherId]);
      if (sim > 0.05) { // Only consider positively correlated neighbors
        similarities[otherId] = sim;
      }
    }

    const neighborIds = Object.keys(similarities);
    if (neighborIds.length === 0) {
      return this.computeGlobalPopularityPrior(candidateSongs, userItemMap);
    }

    // 2. Predict rating for each candidate track
    const rawScores = {};
    for (const song of candidateSongs) {
      const sId = song._id ? song._id.toString() : song.id;
      let numerator = 0;
      let denominator = 0;

      for (const nId of neighborIds) {
        const neighborRating = userItemMap[nId][sId];
        if (neighborRating !== undefined) {
          const sim = similarities[nId];
          numerator += sim * neighborRating;
          denominator += Math.abs(sim);
        }
      }

      rawScores[sId] = denominator > 0 ? numerator / denominator : 0;
    }

    // 3. Min-Max normalize predictions to [0, 1]
    const songIds = Object.keys(rawScores);
    const scoreValues = songIds.map(id => rawScores[id]);
    const normalizedValues = minMaxNormalize(scoreValues, 0, 1);

    const result = {};
    songIds.forEach((id, idx) => {
      result[id] = normalizedValues[idx];
    });

    return result;
  }

  /**
   * Fallback for cold start: normalized community affinity based on aggregate positive interactions
   */
  static computeGlobalPopularityPrior(candidateSongs, userItemMap = {}) {
    const rawScores = {};

    for (const song of candidateSongs) {
      const sId = song._id ? song._id.toString() : song.id;
      let aggregate = 0;

      for (const uId of Object.keys(userItemMap)) {
        const rating = userItemMap[uId][sId];
        if (rating) aggregate += Math.max(0, rating);
      }

      // Add catalog baseline popularity
      aggregate += (song.playCount || 0) * 0.01 + (song.likeCount || 0) * 0.1;
      rawScores[sId] = aggregate;
    }

    const songIds = Object.keys(rawScores);
    const scoreValues = songIds.map(id => rawScores[id]);
    const normalized = minMaxNormalize(scoreValues, 0.2, 0.8);

    const result = {};
    songIds.forEach((id, idx) => {
      result[id] = normalized[idx];
    });
    return result;
  }
}
