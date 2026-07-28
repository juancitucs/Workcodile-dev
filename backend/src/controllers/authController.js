const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config/env')
const { sendVerificationCodeEmail, sendPasswordResetCodeEmail } = require('../services/email/email.service')
const { getFileUrl } = require('../services/storage/storage.service')

const sendVerificationCode = async (req, res, next) => {
  const { name, email, password } = req.body

  try {
    let user = await User.findOne({ email })
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: 'User already exists and is verified.' })
      }
    } else {
      user = new User({ name, email, password, isVerified: false })
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    user.verificationCode = verificationCode
    user.verificationCodeExpires = Date.now() + 600000

    await user.save()
    await sendVerificationCodeEmail(user.email, user.name, verificationCode)

    res.status(200).json({ message: 'Verification code sent. Please check your email to complete registration.' })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please confirm your email address to log in.' })
    }

    const payload = { user: { id: user.id } }

    jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
      (err, token) => {
        if (err) {throw err}
        res.json({ token, user })
      }
    )
  } catch (err) {
    next(err)
  }
}

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.avatar_key) {
      user.avatar = getFileUrl(user.avatar_key)
    }
    user.id = user._id.toString()
    delete user._id

    res.json(user)
  } catch (err) {
    next(err)
  }
}

const updateUserTheme = async (req, res, next) => {
  const { theme } = req.body
  if (!['light', 'dark'].includes(theme)) {
    return res.status(400).json({ message: 'Invalid theme' })
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { theme },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (err) {
    next(err)
  }
}

const updateProfile = async (req, res, next) => {
  const { name, bio, interests, avatar_key, socialLinks } = req.body

  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (name !== undefined) {user.name = name}
    if (bio !== undefined) {user.bio = bio}
    if (interests !== undefined) {user.interests = interests}
    if (avatar_key !== undefined) {user.avatar_key = avatar_key}
    if (socialLinks !== undefined) {user.socialLinks = socialLinks}

    await user.save()
    res.json(user)
  } catch (err) {
    next(err)
  }
}

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.avatar_key) {
      user.avatar = getFileUrl(user.avatar_key)
    }
    user.id = user._id.toString()
    delete user._id

    res.json(user)
  } catch (err) {
    next(err)
  }
}

const verifyAndRegister = async (req, res, next) => {
  const { email, verificationCode } = req.body

  try {
    const user = await User.findOne({
      email,
      verificationCode: verificationCode,
      verificationCodeExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification code or it has expired.' })
    }

    user.isVerified = true
    user.verificationCode = undefined
    user.verificationCodeExpires = undefined
    await user.save()

    const payload = { user: { id: user.id } }

    jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
      (err, token) => {
        if (err) {throw err}
        res.json({ token, user })
      }
    )
  } catch (err) {
    next(err)
  }
}

const forgotPassword = async (req, res, next) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(200).json({ message: 'If a user with that email exists, a password reset code has been sent.' })
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    user.passwordResetCode = resetCode
    user.passwordResetExpires = Date.now() + 600000

    await user.save()
    await sendPasswordResetCodeEmail(user.email, user.name, resetCode)

    res.status(200).json({ message: 'A password reset code has been sent to your email.' })
  } catch (err) {
    next(err)
  }
}

const resetPassword = async (req, res, next) => {
  const { code, password } = req.body

  try {
    const user = await User.findOne({
      passwordResetCode: code,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset code or it has expired.' })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    user.passwordResetCode = undefined
    user.passwordResetExpires = undefined

    await user.save()
    res.status(200).json({ message: 'Password has been reset successfully.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { sendVerificationCode, verifyAndRegister, login, getMe, updateUserTheme, updateProfile, getUserById, forgotPassword, resetPassword }