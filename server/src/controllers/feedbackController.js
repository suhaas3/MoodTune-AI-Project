import { UserFeedback, Song, User } from '../models/index.js';

/**
 * @desc    Record explicit/implicit user feedback (like, skip, complete, dislike)
 * @route   POST /api/feedback
 * @access  Private
 */
export const recordFeedback = async (req, res, next) => {
  try {
    const { songId, action, contextMood, skipDuration } = req.body;

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    const feedback = await UserFeedback.create({
      user: req.user.id,
      song: songId,
      action,
      contextMood: contextMood || song.mood,
      skipDuration: skipDuration ? Number(skipDuration) : null
    });

    // If feedback is 'like', increment song's likeCount
    if (action === 'like') {
      await Song.findByIdAndUpdate(songId, { $inc: { likeCount: 1 } });
    }

    // Adaptive user mood affinity update
    // If user likes or completes a song, slightly reinforce their affinity for that song's mood
    if (song.mood && (action === 'like' || action === 'complete')) {
      const moodKey = song.mood.toLowerCase();
      const updateField = `moodAffinity.${moodKey}`;
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { [updateField]: 0.05 }
      });
    }

    res.status(201).json({
      success: true,
      message: `Recorded ${action} interaction successfully`,
      data: {
        feedback
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get telemetry feedback statistics for current user
 * @route   GET /api/feedback/stats
 * @access  Private
 */
export const getFeedbackStats = async (req, res, next) => {
  try {
    const stats = await UserFeedback.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      likes: 0,
      skips: 0,
      completes: 0,
      dislikes: 0
    };

    stats.forEach(item => {
      if (item._id === 'like') formattedStats.likes = item.count;
      if (item._id === 'skip') formattedStats.skips = item.count;
      if (item._id === 'complete') formattedStats.completes = item.count;
      if (item._id === 'dislike') formattedStats.dislikes = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        stats: formattedStats
      }
    });
  } catch (error) {
    next(error);
  }
};
