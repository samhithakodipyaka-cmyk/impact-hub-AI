const ImpactRecord = require('../models/ImpactRecord');
const Participation = require('../models/Participation');
const User = require('../models/User');
const Initiative = require('../models/Initiative');

/**
 * Get individual user's verified impact dashboard data
 */
const getIndividualImpactDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Fetch all verified ImpactRecords
    const records = await ImpactRecord.find({ user: userId })
      .populate('initiative', 'title causeCategory startDate endDate location imageUrl')
      .populate('organization', 'name logoUrl verificationStatus')
      .sort({ verifiedAt: -1 })
      .lean();

    // Cause breakdown calculation (only from verified records!)
    const causeBreakdown = {};
    const monthlyHours = {};

    records.forEach((rec) => {
      const cause = rec.causeCategory || 'General';
      causeBreakdown[cause] = (causeBreakdown[cause] || 0) + (rec.verifiedHours || 0);

      if (rec.verifiedAt) {
        const monthKey = new Date(rec.verifiedAt).toISOString().slice(0, 7); // YYYY-MM
        monthlyHours[monthKey] = (monthlyHours[monthKey] || 0) + (rec.verifiedHours || 0);
      }
    });

    // Upcoming registered activities
    const upcoming = await Participation.find({
      user: userId,
      status: 'registered',
    })
      .populate({
        path: 'initiative',
        match: { endDate: { $gte: new Date() } },
        populate: { path: 'organization', select: 'name logoUrl' },
      })
      .sort({ createdAt: -1 })
      .lean();

    const validUpcoming = upcoming.filter((u) => u.initiative !== null);

    // Pending verification requests
    const pendingVerifications = await Participation.find({
      user: userId,
      verificationStatus: 'pending',
    })
      .populate('initiative', 'title causeCategory')
      .populate('organization', 'name')
      .lean();

    res.json({
      success: true,
      verifiedStats: user.verifiedStats,
      badges: user.badges || [],
      recentRecords: records.slice(0, 10),
      causeBreakdown,
      monthlyHours,
      upcomingCount: validUpcoming.length,
      upcomingActivities: validUpcoming.slice(0, 5),
      pendingVerificationCount: pendingVerifications.length,
      pendingVerifications,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public Platform Verified Impact Overview
 */
const getPlatformPublicImpact = async (req, res, next) => {
  try {
    const totalImpactHours = await ImpactRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$verifiedHours' } } },
    ]);

    const totalPeopleReached = await ImpactRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$peopleReached' } } },
    ]);

    const verifiedRecordsCount = await ImpactRecord.countDocuments();
    const activeVolunteersCount = await User.countDocuments({
      role: 'individual',
      'verifiedStats.activitiesCount': { $gt: 0 },
    });
    const initiativesCompletedCount = await Initiative.countDocuments({ status: 'completed' });

    // Causes breakdown across entire platform
    const causesAggregation = await ImpactRecord.aggregate([
      { $group: { _id: '$causeCategory', hours: { $sum: '$verifiedHours' }, count: { $sum: 1 } } },
      { $sort: { hours: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalVerifiedHours: Math.round((totalImpactHours[0]?.total || 0) * 10) / 10,
        totalPeopleReached: totalPeopleReached[0]?.total || 0,
        verifiedRecordsCount,
        activeVolunteersCount,
        initiativesCompletedCount,
        causesAggregation,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIndividualImpactDashboard,
  getPlatformPublicImpact,
};
