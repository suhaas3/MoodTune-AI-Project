import { Favourite, Song } from '../models/index.js';

/**
 * @desc    Get all favourite songs for the authenticated user
 * @route   GET /api/favourites
 * @access  Private
 */
export const getFavourites = async (req, res, next) => {
  try {
    const favourites = await Favourite.find({ user: req.user.id })
      .populate('song')
      .sort({ createdAt: -1 });

    const songs = favourites
      .filter(fav => fav.song !== null) // Filter out any deleted songs
      .map(fav => ({
        ...fav.song.toObject(),
        favouritedAt: fav.createdAt
      }));

    res.status(200).json({
      success: true,
      count: songs.length,
      data: {
        songs
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a song to user's favourites
 * @route   POST /api/favourites/:songId
 * @access  Private
 */
export const addFavourite = async (req, res, next) => {
  try {
    const { songId } = req.params;

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Check if already favourited
    const existing = await Favourite.findOne({ user: req.user.id, song: songId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Song is already in your favourites',
        data: {
          favourite: existing
        }
      });
    }

    const favourite = await Favourite.create({
      user: req.user.id,
      song: songId
    });

    // Increment likeCount on the Song
    await Song.findByIdAndUpdate(songId, { $inc: { likeCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Song added to favourites',
      data: {
        favourite
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a song from user's favourites
 * @route   DELETE /api/favourites/:songId
 * @access  Private
 */
export const removeFavourite = async (req, res, next) => {
  try {
    const { songId } = req.params;

    const favourite = await Favourite.findOneAndDelete({
      user: req.user.id,
      song: songId
    });

    if (!favourite) {
      return res.status(404).json({
        success: false,
        message: 'Song is not in your favourites'
      });
    }

    // Decrement likeCount on the Song (clamped at 0)
    await Song.findByIdAndUpdate(songId, { $inc: { likeCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Song removed from favourites'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if a specific song is favourited by current user
 * @route   GET /api/favourites/check/:songId
 * @access  Private
 */
export const checkIsFavourite = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const exists = await Favourite.exists({ user: req.user.id, song: songId });

    res.status(200).json({
      success: true,
      data: {
        isFavourite: Boolean(exists)
      }
    });
  } catch (error) {
    next(error);
  }
};
