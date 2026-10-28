import mongoose from 'mongoose';

const favouriteSchema = new mongoose.Schema(
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
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Ensure user can only favourite a song once
favouriteSchema.index({ user: 1, song: 1 }, { unique: true });

const Favourite = mongoose.model('Favourite', favouriteSchema);
export default Favourite;
