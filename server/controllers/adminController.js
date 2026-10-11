const User = require('../models/User');
const Organization = require('../models/Organization');
const Initiative = require('../models/Initiative');
const Participation = require('../models/Participation');
const ImpactRecord = require('../models/ImpactRecord');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

/**
 * Platform overview metrics
 */
const getAdminOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const individualUsers = await User.countDocuments({ role: 'individual' });
    const totalOrganizations = await Organization.countDocuments();
    const pendingOrganizations = await Organization.countDocuments({ verificationStatus: 'pending' });
    const approvedOrganizations = await Organization.countDocuments({ verificationStatus: 'approved' });

    const totalInitiatives = await Initiative.countDocuments();
    const activeInitiatives = await Initiative.countDocuments({ status: { $in: ['published', 'ongoing'] } });

    const totalParticipations = await Participation.countDocuments();
    const verifiedParticipations = await Participation.countDocuments({ verificationStatus: 'verified' });

    const totalImpactHoursAgg = await ImpactRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$verifiedHours' } } },
    ]);
    const totalVerifiedHours = Math.round((totalImpactHoursAgg[0]?.total || 0) * 10) / 10;

    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Recent 5 audit logs
    const recentAudits = await AuditLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      metrics: {
        totalUsers,
        individualUsers,
        totalOrganizations,
        pendingOrganizations,
        approvedOrganizations,
        totalInitiatives,
        activeInitiatives,
        totalParticipations,
        verifiedParticipations,
        totalVerifiedHours,
        pendingReports,
      },
      recentAudits,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List organizations for moderation/verification
 */
const getOrganizations = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.verificationStatus = status;
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search.trim(), 'i') } },
        { contactEmail: { $regex: new RegExp(search.trim(), 'i') } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Organization.countDocuments(query);
    const organizations = await Organization.find(query)
      .populate('owner', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      organizations,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Approve or Reject Organization Verification
 */
const verifyOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, rejectionReason } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "approved", "rejected", or "pending".',
      });
    }

    const org = await Organization.findById(id).populate('owner');
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    org.verificationStatus = status;
    org.verifiedBy = req.user._id;
    org.verifiedAt = new Date();
    if (notes) org.verificationNotes = notes;
    if (status === 'rejected') {
      org.rejectionReason = rejectionReason || 'Documentation did not meet criteria.';
    } else {
      org.rejectionReason = '';
    }

    await org.save();

    // Log admin audit
    await logAudit({
      adminId: req.user._id,
      action: `ORGANIZATION_VERIFICATION_${status.toUpperCase()}`,
      targetType: 'Organization',
      targetId: org._id,
      details: { status, notes, rejectionReason },
      ipAddress: req.ip,
    });

    // Notify organization owner
    await createNotification({
      recipientId: org.owner._id,
      title: `Organization Verification ${status === 'approved' ? 'Approved' : 'Decision'}`,
      message:
        status === 'approved'
          ? `Congratulations! ${org.name} has been verified. You can now publish public community initiatives.`
          : `Verification for ${org.name} was ${status}: ${org.rejectionReason}`,
      type: 'organization',
      link: '/organization/dashboard',
    });

    res.json({
      success: true,
      message: `Organization verification marked as ${status}.`,
      organization: org,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List users for management
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search.trim(), 'i') } },
        { email: { $regex: new RegExp(search.trim(), 'i') } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      users,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user status (suspend / restore)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or suspended.' });
    }

    if (id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own account.' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.status = status;
    await user.save();

    await logAudit({
      adminId: req.user._id,
      action: `USER_STATUS_${status.toUpperCase()}`,
      targetType: 'User',
      targetId: user._id,
      details: { previousStatus: user.status, newStatus: status, reason },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User status updated to ${status}.`,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List moderation reports
 */
const getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('reporter', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      reports,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Resolve or dismiss moderation report
 */
const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    if (!['resolved', 'dismissed', 'reviewed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be resolved, dismissed, or reviewed.',
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    report.status = status;
    report.actionTaken = actionTaken || '';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    await logAudit({
      adminId: req.user._id,
      action: `REPORT_${status.toUpperCase()}`,
      targetType: 'Report',
      targetId: report._id,
      details: { actionTaken, targetType: report.targetType, targetId: report.targetId },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Report marked as ${status}.`,
      report,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List audit logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      logs,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminOverview,
  getOrganizations,
  verifyOrganization,
  getUsers,
  updateUserStatus,
  getReports,
  resolveReport,
  getAuditLogs,
};
