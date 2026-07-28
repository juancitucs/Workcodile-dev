const User = require('../models/User');

/**
 * Calculates a user's level based on their total XP.
 * XP required for level N = 100 * (2 ^ (N - 1))
 * @param {number} xp - The total experience points of the user.
 * @returns {number} The calculated level.
 */
function calculateLevel(xp) {
  let level = 1;
  let xpForNextLevel = 100;

  while (xp >= xpForNextLevel && level < 20) {
    xp -= xpForNextLevel;
    level++;
    xpForNextLevel *= 2;
  }

  return level;
}

/**
 * Adds experience points to a user and updates their stats and level.
 * @param {string} userId - The ID of the user.
 * @param {number} amount - The amount of XP to add.
 * @param {object} statUpdate - An object representing the stat to increment, e.g., { totalPosts: 1 }.
 * @returns {Promise<void>}
 */
async function addXP(userId, amount, statUpdate = {}) {
  if (!userId || !amount) {return;}

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`addXP: User not found with ID ${userId}`);
      return;
    }

    // Update XP
    user.xp += amount;

    // Update stats
    if (statUpdate) {
      for (const stat in statUpdate) {
        if (user.stats[stat] !== undefined) {
          user.stats[stat] += statUpdate[stat];
        }
      }
    }

    // Recalculate level
    const newLevel = calculateLevel(user.xp);
    if (newLevel !== user.level) {
      user.level = newLevel;
      // Here you could also trigger a 'level up' notification in the future
    }

    await user.save();
  } catch (error) {
    console.error(`Error adding XP to user ${userId}:`, error);
  }
}

module.exports = {
  addXP,
  calculateLevel,
};
