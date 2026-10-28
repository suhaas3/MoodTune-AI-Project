import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User, Song, Favourite, ListeningHistory, UserFeedback } from '../models/index.js';

const sampleSongs = [
  {
    title: 'Solar Flare Groove',
    artist: 'Aura Nova',
    album: 'Cosmic Radiance',
    genre: 'Synthwave',
    mood: 'Happy',
    duration: 194,
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
    playCount: 1420,
    likeCount: 38
  },
  {
    title: 'Neon Overdrive',
    artist: 'Vektor 86',
    album: 'Cybernetic Heart',
    genre: 'Electro House',
    mood: 'Energetic',
    duration: 218,
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
    playCount: 3890,
    likeCount: 92
  },
  {
    title: 'Midnight Dewdrop',
    artist: 'Luna Solace',
    album: 'Whispering Canopy',
    genre: 'Ambient Lo-Fi',
    mood: 'Relaxed',
    duration: 165,
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
    playCount: 2100,
    likeCount: 54
  },
  {
    title: 'Echoes in the Rain',
    artist: 'The Grey Horizon',
    album: 'Solitary Pages',
    genre: 'Indie Acoustic',
    mood: 'Sad',
    duration: 242,
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
    playCount: 970,
    likeCount: 22
  },
  {
    title: 'Golden Hour Symphony',
    artist: 'Céleste & The Mirage',
    album: 'Sunflower Fields',
    genre: 'Indie Pop',
    mood: 'Happy',
    duration: 188,
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
    playCount: 4520,
    likeCount: 115
  },
  {
    title: 'Quantum Velocity',
    artist: 'Apex Kinetic',
    album: 'Hyperdrive',
    genre: 'Drum & Bass',
    mood: 'Energetic',
    duration: 205,
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
    playCount: 5120,
    likeCount: 140
  },
  {
    title: 'Drifting Petals',
    artist: 'Kaito Hayashi',
    album: 'Kyoto Teahouse',
    genre: 'Chillhop',
    mood: 'Relaxed',
    duration: 178,
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
    playCount: 1840,
    likeCount: 47
  },
  {
    title: 'Memories of Blue',
    artist: 'Evelyn Rowe',
    album: 'Distant Shores',
    genre: 'Cinematic Piano',
    mood: 'Sad',
    duration: 212,
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
    playCount: 1150,
    likeCount: 31
  },
  {
    title: 'Tropical Mirage',
    artist: 'Isla & The Tropics',
    album: 'Endless Horizon',
    genre: 'Tropical House',
    mood: 'Happy',
    duration: 198,
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
    playCount: 3100,
    likeCount: 78
  },
  {
    title: 'Ignition Protocol',
    artist: 'Titanium Surge',
    album: 'Core Meltdown',
    genre: 'Industrial Synth',
    mood: 'Energetic',
    duration: 226,
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
    playCount: 4200,
    likeCount: 104
  },
  {
    title: 'Breathe in Cedar',
    artist: 'Nordic Pines',
    album: 'Fjord Silence',
    genre: 'Neo-Classical',
    mood: 'Relaxed',
    duration: 230,
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
    playCount: 1670,
    likeCount: 41
  },
  {
    title: 'Fragile Glass',
    artist: 'Noah Vance',
    album: 'Winter Soliloquy',
    genre: 'Indie Folk',
    mood: 'Sad',
    duration: 254,
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
    playCount: 880,
    likeCount: 19
  }
];

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Clearing existing collections...');

    await Promise.all([
      Song.deleteMany({}),
      User.deleteMany({}),
      Favourite.deleteMany({}),
      ListeningHistory.deleteMany({}),
      UserFeedback.deleteMany({})
    ]);

    console.log('[Seed] Inserting sample songs catalog...');
    const insertedSongs = await Song.insertMany(sampleSongs);
    console.log(`[Seed] Successfully inserted ${insertedSongs.length} songs.`);

    console.log('[Seed] Creating demo user...');
    const demoUser = await User.create({
      name: 'Sai Suresh',
      email: 'sai.suresh@moodtune.ai',
      password: 'password123',
      bio: 'B.Tech CSE - Data Science researcher in Music Emotion Recognition and Adaptive Recommendation Systems.',
      preferredMood: 'Energetic',
      preferredGenres: ['Synthwave', 'Electro House', 'Ambient Lo-Fi']
    });
    console.log(`[Seed] Demo user created: ${demoUser.email} (Password: password123)`);

    // Add initial favourite for demo user
    await Favourite.create({
      user: demoUser._id,
      song: insertedSongs[0]._id
    });

    // Add initial listening history
    await ListeningHistory.create({
      user: demoUser._id,
      song: insertedSongs[0]._id,
      contextMood: 'Happy',
      listenDuration: 194,
      completionRate: 1.0,
      completed: true
    });

    console.log('[Seed] Seeding completed successfully!');
    if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error]:', error);
    if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
      process.exit(1);
    }
  }
};

// Auto-run if executed directly via node src/scripts/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
