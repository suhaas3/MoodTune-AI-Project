export const MOODS = {
  HAPPY: 'Happy',
  ENERGETIC: 'Energetic',
  RELAXED: 'Relaxed',
  SAD: 'Sad'
};

export const MOOD_CONFIG = {
  Happy: {
    name: 'Happy',
    tagline: 'Uplifting, bright & euphoric melodies',
    quadrant: 'High Valence • High Arousal',
    valenceRange: [0.6, 1.0],
    arousalRange: [0.5, 0.9],
    gradient: 'from-amber-500 via-orange-500 to-yellow-400',
    borderActive: 'border-amber-400',
    bgBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    accentColor: '#F59E0B',
    glowClass: 'glow-happy',
    icon: 'Sun',
    description: 'Boost your mood with vibrant rhythms, major keys, and optimistic vibes.'
  },
  Energetic: {
    name: 'Energetic',
    tagline: 'Pulsing beats, driving bass & high adrenaline',
    quadrant: 'Medium/High Valence • Very High Arousal',
    valenceRange: [0.4, 0.9],
    arousalRange: [0.75, 1.0],
    gradient: 'from-red-500 via-rose-500 to-pink-500',
    borderActive: 'border-rose-400',
    bgBadge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    accentColor: '#EF4444',
    glowClass: 'glow-energetic',
    icon: 'Flame',
    description: 'High tempo, intense synth drops, and fast-paced beats engineered for focus & workout.'
  },
  Relaxed: {
    name: 'Relaxed',
    tagline: 'Chillout, ambient textures & calming waves',
    quadrant: 'High Valence • Low Arousal',
    valenceRange: [0.5, 0.85],
    arousalRange: [0.1, 0.45],
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    borderActive: 'border-emerald-400',
    bgBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    accentColor: '#10B981',
    glowClass: 'glow-relaxed',
    icon: 'Wind',
    description: 'Gentle acoustic chords, lo-fi beats, and warm atmospheric pads for unwinding.'
  },
  Sad: {
    name: 'Sad',
    tagline: 'Melancholic, deep acoustic & reflective lyrics',
    quadrant: 'Low Valence • Low Arousal',
    valenceRange: [0.05, 0.45],
    arousalRange: [0.1, 0.45],
    gradient: 'from-blue-600 via-indigo-600 to-purple-700',
    borderActive: 'border-blue-400',
    bgBadge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    accentColor: '#3B82F6',
    glowClass: 'glow-sad',
    icon: 'CloudRain',
    description: 'Poignant piano lines and emotive harmonies to accompany introspective hours.'
  }
};

