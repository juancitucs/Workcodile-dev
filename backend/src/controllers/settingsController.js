const Settings = require('../models/Settings')
const User = require('../models/User')

const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id })
    if (!settings) {
      settings = new Settings({ user: req.user.id })
      await settings.save()
    }
    res.json(settings)
  } catch (err) {
    next(err)
  }
}

const updateSettings = async (req, res, next) => {
  const { notifications, privacy, display, sound } = req.body

  try {
    const settings = await Settings.findOne({ user: req.user.id })
    if (!settings) {return res.status(404).json({ message: 'Settings not found' })}

    if (notifications) {settings.notifications = { ...settings.notifications, ...notifications }}
    if (privacy) {settings.privacy = { ...settings.privacy, ...privacy }}
    if (display) {settings.display = { ...settings.display, ...display }}
    if (sound) {settings.sound = { ...settings.sound, ...sound }}

    await settings.save()
    res.json(settings)
  } catch (err) {
    next(err)
  }
}

const getCompletedCourses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('completedCourses')
    if (!user) {return res.status(404).json({ message: 'User not found' })}
    res.json(user.completedCourses)
  } catch (err) {
    next(err)
  }
}

const addCompletedCourse = async (req, res, next) => {
  const { courseId } = req.body
  try {
    const user = await User.findById(req.user.id)
    if (!user) {return res.status(404).json({ message: 'User not found' })}

    if (!user.completedCourses.includes(courseId)) {
      user.completedCourses.push(courseId)
      await user.save()
    }
    res.json(user.completedCourses)
  } catch (err) {
    next(err)
  }
}

const removeCompletedCourse = async (req, res, next) => {
  const { courseId } = req.params
  try {
    const user = await User.findById(req.user.id)
    if (!user) {return res.status(404).json({ message: 'User not found' })}

    user.completedCourses = user.completedCourses.filter(c => c !== courseId)
    await user.save()
    res.json(user.completedCourses)
  } catch (err) {
    next(err)
  }
}

module.exports = { getSettings, updateSettings, getCompletedCourses, addCompletedCourse, removeCompletedCourse }