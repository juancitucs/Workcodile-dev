const Settings = require('../models/Settings');
const User = require('../models/User'); // Import the User model

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user.id });

    if (!settings) {
      settings = new Settings({ user: req.user.id });
      await settings.save();
    }

    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateSettings = async (req, res) => {
  const { notifications, privacy, display, sound } = req.body;

  try {
    let settings = await Settings.findOne({ user: req.user.id });

    if (!settings) {
      return res.status(404).json({ msg: 'Settings not found' });
    }

    if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
    if (privacy) settings.privacy = { ...settings.privacy, ...privacy };
    if (display) settings.display = { ...settings.display, ...display };
    if (sound) settings.sound = { ...settings.sound, ...sound };

    await settings.save();

    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getCompletedCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('completedCourses');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.completedCourses);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

exports.addCompletedCourse = async (req, res) => {
  const { courseId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.completedCourses.includes(courseId)) {
      user.completedCourses.push(courseId);
      await user.save();
    }
    res.status(200).json(user.completedCourses);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

exports.removeCompletedCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.completedCourses = user.completedCourses.filter(
      (course) => course !== courseId
    );
    await user.save();
    res.status(200).json(user.completedCourses);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};