export const SAMPLE_SONGS = [
  {
    id: 's-1',
    title: 'Solar Flare Groove',
    artist: 'Aura Nova',
    album: 'Cosmic Radiance',
    genre: 'Synthwave',
    mood: 'Happy',
    duration: 194, // 3:14
    durationFormatted: '3:14',
    releaseYear: 2024,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioFeatures: {
      tempo: 124,
      valence: 0.88,
      arousal: 0.74,
      energy: 0.82,
      danceability: 0.79,
      spectralCentroid: 2450
    },
    moodConfidence: { Happy: 0.91, Energetic: 0.06, Relaxed: 0.02, Sad: 0.01 },
    playCount: 1420
  },
  {
    id: 's-2',
    title: 'Neon Overdrive',
    artist: 'Vektor 86',
    album: 'Cybernetic Heart',
    genre: 'Electro House',
    mood: 'Energetic',
    duration: 218, // 3:38
    durationFormatted: '3:38',
    releaseYear: 2025,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    audioFeatures: {
      tempo: 138,
      valence: 0.65,
      arousal: 0.94,
      energy: 0.95,
      danceability: 0.84,
      spectralCentroid: 3100
    },
    moodConfidence: { Happy: 0.12, Energetic: 0.84, Relaxed: 0.01, Sad: 0.03 },
    playCount: 3890
  },
  {
    id: 's-3',
    title: 'Midnight Dewdrop',
    artist: 'Luna Solace',
    album: 'Whispering Canopy',
    genre: 'Ambient Lo-Fi',
    mood: 'Relaxed',
    duration: 165, // 2:45
    durationFormatted: '2:45',
    releaseYear: 2023,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    audioFeatures: {
      tempo: 76,
      valence: 0.72,
      arousal: 0.28,
      energy: 0.35,
      danceability: 0.52,
      spectralCentroid: 1420
    },
    moodConfidence: { Happy: 0.08, Energetic: 0.02, Relaxed: 0.88, Sad: 0.02 },
    playCount: 2100
  },
  {
    id: 's-4',
    title: 'Echoes in the Rain',
    artist: 'The Grey Horizon',
    album: 'Solitary Pages',
    genre: 'Indie Acoustic',
    mood: 'Sad',
    duration: 242, // 4:02
    durationFormatted: '4:02',
    releaseYear: 2023,
    coverUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    audioFeatures: {
      tempo: 68,
      valence: 0.18,
      arousal: 0.22,
      energy: 0.28,
      danceability: 0.33,
      spectralCentroid: 1120
    },
    moodConfidence: { Happy: 0.01, Energetic: 0.01, Relaxed: 0.09, Sad: 0.89 },
    playCount: 970
  },
  {
    id: 's-5',
    title: 'Golden Hour Symphony',
    artist: 'Céleste & The Mirage',
    album: 'Sunflower Fields',
    genre: 'Indie Pop',
    mood: 'Happy',
    duration: 188, // 3:08
    durationFormatted: '3:08',
    releaseYear: 2024,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    audioFeatures: {
      tempo: 118,
      valence: 0.92,
      arousal: 0.68,
      energy: 0.76,
      danceability: 0.72,
      spectralCentroid: 2200
    },
    moodConfidence: { Happy: 0.94, Energetic: 0.04, Relaxed: 0.01, Sad: 0.01 },
    playCount: 4520
  },
  {
    id: 's-6',
    title: 'Quantum Velocity',
    artist: 'Apex Kinetic',
    album: 'Hyperdrive',
    genre: 'Drum & Bass',
    mood: 'Energetic',
    duration: 205, // 3:25
    durationFormatted: '3:25',
    releaseYear: 2025,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    audioFeatures: {
      tempo: 172,
      valence: 0.60,
      arousal: 0.98,
      energy: 0.97,
      danceability: 0.78,
      spectralCentroid: 3400
    },
    moodConfidence: { Happy: 0.06, Energetic: 0.92, Relaxed: 0.01, Sad: 0.01 },
    playCount: 5120
  },
  {
    id: 's-7',
    title: 'Drifting Petals',
    artist: 'Kaito Hayashi',
    album: 'Kyoto Teahouse',
    genre: 'Chillhop',
    mood: 'Relaxed',
    duration: 178, // 2:58
    durationFormatted: '2:58',
    releaseYear: 2024,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    audioFeatures: {
      tempo: 82,
      valence: 0.68,
      arousal: 0.32,
      energy: 0.40,
      danceability: 0.64,
      spectralCentroid: 1560
    },
    moodConfidence: { Happy: 0.15, Energetic: 0.01, Relaxed: 0.82, Sad: 0.02 },
    playCount: 1840
  },
  {
    id: 's-8',
    title: 'Memories of Blue',
    artist: 'Evelyn Rowe',
    album: 'Distant Shores',
    genre: 'Cinematic Piano',
    mood: 'Sad',
    duration: 212, // 3:32
    durationFormatted: '3:32',
    releaseYear: 2023,
    coverUrl: 'https://images.unsplash.com/photo-1445985543469-221a5a44a24b?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    audioFeatures: {
      tempo: 62,
      valence: 0.12,
      arousal: 0.18,
      energy: 0.22,
      danceability: 0.25,
      spectralCentroid: 980
    },
    moodConfidence: { Happy: 0.01, Energetic: 0.01, Relaxed: 0.06, Sad: 0.92 },
    playCount: 1150
  },
  {
    id: 's-9',
    title: 'Tropical Mirage',
    artist: 'Isla & The Tropics',
    album: 'Endless Horizon',
    genre: 'Tropical House',
    mood: 'Happy',
    duration: 198, // 3:18
    durationFormatted: '3:18',
    releaseYear: 2024,
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    audioFeatures: {
      tempo: 114,
      valence: 0.85,
      arousal: 0.65,
      energy: 0.78,
      danceability: 0.86,
      spectralCentroid: 2350
    },
    moodConfidence: { Happy: 0.88, Energetic: 0.09, Relaxed: 0.02, Sad: 0.01 },
    playCount: 3100
  },
  {
    id: 's-10',
    title: 'Ignition Protocol',
    artist: 'Titanium Surge',
    album: 'Core Meltdown',
    genre: 'Industrial Synth',
    mood: 'Energetic',
    duration: 226, // 3:46
    durationFormatted: '3:46',
    releaseYear: 2024,
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    audioFeatures: {
      tempo: 144,
      valence: 0.48,
      arousal: 0.92,
      energy: 0.93,
      danceability: 0.74,
      spectralCentroid: 2950
    },
    moodConfidence: { Happy: 0.04, Energetic: 0.91, Relaxed: 0.01, Sad: 0.04 },
    playCount: 4200
  },
  {
    id: 's-11',
    title: 'Breathe in Cedar',
    artist: 'Nordic Pines',
    album: 'Fjord Silence',
    genre: 'Neo-Classical',
    mood: 'Relaxed',
    duration: 230, // 3:50
    durationFormatted: '3:50',
    releaseYear: 2023,
    coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    audioFeatures: {
      tempo: 70,
      valence: 0.62,
      arousal: 0.22,
      energy: 0.30,
      danceability: 0.38,
      spectralCentroid: 1250
    },
    moodConfidence: { Happy: 0.08, Energetic: 0.01, Relaxed: 0.89, Sad: 0.02 },
    playCount: 1670
  },
  {
    id: 's-12',
    title: 'Fragile Glass',
    artist: 'Noah Vance',
    album: 'Winter Soliloquy',
    genre: 'Indie Folk',
    mood: 'Sad',
    duration: 254, // 4:14
    durationFormatted: '4:14',
    releaseYear: 2023,
    coverUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    audioFeatures: {
      tempo: 65,
      valence: 0.15,
      arousal: 0.25,
      energy: 0.31,
      danceability: 0.40,
      spectralCentroid: 1100
    },
    moodConfidence: { Happy: 0.02, Energetic: 0.02, Relaxed: 0.05, Sad: 0.91 },
    playCount: 880
  }
];

