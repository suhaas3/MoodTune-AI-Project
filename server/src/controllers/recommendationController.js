import {
  HybridRecommender,
  BaselineRecommender,
  BenchmarkEvaluator,
  CollaborativeFilter,
  DEFAULT_WEIGHTS
} from '../recommendation/index.js';
import { Song, ListeningHistory, Favourite, UserFeedback, User } from '../models/index.js';

// Singleton hybrid engine instance with runtime configurable weights
let hybridEngine = new HybridRecommender();

/**
 * @desc    Get top 10 personalized hybrid recommendations
 * @route   GET /api/recommendations/personalized
 * @access  Private
 */
export const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const { mood, limit = 10 } = req.query;
    const userId = req.user.id;

    // 1. Determine target mood (query param > user profile preference > default)
    const targetMood = mood || req.user.preferredMood || 'Energetic';

    // 2. Fetch user context & catalog songs concurrently
    const [
      userFavorites,
      userFeedbacks,
      userHistory,
      allSongs,
      allInteractions
    ] = await Promise.all([
      Favourite.find({ user: userId }).select('song'),
      UserFeedback.find({ user: userId }),
      ListeningHistory.find({ user: userId }).sort({ playedAt: -1 }).limit(50),
      Song.find({}),
      // Sample recent multi-user interactions to feed collaborative filter
      UserFeedback.find({}).sort({ createdAt: -1 }).limit(500)
    ]);

    // Build sets for fast lookups
    const favouritesSet = new Set(userFavorites.map(f => f.song.toString()));
    const likesSet = new Set(userFeedbacks.filter(fb => fb.action === 'like').map(fb => fb.song.toString()));
    const skipsSet = new Set(userFeedbacks.filter(fb => fb.action === 'skip').map(fb => fb.song.toString()));
    const dislikesSet = new Set(userFeedbacks.filter(fb => fb.action === 'dislike').map(fb => fb.song.toString()));

    // Track play counts & timestamps for fatigue decay
    const playCounts = {};
    const lastPlayedTimes = {};
    userHistory.forEach(h => {
      const sId = h.song?.toString();
      if (sId) {
        playCounts[sId] = (playCounts[sId] || 0) + 1;
        if (!lastPlayedTimes[sId] || new Date(h.playedAt) > new Date(lastPlayedTimes[sId])) {
          lastPlayedTimes[sId] = h.playedAt;
        }
      }
    });

    // 3. Build collaborative user-item matrix from telemetry
    const formattedInteractions = allInteractions.map(fb => ({
      userId: fb.user.toString(),
      songId: fb.song.toString(),
      type: fb.action
    }));
    const { userItemMap } = CollaborativeFilter.buildInteractionMatrix(formattedInteractions);

    // 4. Assemble User Context
    const userContext = {
      userId,
      preferences: {
        preferredGenres: req.user.preferredGenres || [],
        preferredMood: req.user.preferredMood || 'Energetic'
      },
      interactionMatrix: userItemMap,
      signals: {
        favourites: favouritesSet,
        likes: likesSet,
        skips: skipsSet,
        playCounts,
        lastPlayedTimes
      },
      dislikes: dislikesSet,
      favourites: favouritesSet,
      likes: likesSet
    };

    // 5. Generate Top 10 Recommendations
    const topN = Math.max(1, Math.min(20, parseInt(limit, 10)));
    const recommendations = hybridEngine.recommend(userContext, allSongs, targetMood, { topN });

    res.status(200).json({
      success: true,
      targetMood,
      count: recommendations.length,
      method: 'Adaptive-Hybrid-Recommender',
      activeWeights: hybridEngine.weights,
      data: {
        recommendations: recommendations.map(item => ({
          ...item.song.toObject ? item.song.toObject() : item.song,
          recommendationScore: item.totalScore,
          scoreBreakdown: item.scoreBreakdown,
          explanation: item.explanation,
          isColdStartAdapted: item.isColdStartAdapted
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get baseline recommendations (Popularity + Mood Filter) for comparison
 * @route   GET /api/recommendations/baseline
 * @access  Public
 */
export const getBaselineRecommendations = async (req, res, next) => {
  try {
    const { mood = 'Energetic', limit = 10 } = req.query;
    const allSongs = await Song.find({});

    const topN = Math.max(1, Math.min(20, parseInt(limit, 10)));
    const recommendations = BaselineRecommender.recommend(allSongs, mood, topN);

    res.status(200).json({
      success: true,
      targetMood: mood,
      count: recommendations.length,
      method: 'Baseline-Popularity-Mood',
      data: {
        recommendations: recommendations.map(item => ({
          ...item.song.toObject ? item.song.toObject() : item.song,
          recommendationScore: item.totalScore,
          explanation: item.explanation
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Run benchmark comparison between Baseline and Hybrid methods
 * @route   GET /api/recommendations/compare
 * @access  Public
 */
export const compareRecommendations = async (req, res, next) => {
  try {
    const { mood = 'Energetic', userId = 'synth_user_1', topN = 10 } = req.query;

    const benchmarkReport = BenchmarkEvaluator.runComparison(mood, userId, parseInt(topN, 10));

    res.status(200).json({
      success: true,
      message: 'Comparative evaluation between Baseline and Hybrid recommendation methods completed.',
      data: benchmarkReport
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Configure recommendation engine weights dynamically
 * @route   PUT /api/recommendations/weights
 * @access  Private
 */
export const configureWeights = async (req, res, next) => {
  try {
    const { mood, attributes, collaborative, userFeedback } = req.body;

    const newWeights = {};
    if (mood !== undefined) newWeights.mood = Number(mood);
    if (attributes !== undefined) newWeights.attributes = Number(attributes);
    if (collaborative !== undefined) newWeights.collaborative = Number(collaborative);
    if (userFeedback !== undefined) newWeights.userFeedback = Number(userFeedback);

    hybridEngine.setWeights(newWeights);

    res.status(200).json({
      success: true,
      message: 'Recommendation weights updated successfully.',
      data: {
        activeWeights: hybridEngine.weights
      }
    });
  } catch (error) {
    next(error);
  }
};
