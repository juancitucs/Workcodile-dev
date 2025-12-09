const Settings = require('../models/Settings');

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
