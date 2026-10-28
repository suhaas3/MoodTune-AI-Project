import { BaselineRecommender } from './baselineRecommender.js';
import { HybridRecommender } from './hybridRecommender.js';
import { DiversityFilter } from './diversityFilter.js';
import {
  SYNTHETIC_USERS,
  SYNTHETIC_INTERACTIONS,
  getSyntheticCatalog,
  IS_SYNTHETIC_DATASET,
  DATASET_TAG
} from './syntheticData.js';
import { CollaborativeFilter } from './collaborativeFilter.js';

/**
 * Benchmark Evaluator
 * Runs comparative evaluation between Baseline (Popularity-Mood Filter)
 * and the Adaptive Hybrid Recommendation Engine
 */
export class BenchmarkEvaluator {
  /**
   * Run comparison on synthetic dataset
   * @param {String} targetMood - Mood under test
   * @param {String} testUserId - User profile under test
   * @param {Number} topN - Number of recommendations
   */
  static runComparison(targetMood = 'Energetic', testUserId = 'synth_user_1', topN = 10) {
    const catalog = getSyntheticCatalog();
    const user = SYNTHETIC_USERS.find(u => u.id === testUserId) || SYNTHETIC_USERS[0];

    // Build interaction matrix from synthetic telemetry
    const { userItemMap } = CollaborativeFilter.buildInteractionMatrix(SYNTHETIC_INTERACTIONS);

    // Extract user explicit and implicit signals
    const userInteractions = SYNTHETIC_INTERACTIONS.filter(i => i.userId === testUserId);
    const favourites = new Set(userInteractions.filter(i => i.type === 'favourite').map(i => i.songId));
    const likes = new Set(userInteractions.filter(i => i.type === 'like').map(i => i.songId));
    const skips = new Set(userInteractions.filter(i => i.type === 'skip').map(i => i.songId));
    const dislikes = new Set(userInteractions.filter(i => i.type === 'dislike').map(i => i.songId));

    const userContext = {
      userId: testUserId,
      preferences: {
        preferredGenres: user.preferredGenres,
        preferredMood: user.preferredMood
      },
      interactionMatrix: userItemMap,
      signals: { favourites, likes, skips },
      dislikes,
      favourites,
      likes
    };

    // 1. Run Baseline Recommender
    const baselineResults = BaselineRecommender.recommend(catalog, targetMood, topN);

    // 2. Run Adaptive Hybrid Recommender
    const hybridEngine = new HybridRecommender();
    const hybridResults = hybridEngine.recommend(userContext, catalog, targetMood, { topN });

    // 3. Compute Comparative Metrics
    const metrics = {
      dataset: {
        isSynthetic: IS_SYNTHETIC_DATASET,
        tag: DATASET_TAG,
        simulatedUser: {
          id: user.id,
          name: user.name,
          cluster: user.cluster,
          isColdStart: user.preferredGenres.length === 0
        }
      },
      baseline: {
        method: 'Popularity-Weighted Mood Filter (Baseline)',
        count: baselineResults.length,
        intraListDiversity: DiversityFilter.computeIntraListDiversity(baselineResults),
        moodPrecision: this.computeMoodPrecision(baselineResults, targetMood),
        dislikedItemsRecommended: this.countDisliked(baselineResults, dislikes)
      },
      hybrid: {
        method: 'Adaptive Hybrid (Mood + Acoustic + CF + Telemetry)',
        count: hybridResults.length,
        intraListDiversity: DiversityFilter.computeIntraListDiversity(hybridResults),
        moodPrecision: this.computeMoodPrecision(hybridResults, targetMood),
        dislikedItemsRecommended: this.countDisliked(hybridResults, dislikes)
      }
    };

    return {
      targetMood,
      metrics,
      baselineRecommendations: baselineResults,
      hybridRecommendations: hybridResults
    };
  }

  static computeMoodPrecision(recommendations = [], targetMood = 'Energetic') {
    if (recommendations.length === 0) return 0;
    const matches = recommendations.filter(item => {
      const song = item.song || item;
      return song.mood?.toLowerCase() === targetMood.toLowerCase();
    });
    return Math.round((matches.length / recommendations.length) * 100);
  }

  static countDisliked(recommendations = [], dislikes = new Set()) {
    return recommendations.filter(item => {
      const song = item.song || item;
      const sId = song._id ? song._id.toString() : song.id;
      return dislikes.has(sId);
    }).length;
  }
}
