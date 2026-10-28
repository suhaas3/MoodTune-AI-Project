import mongoose from 'mongoose';

const listeningHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
      required: [true, 'Song reference is required'],
      index: true
    },
    contextMood: {
      type: String,
      enum: ['Happy', 'Energetic', 'Relaxed', 'Sad', null],
      default: null
    },
    listenDuration: {
      type: Number,
      default: 0, // In seconds
      min: 0
    },
    completionRate: {
      type: Number,
      default: 0, // 0.0 to 1.0
      min: 0,
      max: 1
    },
    completed: {
      type: Boolean,
      default: false
    },
    playedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const ListeningHistory = mongoose.model('ListeningHistory', listeningHistorySchema);
export default ListeningHistory;
