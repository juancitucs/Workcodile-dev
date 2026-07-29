const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isVerified: { type: Boolean, default: false }, // For email verification
        verificationCode: String, // For code-based verification
        verificationCodeExpires: Date, // Expiry for the verification code
        passwordResetCode: String, // For password reset code
        passwordResetExpires: Date, // Expiry for the password reset code
        avatar_key: { type: String },
        bio: { type: String },
        role: {
            type: String,
            enum: ['student', 'moderator', 'admin'],
            default: 'student',
        },
        interests: [{ type: String }],
        socialLinks: [
            {
                name: { type: String, required: true },
                url: { type: String, required: true },
            },
        ],
        bookmarked_posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
        // Sistema de XP y Niveles
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },

        // Estadísticas del usuario
        stats: {
            totalPosts: { type: Number, default: 0 },
            totalComments: { type: Number, default: 0 },
            totalLikesReceived: { type: Number, default: 0 },
            totalLikesGiven: { type: Number, default: 0 },
        },

        // Medallas desbloqueadas (opcional, para logros)
        badges: [
            {
                badgeId: String,
                unlockedAt: Date,
            },
        ],
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light',
        },
        completedCourses: [{ type: String, ref: 'Course' }],
    },
    { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
