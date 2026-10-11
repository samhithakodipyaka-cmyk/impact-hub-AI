const Report = require('../models/Report');

const submitReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'targetType, targetId, and reason are required fields.',
      });
    }

    const report = new Report({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      details: details ? details.trim() : '',
      status: 'pending',
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted. Platform administrators will investigate this content.',
      report,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitReport,
};
