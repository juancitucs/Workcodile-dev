const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto'); // Added for token generation
const { sendVerificationCodeEmail, sendPasswordResetCodeEmail } = require('../services/email/email.service'); // Added for sending verification code email
const { getFileUrl } = require('../services/storage/storage.service'); // Added for getting file public URL

const sendVerificationCode = async (req, res) => { // Renamed from register
  const { name, email, password } = req.body

  try {
    let user = await User.findOne({ email })
    if (user) { // If user already exists, check if they are verified
      if (user.isVerified) {
        return res.status(400).json({ msg: 'User already exists and is verified.' });
      } else {
        // User exists but is not verified, resend code or update existing
        // For now, let's just update the existing user's code
        // and send a message to check email.
      }
    } else {
      // Create a temporary user record but don't save yet, just for token storage
      user = new User({ // Create new user object
        name,
        email,
        password,
        isVerified: false, // Ensure it's false
      });
      // Hash password (moved here as user is not saved yet)
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 600000; // 10 minutes

    // Save the user (or update if already existed but unverified)
    await user.save();

    // Send verification code email
    await sendVerificationCodeEmail(user.email, user.name, verificationCode);

    res.status(200).json({ msg: 'Verification code sent. Please check your email to complete registration.' });

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    let user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' })
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Please confirm your email address to log in.' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err
        res.json({ token, user })
      }
    )
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
}

const getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id).select('-password').lean(); // Use .lean() for plain JS object
    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }
    if (user.avatar_key) {
      user.avatar = getFileUrl(user.avatar_key); // Add full avatar URL
    }
    // Manually map _id to id (as a string) to match frontend Type
    user.id = user._id.toString();
    delete user._id;

    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error');
  }
};

const updateUserTheme = async (req, res) => {
  const { theme } = req.body;
  if (!['light', 'dark'].includes(theme)) {
    return res.status(400).json({ msg: 'Invalid theme' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { theme },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateProfile = async (req, res) => {
  const { name, bio, interests, avatar_key, socialLinks } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.interests = interests || user.interests;
    user.avatar_key = avatar_key || user.avatar_key;
    user.socialLinks = socialLinks || user.socialLinks;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean(); // Use .lean() for plain JS object
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (user.avatar_key) {
      user.avatar = getFileUrl(user.avatar_key); // Add full avatar URL
    }
    // Manually map _id to id (as a string) to match frontend Type
    user.id = user._id.toString();
    delete user._id;
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

const verifyAndRegister = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({
      email,
      verificationCode: verificationCode,
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid verification code or it has expired.' });
    }

    // If code is valid, finalize registration
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Log in the user after successful registration
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'my_jwt_secret',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user });
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // To prevent user enumeration, we send a generic success message even if the user doesn't exist.
      return res.status(200).json({ msg: 'If a user with that email exists, a password reset code has been sent.' });
    }

    // Generate a 6-digit password reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = Date.now() + 600000; // 10 minutes

    await user.save();

    // Send password reset code email
    await sendPasswordResetCodeEmail(user.email, user.name, resetCode);

    res.status(200).json({ msg: 'A password reset code has been sent to your email.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { code, password } = req.body;

  try {
    const user = await User.findOne({
      passwordResetCode: code,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid reset code or it has expired.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear the password reset fields
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({ msg: 'Password has been reset successfully.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { sendVerificationCode, verifyAndRegister, login, getMe, updateUserTheme, updateProfile, getUserById, forgotPassword, resetPassword };