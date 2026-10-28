import mongoose from 'mongoose';

const userFeedbackSchema = new mongoose.Schema(
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
    action: {
      type: String,
      required: [true, 'Feedback action is required'],
      enum: ['like', 'skip', 'complete', 'dislike'],
      index: true
    },
    contextMood: {
      type: String,
      enum: ['Happy', 'Energetic', 'Relaxed', 'Sad', null],
      default: null
    },
    skipDuration: {
      type: Number,
      default: null // How many seconds the song was listened to before being skipped
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const UserFeedback = mongoose.model('UserFeedback', userFeedbackSchema);
export default UserFeedback;
