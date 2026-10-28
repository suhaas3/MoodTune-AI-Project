/**
 * MoodTune AI Recommendation Engine Configuration
 * All weights and threshold hyperparameters are fully configurable
 */

export const DEFAULT_WEIGHTS = {
  mood: 0.35,          // Weight for emotion quadrant and Valence-Arousal proximity
  attributes: 0.25,    // Weight for genre, tempo, and acoustic features
  collaborative: 0.20, // Weight for user-user interaction similarity
  userFeedback: 0.20   // Weight for user's personal likes, favourites, and listen history
};

export const COLD_START_WEIGHTS = {
  mood: 0.55,
  attributes: 0.35,
  collaborative: 0.05,
  userFeedback: 0.05
};

// Target Russell's Circumplex centroids and tempo preferences per mood
export const MOOD_PROFILES = {
  Happy: {
    valence: 0.85,
    arousal: 0.72,
    targetTempo: 120, // BPM
    tempoStdDev: 25,
    energy: 0.75,
    danceability: 0.78
  },
  Energetic: {
    valence: 0.65,
    arousal: 0.94,
    targetTempo: 142, // BPM
    tempoStdDev: 25,
    energy: 0.92,
    danceability: 0.82
  },
  Relaxed: {
    valence: 0.70,
    arousal: 0.28,
    targetTempo: 75,  // BPM
    tempoStdDev: 20,
    energy: 0.36,
    danceability: 0.50
  },
  Sad: {
    valence: 0.16,
    arousal: 0.22,
    targetTempo: 65,  // BPM
    tempoStdDev: 18,
    energy: 0.28,
    danceability: 0.34
  }
};

// Diversity and fatigue decay parameters
export const DIVERSITY_CONFIG = {
  maxSongsPerArtist: 2, // Maximum number of tracks by the same artist in top 10
  minDistinctGenres: 2, // Minimum distinct genres to enforce in top 10
  fatigueDecayHours: 24 // Half-life decay for recently listened tracks
};
