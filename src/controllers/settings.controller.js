const Settings = require('../models/Settings.model');

// Get settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ isDeleted: { $ne: true } });
    
    if (!settings) {
      // Create default settings if not exists
      settings = new Settings();
      await settings.save();
    }
    
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ isDeleted: { $ne: true } });
    
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
      settings.updatedBy = req.body.updatedBy || 'Admin';
    }
    
    await settings.save();
    
    res.status(200).json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
