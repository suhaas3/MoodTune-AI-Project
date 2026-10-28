/**
 * =========================================================================
 * [SYNTHETIC TEST DATASET — ACADEMIC RESEARCH BENCHMARK SIMULATION]
 * -------------------------------------------------------------------------
 * This module generates simulated user profiles and multi-user telemetry
 * interactions to evaluate collaborative filtering and hybrid performance.
 * 
 * NOTE: This data is explicitly flagged as SYNTHETIC to distinguish it
 * from live production database records.
 * =========================================================================
 */

export const IS_SYNTHETIC_DATASET = true;
export const DATASET_TAG = 'SYNTHETIC_BENCHMARK_V1';

export const SYNTHETIC_USERS = [
  {
    id: 'synth_user_1',
    name: 'Synthwave Enthusiast',
    preferredMood: 'Energetic',
    preferredGenres: ['Synthwave', 'Electro House'],
    cluster: 'High-Energy-Electronic'
  },
  {
    id: 'synth_user_2',
    name: 'Lo-Fi Chill Listener',
    preferredMood: 'Relaxed',
    preferredGenres: ['Ambient Lo-Fi', 'Chillhop'],
    cluster: 'Ambient-Relaxation'
  },
  {
    id: 'synth_user_3',
    name: 'Indie Pop Optimist',
    preferredMood: 'Happy',
    preferredGenres: ['Indie Pop', 'Tropical House'],
    cluster: 'Upbeat-Melodic'
  },
  {
    id: 'synth_user_4',
    name: 'Acoustic Reflective',
    preferredMood: 'Sad',
    preferredGenres: ['Indie Acoustic', 'Cinematic Piano'],
    cluster: 'Introspective-Acoustic'
  },
  {
    id: 'synth_user_cold_start',
    name: 'Brand New User (Cold Start)',
    preferredMood: 'Energetic',
    preferredGenres: [],
    cluster: 'Uncalibrated'
  }
];

/**
 * Synthetic interaction log across a 12-track sample catalog
 * Formatted as { userId, songId, type: 'like'|'favourite'|'skip'|'complete' }
 */
export const SYNTHETIC_INTERACTIONS = [
  // User 1: Loves Energetic Synth tracks (s-1, s-2, s-6, s-10), Skips Sad tracks (s-4, s-8)
  { userId: 'synth_user_1', songId: 's-1', type: 'favourite' },
  { userId: 'synth_user_1', songId: 's-2', type: 'like' },
  { userId: 'synth_user_1', songId: 's-6', type: 'complete' },
  { userId: 'synth_user_1', songId: 's-10', type: 'like' },
  { userId: 'synth_user_1', songId: 's-4', type: 'skip' },
  { userId: 'synth_user_1', songId: 's-8', type: 'dislike' },

  // User 2: Loves Relaxed & Ambient tracks (s-3, s-7, s-11), Skips Heavy Electronic (s-2, s-10)
  { userId: 'synth_user_2', songId: 's-3', type: 'favourite' },
  { userId: 'synth_user_2', songId: 's-7', type: 'like' },
  { userId: 'synth_user_2', songId: 's-11', type: 'complete' },
  { userId: 'synth_user_2', songId: 's-2', type: 'skip' },
  { userId: 'synth_user_2', songId: 's-10', type: 'skip' },

  // User 3: Loves Happy tracks (s-1, s-5, s-9), also likes s-2 (connecting bridge to User 1)
  { userId: 'synth_user_3', songId: 's-5', type: 'favourite' },
  { userId: 'synth_user_3', songId: 's-9', type: 'like' },
  { userId: 'synth_user_3', songId: 's-1', type: 'like' },
  { userId: 'synth_user_3', songId: 's-2', type: 'complete' }, // common preference bridge with User 1

  // User 4: Loves Sad & Melancholic tracks (s-4, s-8, s-12), Dislikes High Energy
  { userId: 'synth_user_4', songId: 's-4', type: 'favourite' },
  { userId: 'synth_user_4', songId: 's-8', type: 'like' },
  { userId: 'synth_user_4', songId: 's-12', type: 'complete' },
  { userId: 'synth_user_4', songId: 's-6', type: 'skip' }
];

/**
 * Returns synthetic benchmark catalog songs
 */
