import { DEFAULT_WEIGHTS, COLD_START_WEIGHTS } from './config.js';
import { normalizeScoreMap, clamp } from './normalizer.js';
import { MoodMatcher } from './moodMatcher.js';
import { AttributeMatcher } from './attributeMatcher.js';
import { CollaborativeFilter } from './collaborativeFilter.js';
import { UserFeedbackScorer } from './userFeedbackScorer.js';
import { DiversityFilter } from './diversityFilter.js';
import { ExplainabilityEngine } from './explainability.js';

/**
 * MoodTune AI Adaptive Hybrid Recommender
 * Fuses affective mood modeling, acoustic attribute matching,
 * user-user collaborative filtering, and explicit/implicit feedback
 */
export class HybridRecommender {
  constructor(customWeights = null) {
    this.weights = customWeights ? { ...DEFAULT_WEIGHTS, ...customWeights } : { ...DEFAULT_WEIGHTS };
    this.moodMatcher = new MoodMatcher();
    this.attributeMatcher = new AttributeMatcher();
  }

  /**
   * Set or update recommendation weights dynamically
   * @param {Object} newWeights - { mood, attributes, collaborative, userFeedback }
   */
  setWeights(newWeights = {}) {
    this.weights = {
      ...this.weights,
      ...newWeights
    };
  }

  /**
   * Main recommendation generation function
   * @param {Object} userContext - User signals, preferences, interaction matrix, history
   * @param {Array} candidateSongs - Full catalog of candidate tracks
   * @param {String} targetMood - Target mood ('Happy', 'Energetic', 'Relaxed', 'Sad')
   * @param {Object} options - { topN: 10, maxPerArtist, minGenres }
   * @returns {Array} Top N personalized recommendations with scores and explanations
   */
  recommend(userContext = {}, candidateSongs = [], targetMood = 'Energetic', options = {}) {
    const topN = options.topN || 10;
    const userId = userContext.userId || 'anonymous';

    // 1. Hard Dislike Filter: Exclude songs user explicitly disliked
    const filteredCandidates = UserFeedbackScorer.filterDisliked(
      candidateSongs,
      userContext.dislikes || new Set()
    );

    if (filteredCandidates.length === 0) {
      return [];
    }

    // 2. Cold-Start Detection: If user has 0 previous interactions
    const totalInteractions =
      (userContext.favourites?.size || 0) +
      (userContext.likes?.size || 0) +
      (Object.keys(userContext.playCounts || {}).length);

    const isColdStart = totalInteractions === 0;
    const activeWeights = isColdStart ? COLD_START_WEIGHTS : this.weights;

    // 3. Compute Component Scores Across Candidates
    // A. Mood Alignment Score
    const rawMoodScores = this.moodMatcher.scoreCandidates(filteredCandidates, targetMood);

    // B. Acoustic & Genre Attribute Score
    const rawAttrScores = this.attributeMatcher.scoreCandidates(
      filteredCandidates,
      userContext.preferences || {},
      targetMood
    );

    // C. Collaborative Filtering Score
    const rawCfScores = CollaborativeFilter.predictScores(
      userId,
      filteredCandidates,
      userContext.interactionMatrix || {}
    );

    // D. User Feedback & Recency Decay Score
    const rawUserScores = UserFeedbackScorer.scoreCandidates(
      filteredCandidates,
      userContext.signals || {}
    );

    // 4. Min-Max Normalization: Ensure all components are in [0, 1] before linear combination
    const normMoodScores = normalizeScoreMap(rawMoodScores, 0.1, 1.0);
    const normAttrScores = normalizeScoreMap(rawAttrScores, 0.1, 1.0);
    const normCfScores = normalizeScoreMap(rawCfScores, 0.1, 1.0);
    const normUserScores = normalizeScoreMap(rawUserScores, 0.1, 1.0);

    // 5. Linear Fusion
    const scoredCandidates = filteredCandidates.map(song => {
      const sId = song._id ? song._id.toString() : song.id?.toString();

      const moodPart = normMoodScores[sId] ?? 0.5;
      const attrPart = normAttrScores[sId] ?? 0.5;
      const cfPart = normCfScores[sId] ?? 0.5;
      const userPart = normUserScores[sId] ?? 0.5;

      const totalHybrid =
        (activeWeights.mood * moodPart) +
        (activeWeights.attributes * attrPart) +
        (activeWeights.collaborative * cfPart) +
        (activeWeights.userFeedback * userPart);

      const componentScores = {
        mood: moodPart,
        attributes: attrPart,
        collaborative: cfPart,
        userFeedback: userPart,
        total: clamp(totalHybrid, 0, 1)
      };

      // 6. Generate Explainability
      const { explanation, scoreBreakdown } = ExplainabilityEngine.generateExplanation(
        song,
        componentScores,
        targetMood,
        userContext.preferences
      );

      return {
        song,
        totalScore: Math.round(componentScores.total * 100),
        scoreBreakdown,
        explanation,
        isColdStartAdapted: isColdStart,
        method: 'Adaptive-Hybrid-Recommender'
      };
    });

    // 7. Sort by highest total score descending
    scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);

    // 8. Diversity Reranking: Enforce artist caps and diverse genre representation
    const diverseTopN = DiversityFilter.applyDiversity(scoredCandidates, topN, options);

    return diverseTopN;
  }
}
