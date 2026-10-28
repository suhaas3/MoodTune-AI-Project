import { Song } from '../models/index.js';

/**
 * @desc    Search and browse songs with optional query, genre, mood, tempo, and pagination
 * @route   GET /api/songs
 * @access  Public
 */
export const getSongs = async (req, res, next) => {
  try {
    const { q, genre, mood, minTempo, maxTempo, sortBy, order = 'desc', page = 1, limit = 20 } = req.query;

    const queryFilter = {};

    // 1. Text search on title, artist, genre, album
    if (q && q.trim().length > 0) {
      queryFilter.$or = [
        { title: { $regex: q.trim(), $options: 'i' } },
        { artist: { $regex: q.trim(), $options: 'i' } },
        { genre: { $regex: q.trim(), $options: 'i' } },
        { album: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    // 2. Exact Genre filter
    if (genre && genre !== 'All Genres') {
      queryFilter.genre = { $regex: new RegExp(`^${genre.trim()}$`, 'i') };
    }

    // 3. Exact Mood filter
    if (mood) {
      queryFilter.mood = mood;
    }

    // 4. Tempo range filter
    if (minTempo || maxTempo) {
      queryFilter['audioFeatures.tempo'] = {};
      if (minTempo) queryFilter['audioFeatures.tempo'].$gte = Number(minTempo);
      if (maxTempo) queryFilter['audioFeatures.tempo'].$lte = Number(maxTempo);
    }

    // Sorting
    let sortOptions = { playCount: -1 };
    if (sortBy === 'tempo') {
      sortOptions = { 'audioFeatures.tempo': order === 'asc' ? 1 : -1 };
    } else if (sortBy === 'valence') {
      sortOptions = { 'audioFeatures.valence': order === 'asc' ? 1 : -1 };
    } else if (sortBy === 'duration') {
      sortOptions = { duration: order === 'asc' ? 1 : -1 };
    } else if (sortBy === 'latest') {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [songs, total] = await Promise.all([
      Song.find(queryFilter).sort(sortOptions).skip(skip).limit(limitNum),
      Song.countDocuments(queryFilter)
    ]);

    res.status(200).json({
      success: true,
      count: songs.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      data: {
        songs
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single song by ID
 * @route   GET /api/songs/:id
 * @access  Public
 */
export const getSongById = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Increment play count asynchronously
    song.playCount += 1;
    await song.save();

    res.status(200).json({
      success: true,
      data: {
        song
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch songs filtered by mood
 * @route   GET /api/songs/mood/:mood
 * @access  Public
 */
export const getSongsByMood = async (req, res, next) => {
  try {
    const { mood } = req.params;
    const { limit = 20 } = req.query;

    const allowedMoods = ['Happy', 'Energetic', 'Relaxed', 'Sad'];
    const formattedMood = allowedMoods.find(m => m.toLowerCase() === mood.toLowerCase());

    if (!formattedMood) {
      return res.status(400).json({
        success: false,
        message: `Invalid mood '${mood}'. Allowed moods: ${allowedMoods.join(', ')}`
      });
    }

    const songs = await Song.find({ mood: formattedMood })
      .sort({ playCount: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      mood: formattedMood,
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
 * @desc    Fetch songs filtered by genre
 * @route   GET /api/songs/genre/:genre
 * @access  Public
 */
export const getSongsByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;
    const { limit = 20 } = req.query;

    const songs = await Song.find({
      genre: { $regex: new RegExp(`^${genre.trim()}$`, 'i') }
    })
      .sort({ playCount: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      genre,
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
 * @desc    Get all distinct genres available in the catalog
 * @route   GET /api/songs/genres/list
 * @access  Public
 */
export const getDistinctGenres = async (req, res, next) => {
  try {
    const genres = await Song.distinct('genre');
    res.status(200).json({
      success: true,
      count: genres.length,
      data: {
        genres
      }
    });
  } catch (error) {
    next(error);
  }
};
