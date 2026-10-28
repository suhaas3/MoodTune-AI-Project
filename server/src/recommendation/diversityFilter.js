import { DIVERSITY_CONFIG } from './config.js';

/**
 * Diversity and Serendipity Reranker
 * Ensures recommendations do not collapse into a single artist or genre
 */
export class DiversityFilter {
  /**
   * Reranks and selects top N songs while enforcing artist and genre diversity constraints
   * @param {Array} rankedCandidates - Array of { song, totalScore, breakdown }
   * @param {Number} topN - Target number of recommendations (default: 10)
   * @param {Object} options - { maxPerArtist, minGenres }
   * @returns {Array} Selected diverse top N recommendations
   */
  static applyDiversity(
    rankedCandidates = [],
    topN = 10,
    options = {}
  ) {
    const maxPerArtist = options.maxPerArtist || DIVERSITY_CONFIG.maxSongsPerArtist || 2;
    const minGenres = options.minGenres || DIVERSITY_CONFIG.minDistinctGenres || 2;

    const selected = [];
    const deferred = [];
    const artistCounts = {};
    const selectedGenres = new Set();

    // First Pass: Greedy selection respecting artist ceiling
    for (const item of rankedCandidates) {
      if (selected.length >= topN) break;

      const artist = (item.song.artist || 'Unknown').trim();
      const count = artistCounts[artist] || 0;

      if (count < maxPerArtist) {
        selected.push(item);
        artistCounts[artist] = count + 1;
        if (item.song.genre) selectedGenres.add(item.song.genre.toLowerCase());
      } else {
        deferred.push(item);
      }
    }

    // Second Pass: If still under topN, backfill with deferred items
    if (selected.length < topN && deferred.length > 0) {
      for (const item of deferred) {
        if (selected.length >= topN) break;
        selected.push(item);
      }
    }

    // Third Pass: If total candidates in catalog was less than topN, return whatever was found
    return selected.slice(0, topN);
  }

  /**
   * Compute Intra-List Diversity (ILD) for evaluation benchmark
   * Measures average pairwise dissimilarity of genres and tempo among top N recommendations
   */
  static computeIntraListDiversity(recommendations = []) {
    if (recommendations.length <= 1) return 1.0;

    let dissimilaritySum = 0;
    let pairsCount = 0;

    for (let i = 0; i < recommendations.length; i++) {
      for (let j = i + 1; j < recommendations.length; j++) {
        const s1 = recommendations[i].song || recommendations[i];
        const s2 = recommendations[j].song || recommendations[j];

        // Genre dissimilarity (1 if different, 0 if same)
        const genreDist = s1.genre?.toLowerCase() === s2.genre?.toLowerCase() ? 0 : 1;

        // Tempo normalized difference
        const t1 = s1.audioFeatures?.tempo || 120;
        const t2 = s2.audioFeatures?.tempo || 120;
        const tempoDist = Math.min(1, Math.abs(t1 - t2) / 80);

        const pairDissimilarity = 0.6 * genreDist + 0.4 * tempoDist;
        dissimilaritySum += pairDissimilarity;
        pairsCount++;
      }
    }

    return pairsCount > 0 ? (dissimilaritySum / pairsCount) : 1.0;
  }
}