export const getSyntheticCatalog = () => [
  {
    id: 's-1',
    _id: 's-1',
    title: 'Solar Flare Groove',
    artist: 'Aura Nova',
    genre: 'Synthwave',
    mood: 'Happy',
    duration: 194,
    playCount: 1420,
    likeCount: 38,
    audioFeatures: { tempo: 124, valence: 0.88, arousal: 0.74, energy: 0.82, danceability: 0.79 },
    moodConfidence: { Happy: 0.91, Energetic: 0.06, Relaxed: 0.02, Sad: 0.01 }
  },
  {
    id: 's-2',
    _id: 's-2',
    title: 'Neon Overdrive',
    artist: 'Vektor 86',
    genre: 'Electro House',
    mood: 'Energetic',
    duration: 218,
    playCount: 3890,
    likeCount: 92,
    audioFeatures: { tempo: 138, valence: 0.65, arousal: 0.94, energy: 0.95, danceability: 0.84 },
    moodConfidence: { Happy: 0.12, Energetic: 0.84, Relaxed: 0.01, Sad: 0.03 }
  },
  {
    id: 's-3',
    _id: 's-3',
    title: 'Midnight Dewdrop',
    artist: 'Luna Solace',
    genre: 'Ambient Lo-Fi',
    mood: 'Relaxed',
    duration: 165,
    playCount: 2100,
    likeCount: 54,
    audioFeatures: { tempo: 76, valence: 0.72, arousal: 0.28, energy: 0.35, danceability: 0.52 },
    moodConfidence: { Happy: 0.08, Energetic: 0.02, Relaxed: 0.88, Sad: 0.02 }
  },
  {
    id: 's-4',
    _id: 's-4',
    title: 'Echoes in the Rain',
    artist: 'The Grey Horizon',
    genre: 'Indie Acoustic',
    mood: 'Sad',
    duration: 242,
    playCount: 970,
    likeCount: 22,
    audioFeatures: { tempo: 68, valence: 0.18, arousal: 0.22, energy: 0.28, danceability: 0.33 },
    moodConfidence: { Happy: 0.01, Energetic: 0.01, Relaxed: 0.09, Sad: 0.89 }
  },
  {
    id: 's-5',
    _id: 's-5',
    title: 'Golden Hour Symphony',
    artist: 'Céleste & The Mirage',
    genre: 'Indie Pop',
    mood: 'Happy',
    duration: 188,
    playCount: 4520,
    likeCount: 115,
    audioFeatures: { tempo: 118, valence: 0.92, arousal: 0.68, energy: 0.76, danceability: 0.72 },
    moodConfidence: { Happy: 0.94, Energetic: 0.04, Relaxed: 0.01, Sad: 0.01 }
  },
  {
    id: 's-6',
    _id: 's-6',
    title: 'Quantum Velocity',
    artist: 'Apex Kinetic',
    genre: 'Drum & Bass',
    mood: 'Energetic',
    duration: 205,
    playCount: 5120,
    likeCount: 140,
    audioFeatures: { tempo: 172, valence: 0.60, arousal: 0.98, energy: 0.97, danceability: 0.78 },
    moodConfidence: { Happy: 0.06, Energetic: 0.92, Relaxed: 0.01, Sad: 0.01 }
  },
  {
    id: 's-7',
    _id: 's-7',
    title: 'Drifting Petals',
    artist: 'Kaito Hayashi',
    genre: 'Chillhop',
    mood: 'Relaxed',
    duration: 178,
    playCount: 1840,
    likeCount: 47,
    audioFeatures: { tempo: 82, valence: 0.68, arousal: 0.32, energy: 0.40, danceability: 0.64 },
    moodConfidence: { Happy: 0.15, Energetic: 0.01, Relaxed: 0.82, Sad: 0.02 }
  },
  {
    id: 's-8',
    _id: 's-8',
    title: 'Memories of Blue',
    artist: 'Evelyn Rowe',
    genre: 'Cinematic Piano',
    mood: 'Sad',
    duration: 212,
    playCount: 1150,
    likeCount: 31,
    audioFeatures: { tempo: 62, valence: 0.12, arousal: 0.18, energy: 0.22, danceability: 0.25 },
    moodConfidence: { Happy: 0.01, Energetic: 0.01, Relaxed: 0.06, Sad: 0.92 }
  },
  {
    id: 's-9',
    _id: 's-9',
    title: 'Tropical Mirage',
    artist: 'Isla & The Tropics',
    genre: 'Tropical House',
    mood: 'Happy',
    duration: 198,
    playCount: 3100,
    likeCount: 78,
    audioFeatures: { tempo: 114, valence: 0.85, arousal: 0.65, energy: 0.78, danceability: 0.86 },
    moodConfidence: { Happy: 0.88, Energetic: 0.09, Relaxed: 0.02, Sad: 0.01 }
  },
  {
    id: 's-10',
    _id: 's-10',
    title: 'Ignition Protocol',
    artist: 'Titanium Surge',
    genre: 'Industrial Synth',
    mood: 'Energetic',
    duration: 226,
    playCount: 4200,
    likeCount: 104,
    audioFeatures: { tempo: 144, valence: 0.48, arousal: 0.92, energy: 0.93, danceability: 0.74 },
    moodConfidence: { Happy: 0.04, Energetic: 0.91, Relaxed: 0.01, Sad: 0.04 }
  },
  {
    id: 's-11',
    _id: 's-11',
    title: 'Breathe in Cedar',
    artist: 'Nordic Pines',
    genre: 'Neo-Classical',
    mood: 'Relaxed',
    duration: 230,
    playCount: 1670,
    likeCount: 41,
    audioFeatures: { tempo: 70, valence: 0.62, arousal: 0.22, energy: 0.30, danceability: 0.38 },
    moodConfidence: { Happy: 0.08, Energetic: 0.01, Relaxed: 0.89, Sad: 0.02 }
  },
  {
    id: 's-12',
    _id: 's-12',
    title: 'Fragile Glass',
    artist: 'Noah Vance',
    genre: 'Indie Folk',
    mood: 'Sad',
    duration: 254,
    playCount: 880,
    likeCount: 19,
    audioFeatures: { tempo: 65, valence: 0.15, arousal: 0.25, energy: 0.31, danceability: 0.40 },
    moodConfidence: { Happy: 0.02, Energetic: 0.02, Relaxed: 0.05, Sad: 0.91 }
  }
];