export const GENRES = [
  'All Genres',
  'Synthwave',
  'Electro House',
  'Ambient Lo-Fi',
  'Indie Pop',
  'Indie Acoustic',
  'Drum & Bass',
  'Chillhop',
  'Cinematic Piano',
  'Tropical House',
  'Neo-Classical'
];

export const DEFAULT_USER = {
  name: 'Sai Suresh',
  username: 'saisuresh_ds',
  email: 'sai.suresh@moodtune.ai',
  major: 'B.Tech CSE - Data Science \'26',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  bio: 'Music enthusiast & Machine Learning researcher. Exploring emotion classification with audio spectrograms and collaborative filtering.',
  stats: {
    minutesListened: 2480,
    songsPlayed: 94,
    moodStreak: '7 Days',
    topMood: 'Energetic',
    favoriteGenre: 'Synthwave'
  },
  moodDistribution: [
    { mood: 'Happy', count: 34, percentage: 36, color: '#F59E0B' },
    { mood: 'Energetic', count: 32, percentage: 34, color: '#EF4444' },
    { mood: 'Relaxed', count: 18, percentage: 19, color: '#10B981' },
    { mood: 'Sad', count: 10, percentage: 11, color: '#3B82F6' }
  ],
  topArtists: [
    { name: 'Aura Nova', plays: 42, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80' },
    { name: 'Vektor 86', plays: 36, image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&auto=format&fit=crop&q=80' },
    { name: 'Apex Kinetic', plays: 29, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80' },
    { name: 'Luna Solace', plays: 21, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80' }
  ]
};
