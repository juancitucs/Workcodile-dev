const User = require('../models/User');

/**
 * Get Top Users by XP
 * @route GET /api/users/top
 * @access Public
 */
exports.getTopUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const topUsers = await User.find({})
      .sort({ xp: -1 })
      .limit(limit)
      .select('name avatar_key level xp stats.totalPosts stats.totalLikesReceived');

    // The full avatar URL is now constructed on the frontend or is already stored.
    // Here, we just pass the necessary data.
    const formattedUsers = topUsers.map(user => ({
      id: user._id,
      name: user.name,
      avatar: user.avatar_key, // The frontend will handle constructing the full URL if needed
      level: user.level,
      xp: user.xp,
      totalPosts: user.stats.totalPosts,
      totalLikes: user.stats.totalLikesReceived,
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
