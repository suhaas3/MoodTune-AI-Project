import { ListeningHistory, Song } from '../models/index.js';

/**
 * @desc    Get user's listening history
 * @route   GET /api/history
 * @access  Private
 */
export const getListeningHistory = async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [historyRecords, total] = await Promise.all([
      ListeningHistory.find({ user: req.user.id })
        .populate('song')
        .sort({ playedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ListeningHistory.countDocuments({ user: req.user.id })
    ]);

    const formattedHistory = historyRecords
      .filter(record => record.song !== null)
      .map(record => ({
        id: record._id,
        song: record.song,
        contextMood: record.contextMood,
        listenDuration: record.listenDuration,
        completionRate: record.completionRate,
        completed: record.completed,
        playedAt: record.playedAt
      }));

    res.status(200).json({
      success: true,
      count: formattedHistory.length,
      total,
      data: {
        history: formattedHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record a new listening event
 * @route   POST /api/history
 * @access  Private
 */
export const recordListeningHistory = async (req, res, next) => {
  try {
    const { songId, contextMood, listenDuration = 0, completionRate = 0 } = req.body;

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    const completed = completionRate >= 0.8;

    const record = await ListeningHistory.create({
      user: req.user.id,
      song: songId,
      contextMood: contextMood || song.mood,
      listenDuration: Math.max(0, Number(listenDuration)),
      completionRate: Math.min(1, Math.max(0, Number(completionRate))),
      completed
    });

    // Increment song playCount
    await Song.findByIdAndUpdate(songId, { $inc: { playCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Listening event recorded successfully',
      data: {
        record
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear user's entire listening history
 * @route   DELETE /api/history
 * @access  Private
 */
export const clearListeningHistory = async (req, res, next) => {
  try {
    await ListeningHistory.deleteMany({ user: req.user.id });
    res.status(200).json({
      success: true,
      message: 'Listening history cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
