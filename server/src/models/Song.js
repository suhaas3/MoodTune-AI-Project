import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
      index: true
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
      index: true
    },
    album: {
      type: String,
      default: 'Single'
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      index: true
    },
    mood: {
      type: String,
      required: [true, 'Emotion mood is required'],
      enum: ['Happy', 'Energetic', 'Relaxed', 'Sad'],
      index: true
    },
    duration: {
      type: Number,
      required: [true, 'Duration in seconds is required']
    },
    durationFormatted: {
      type: String,
      default: '3:00'
    },
    releaseYear: {
      type: Number,
      default: new Date().getFullYear()
    },
    coverUrl: {
      type: String,
      required: [true, 'Album cover URL is required']
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio streaming URL is required']
    },
    audioFeatures: {
      tempo: { type: Number, default: 120 },               // BPM
      valence: { type: Number, min: 0, max: 1, default: 0.5 }, // Positivity
      arousal: { type: Number, min: 0, max: 1, default: 0.5 }, // Intensity
      energy: { type: Number, min: 0, max: 1, default: 0.5 },
      danceability: { type: Number, min: 0, max: 1, default: 0.5 },
      spectralCentroid: { type: Number, default: 2000 }
    },
    moodConfidence: {
      Happy: { type: Number, default: 0.25 },
      Energetic: { type: Number, default: 0.25 },
      Relaxed: { type: Number, default: 0.25 },
      Sad: { type: Number, default: 0.25 }
    },
    playCount: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for search queries
songSchema.index({
  title: 'text',
  artist: 'text',
  genre: 'text',
  album: 'text'
});

const Song = mongoose.model('Song', songSchema);
export default Song;
