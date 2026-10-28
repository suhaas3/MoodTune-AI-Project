import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  HybridRecommender,
  BaselineRecommender,
  MoodMatcher,
  AttributeMatcher,
  CollaborativeFilter,
  UserFeedbackScorer,
  DiversityFilter,
  ExplainabilityEngine,
  BenchmarkEvaluator,
  DEFAULT_WEIGHTS,
  COLD_START_WEIGHTS,
  getSyntheticCatalog
} from '../recommendation/index.js';
import { minMaxNormalize, normalizeScoreMap } from '../recommendation/normalizer.js';

describe('MoodTune AI — Recommendation Engine Unit & Algorithmic Tests', () => {

  const sampleCatalog = getSyntheticCatalog();

  // 1. Normalization Tests
  describe('Score Normalizer Module', () => {
    it('minMaxNormalize should map values strictly to [0, 1]', () => {
      const raw = [10, 20, 30, 40, 50];
      const norm = minMaxNormalize(raw, 0, 1);
      assert.equal(norm[0], 0);
      assert.equal(norm[4], 1);
      assert.equal(norm[2], 0.5);
    });

    it('minMaxNormalize handles identical values gracefully', () => {
      const raw = [5, 5, 5];
      const norm = minMaxNormalize(raw, 0, 1);
      assert.deepEqual(norm, [0.5, 0.5, 0.5]);
    });

    it('normalizeScoreMap should normalize dictionary of scores', () => {
      const map = { s1: 100, s2: 200, s3: 300 };
      const normMap = normalizeScoreMap(map, 0, 1);
      assert.equal(normMap.s1, 0);
      assert.equal(normMap.s2, 0.5);
      assert.equal(normMap.s3, 1);
    });
  });

  // 2. Mood Matcher Tests
  describe('Mood Matcher (Russell Circumplex Alignment)', () => {
    const moodMatcher = new MoodMatcher();

    it('should assign highest score to directly matching mood with high valence/arousal', () => {
      const energeticSong = sampleCatalog.find(s => s.id === 's-2'); // Neon Overdrive (Energetic)
      const sadSong = sampleCatalog.find(s => s.id === 's-4');       // Echoes in the Rain (Sad)

      const energeticScore = moodMatcher.calculateMoodScore(energeticSong, 'Energetic');
      const sadScore = moodMatcher.calculateMoodScore(sadSong, 'Energetic');

      assert.ok(energeticScore > sadScore);
      assert.ok(energeticScore >= 0.85);
      assert.ok(sadScore <= 0.45);
    });

    it('should return neutral baseline score for unknown mood target', () => {
      const song = sampleCatalog[0];
      const score = moodMatcher.calculateMoodScore(song, 'UnknownMood');
      assert.equal(score, 0.5);
    });
  });

  // 3. Attribute Matcher Tests
  describe('Music Attribute Matcher (Genre, Tempo, Acoustics)', () => {
    const attrMatcher = new AttributeMatcher();

    it('should reward songs whose tempo matches target mood profile (Gaussian bell curve)', () => {
      const fastTrack = { genre: 'Synthwave', audioFeatures: { tempo: 140, energy: 0.9, danceability: 0.8 } };
      const slowTrack = { genre: 'Synthwave', audioFeatures: { tempo: 60, energy: 0.9, danceability: 0.8 } };

      // Energetic target tempo is ~142 BPM
      const scoreFast = attrMatcher.calculateAttributeScore(fastTrack, { preferredGenres: ['Synthwave'] }, 'Energetic');
      const scoreSlow = attrMatcher.calculateAttributeScore(slowTrack, { preferredGenres: ['Synthwave'] }, 'Energetic');

      assert.ok(scoreFast > scoreSlow);
    });

    it('should boost score when song genre matches user preferred genres', () => {
      const popTrack = { genre: 'Indie Pop', audioFeatures: { tempo: 120 } };
      const metalTrack = { genre: 'Heavy Metal', audioFeatures: { tempo: 120 } };

      const userPrefs = { preferredGenres: ['Indie Pop'] };
      const scorePop = attrMatcher.calculateAttributeScore(popTrack, userPrefs, 'Happy');
      const scoreMetal = attrMatcher.calculateAttributeScore(metalTrack, userPrefs, 'Happy');

      assert.ok(scorePop > scoreMetal);
    });
  });

  // 4. Collaborative Filtering Tests
  describe('Collaborative Filtering Engine (User-User Cosine Sim)', () => {
    it('cosineSimilarity should return 1.0 for identical rating vectors', () => {
      const ratings = { 's-1': 3.0, 's-2': 2.5, 's-3': -1.5 };
      const sim = CollaborativeFilter.cosineSimilarity(ratings, ratings);
      assert.ok(Math.abs(sim - 1.0) < 0.0001);
    });

    it('cosineSimilarity should return 0 for disjoint user ratings', () => {
      const ratingsA = { 's-1': 3.0, 's-2': 2.5 };
      const ratingsB = { 's-3': 3.0, 's-4': 2.5 };
      const sim = CollaborativeFilter.cosineSimilarity(ratingsA, ratingsB);
      assert.equal(sim, 0);
    });

    it('predictScores should prioritize songs liked by similar users', () => {
      const userItemMap = {
        target_user: { 's-1': 3.0, 's-2': 2.5 },
        similar_neighbor: { 's-1': 3.0, 's-2': 2.5, 's-6': 3.0 }, // also loved s-6
        dissimilar_user: { 's-3': 3.0, 's-4': 3.0 }
      };

      const candidates = [
        { id: 's-6', playCount: 50 },
        { id: 's-8', playCount: 50 }
      ];

      const predictions = CollaborativeFilter.predictScores('target_user', candidates, userItemMap);
      assert.ok(predictions['s-6'] > predictions['s-8']);
    });
  });

  // 5. User Feedback & Hard Exclusion Tests
  describe('User Feedback Scorer & Anti-Fatigue Filtering', () => {
    it('filterDisliked should strictly exclude disliked songs', () => {
      const candidates = sampleCatalog;
      const disliked = new Set(['s-8', 's-4']);

      const filtered = UserFeedbackScorer.filterDisliked(candidates, disliked);
      const filteredIds = filtered.map(s => s.id);

      assert.equal(filtered.length, candidates.length - 2);
      assert.ok(!filteredIds.includes('s-8'));
      assert.ok(!filteredIds.includes('s-4'));
    });

    it('calculateFeedbackScore should apply fatigue penalty for recently played songs', () => {
      const song = sampleCatalog[0];

      // Listened 10 minutes ago vs 72 hours ago
      const recentPlayed = { 's-1': new Date(Date.now() - 1000 * 60 * 10).toISOString() };
      const oldPlayed = { 's-1': new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() };

      const scoreRecent = UserFeedbackScorer.calculateFeedbackScore(song, { lastPlayedTimes: recentPlayed });
      const scoreOld = UserFeedbackScorer.calculateFeedbackScore(song, { lastPlayedTimes: oldPlayed });

      assert.ok(scoreOld > scoreRecent);
    });
  });

  // 6. Diversity & MMR Reranker Tests
  describe('Diversity Filter & Intra-List Diversity', () => {
    it('applyDiversity should enforce maximum songs per artist constraint', () => {
      const rankedCandidates = [
        { song: { id: '1', title: 'Track 1', artist: 'Same Artist', genre: 'Pop' }, totalScore: 95 },
        { song: { id: '2', title: 'Track 2', artist: 'Same Artist', genre: 'Pop' }, totalScore: 94 },
        { song: { id: '3', title: 'Track 3', artist: 'Same Artist', genre: 'Pop' }, totalScore: 93 }, // 3rd track by same artist
        { song: { id: '4', title: 'Track 4', artist: 'Different Artist', genre: 'Rock' }, totalScore: 90 }
      ];

      const top2 = DiversityFilter.applyDiversity(rankedCandidates, 3, { maxPerArtist: 2 });
      const artistCounts = top2.filter(i => i.song.artist === 'Same Artist').length;

      assert.equal(artistCounts, 2); // capped at 2
      assert.equal(top2[2].song.artist, 'Different Artist');
    });

    it('computeIntraListDiversity should return higher score for diverse genre lists', () => {
      const monoGenreList = [
        { genre: 'Pop', audioFeatures: { tempo: 120 } },
        { genre: 'Pop', audioFeatures: { tempo: 120 } }
      ];
      const diverseGenreList = [
        { genre: 'Pop', audioFeatures: { tempo: 120 } },
        { genre: 'Death Metal', audioFeatures: { tempo: 180 } }
      ];

      const ildMono = DiversityFilter.computeIntraListDiversity(monoGenreList);
      const ildDiverse = DiversityFilter.computeIntraListDiversity(diverseGenreList);

      assert.ok(ildDiverse > ildMono);
    });
  });

  // 7. Explainability Engine Tests
  describe('Explainability Engine', () => {
    it('generateExplanation should construct clear explanations with breakdown percentages', () => {
      const song = sampleCatalog[1]; // Neon Overdrive
      const scores = { mood: 0.95, attributes: 0.88, collaborative: 0.80, userFeedback: 0.75, total: 0.87 };

      const { explanation, scoreBreakdown } = ExplainabilityEngine.generateExplanation(
        song,
        scores,
        'Energetic',
        { preferredGenres: ['Electro House'] }
      );

      assert.ok(explanation.includes('87% Match'));
      assert.ok(explanation.includes('Direct alignment with your active Energetic emotion state'));
      assert.equal(scoreBreakdown.overall, 87);
      assert.equal(scoreBreakdown.moodMatch, 95);
    });
  });

  // 8. Hybrid vs. Baseline Integration Tests
  describe('Hybrid vs Baseline Recommender Integration', () => {
    const hybrid = new HybridRecommender();

    it('HybridRecommender should return exactly top 10 recommendations with breakdown', () => {
      const userContext = {
        userId: 'test_user_1',
        preferences: { preferredGenres: ['Synthwave'], preferredMood: 'Energetic' },
        dislikes: new Set(['s-4']),
        signals: { favourites: new Set(['s-2']), likes: new Set(['s-6']) }
      };

      const recommendations = hybrid.recommend(userContext, sampleCatalog, 'Energetic', { topN: 10 });

      assert.ok(recommendations.length <= 10);
      assert.ok(recommendations.length > 0);
      assert.ok(recommendations[0].totalScore >= recommendations[recommendations.length - 1].totalScore);
      assert.ok(recommendations[0].scoreBreakdown !== undefined);
      assert.ok(recommendations[0].explanation !== undefined);
      // Ensure disliked track was excluded
      assert.ok(!recommendations.some(r => r.song.id === 's-4'));
    });

    it('HybridRecommender handles cold start users with dynamic weight adjustment', () => {
      const coldStartContext = {
        userId: 'brand_new_user',
        preferences: { preferredGenres: [], preferredMood: 'Happy' },
        signals: {}
      };

      const recommendations = hybrid.recommend(coldStartContext, sampleCatalog, 'Happy', { topN: 5 });

      assert.equal(recommendations.length, 5);
      assert.equal(recommendations[0].isColdStartAdapted, true);
    });

    it('HybridRecommender weights are dynamically configurable at runtime', () => {
      const customHybrid = new HybridRecommender();
      customHybrid.setWeights({ mood: 0.80, attributes: 0.10, collaborative: 0.05, userFeedback: 0.05 });

      assert.equal(customHybrid.weights.mood, 0.80);
      assert.equal(customHybrid.weights.attributes, 0.10);
    });

    it('BenchmarkEvaluator should compare baseline and hybrid performance', () => {
      const report = BenchmarkEvaluator.runComparison('Energetic', 'synth_user_1', 10);

      assert.equal(report.metrics.dataset.isSynthetic, true);
      assert.ok(report.baselineRecommendations.length > 0);
      assert.ok(report.hybridRecommendations.length > 0);
      assert.equal(report.metrics.hybrid.dislikedItemsRecommended, 0); // Strict dislike exclusion
    });
  });
});
