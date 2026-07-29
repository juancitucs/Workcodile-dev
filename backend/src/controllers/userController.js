const User = require('../models/User');
const { getFileUrl } = require('../services/storage/storage.service');

const getTopUsers = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;

        const topUsers = await User.find({ isVerified: true })
            .sort({ xp: -1 })
            .limit(limit)
            .select('name avatar_key level xp stats.totalPosts stats.totalLikesReceived');

        const formattedUsers = topUsers.map((user) => ({
            id: user._id,
            name: user.name,
            avatar: user.avatar_key ? getFileUrl(user.avatar_key) : null,
            level: user.level,
            xp: user.xp,
            totalPosts: user.stats.totalPosts,
            totalLikes: user.stats.totalLikesReceived,
        }));

        res.json(formattedUsers);
    } catch (err) {
        next(err);
    }
};

module.exports = { getTopUsers };
