/**
 * Explainability Generator for Recommendations
 * Produces transparent, human-readable explanations and normalized percentage breakdowns
 */

export class ExplainabilityEngine {
  /**
   * Generate an explainable rationale for a recommended track
   * @param {Object} song
   * @param {Object} scores - { mood, attributes, collaborative, userFeedback, total }
   * @param {String} targetMood
   * @param {Object} userPreferences
   * @returns {Object} { explanation: String, scoreBreakdown: Object, confidencePercent: Number }
   */
  static generateExplanation(song, scores = {}, targetMood = 'Energetic', userPreferences = {}) {
    const reasons = [];

    const moodScore = Math.round((scores.mood || 0) * 100);
    const attrScore = Math.round((scores.attributes || 0) * 100);
    const cfScore = Math.round((scores.collaborative || 0) * 100);
    const userScore = Math.round((scores.userFeedback || 0) * 100);
    const totalScore = Math.round((scores.total || 0) * 100);

    // 1. Mood & Emotion Alignment
    if (song.mood?.toLowerCase() === targetMood.toLowerCase()) {
      reasons.push(`Direct alignment with your active ${targetMood} emotion state`);
    } else if (moodScore >= 70) {
      reasons.push(`Acoustic valence and energy resonate with your ${targetMood} vibe`);
    }

    // 2. Genre & Tempo Attributes
    const preferredGenres = (userPreferences.preferredGenres || []).map(g => g.toLowerCase());
    if (preferredGenres.includes((song.genre || '').toLowerCase())) {
      reasons.push(`Matches your preferred genre (${song.genre})`);
    } else if (song.audioFeatures?.tempo) {
      reasons.push(`Optimal rhythm cadence (${song.audioFeatures.tempo} BPM)`);
    }

    // 3. Collaborative Social Signals
    if (cfScore >= 75) {
      reasons.push(`Popular among listeners who share your musical tastes`);
    }

    // 4. Personal History Signals
    if (userScore >= 80) {
      reasons.push(`Echoes artists and tracks you frequently complete`);
    }

    // Compose concise summary
    let explanationText = reasons.slice(0, 2).join(' • ');
    if (!explanationText) {
      explanationText = `Curated based on acoustic harmony and genre similarity`;
    }

    return {
      explanation: `${totalScore}% Match: ${explanationText}.`,
      scoreBreakdown: {
        overall: totalScore,
        moodMatch: moodScore,
        acousticAttributes: attrScore,
        communityAffinity: cfScore,
        personalFeedback: userScore
      }
    };
  }
}
