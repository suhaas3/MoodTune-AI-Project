import { MOOD_PROFILES } from './config.js';
import { clamp } from './normalizer.js';

/**
 * Music Attribute Matcher
 * Scores candidate songs based on acoustic parameters: Genre, Tempo (BPM), Energy, Danceability
 */
export class AttributeMatcher {
  constructor(profiles = MOOD_PROFILES) {
    this.profiles = profiles;
  }

  /**
   * Score a song against user profile preferences and acoustic targets
   * @param {Object} song - Candidate song metadata
   * @param {Object} userPreferences - { preferredGenres: [], preferredTempoRange: [min, max] }
   * @param {String} targetMood - Mood context
   * @returns {Number} Score in [0, 1]
   */
  calculateAttributeScore(song, userPreferences = {}, targetMood = 'Energetic') {
    const profile = this.profiles[targetMood] || this.profiles.Energetic;

    // 1. Genre Affinity (weight: 45%)
    let genreScore = 0.2; // default baseline
    const preferredGenres = (userPreferences.preferredGenres || []).map(g => g.toLowerCase());
    const songGenre = (song.genre || '').toLowerCase();

    if (preferredGenres.length > 0) {
      if (preferredGenres.includes(songGenre)) {
        genreScore = 1.0;
      } else {
        // Partial subgenre match (e.g., 'pop' in 'indie pop')
        const hasPartial = preferredGenres.some(pg => songGenre.includes(pg) || pg.includes(songGenre));
        if (hasPartial) genreScore = 0.6;
      }
    } else {
      genreScore = 0.5; // neutral for cold start without genre prefs
    }

    // 2. Tempo Alignment via Gaussian Proximity (weight: 35%)
    const songTempo = song.audioFeatures?.tempo || 120;
    const targetTempo = profile.targetTempo;
    const sigma = profile.tempoStdDev || 25;

    // Gaussian bell curve: exp(- (tempo - target)^2 / (2 * sigma^2))
    const tempoDiff = songTempo - targetTempo;
    const tempoScore = Math.exp(-Math.pow(tempoDiff, 2) / (2 * Math.pow(sigma, 2)));

    // 3. Acoustic Energy & Danceability Balance (weight: 20%)
    const songEnergy = song.audioFeatures?.energy ?? 0.5;
    const songDanceability = song.audioFeatures?.danceability ?? 0.5;

    const energyDiff = Math.abs(songEnergy - profile.energy);
    const danceDiff = Math.abs(songDanceability - profile.danceability);
    const acousticScore = 1 - (energyDiff * 0.5 + danceDiff * 0.5);

    const totalScore = (0.45 * genreScore) + (0.35 * tempoScore) + (0.20 * clamp(acousticScore, 0, 1));
    return clamp(totalScore, 0, 1);
  }

  /**
   * Batch scores candidate songs
   */
  scoreCandidates(candidates, userPreferences, targetMood) {
    const scores = {};
    for (const song of candidates) {
      const songId = song._id ? song._id.toString() : song.id;
      scores[songId] = this.calculateAttributeScore(song, userPreferences, targetMood);
    }
    return scores;
  }
}
