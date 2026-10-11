const Participation = require('../models/Participation');
const Initiative = require('../models/Initiative');
const Organization = require('../models/Organization');
const ImpactRecord = require('../models/ImpactRecord');
const { recalculateUserStats, recalculateOrgStats } = require('../services/impactAggregator');
const { createNotification } = require('../services/notificationService');
const { isValidHttpUrl } = require('../utils/validators');

/**
 * Join an Initiative (Individual / Volunteer)
 */
const joinInitiative = async (req, res, next) => {
  try {
    const { initiativeId } = req.params;
    const userId = req.user._id;

    const initiative = await Initiative.findById(initiativeId).populate('organization');
    if (!initiative) {
      return res.status(404).json({ success: false, message: 'Initiative not found.' });
    }

    if (initiative.status !== 'published' && initiative.status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        message: 'This initiative is no longer open for new registrations.',
      });
    }

    // Check if user is the organizer (prevent self-joining)
    if (initiative.createdBy.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot register as a participant in your own initiative.',
      });
    }

    // Check capacity
    if (initiative.registeredCount >= initiative.volunteerCapacity) {
      return res.status(400).json({
        success: false,
        message: 'This initiative has reached its maximum volunteer capacity.',
      });
    }

    // Check for existing registration
    const existing = await Participation.findOne({ user: userId, initiative: initiativeId });
    if (existing) {
      if (existing.status === 'cancelled') {
        // Re-activate cancelled registration
        existing.status = 'registered';
        existing.verificationStatus = 'unverified';
        existing.rejectionReason = '';
        await existing.save();

        await Initiative.findByIdAndUpdate(initiativeId, { $inc: { registeredCount: 1 } });

        return res.json({
          success: true,
          message: 'Re-registered for initiative successfully.',
          participation: existing,
        });
      }
      return res.status(409).json({
        success: false,
        message: 'You have already registered for this initiative.',
        participation: existing,
      });
    }

    const participation = new Participation({
      user: userId,
      initiative: initiative._id,
      organization: initiative.organization._id,
      status: 'registered',
      verificationStatus: 'unverified',
    });

    await participation.save();

    // Increment registered count
    await Initiative.findByIdAndUpdate(initiativeId, { $inc: { registeredCount: 1 } });

    // Notify organization
    if (initiative.organization && initiative.organization.owner) {
      await createNotification({
        recipientId: initiative.organization.owner,
        title: 'New Volunteer Registered',
        message: `${req.user.name} has registered for "${initiative.title}".`,
        type: 'participation',
        link: `/initiatives/${initiative._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered for initiative!',
      participation,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel participation
 */
const cancelParticipation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const participation = await Participation.findOne({ _id: id, user: userId });
    if (!participation) {
      return res.status(404).json({ success: false, message: 'Participation record not found.' });
    }

    if (participation.verificationStatus === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an activity that has already been verified and recorded.',
      });
    }

    if (participation.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Participation is already cancelled.' });
    }

    participation.status = 'cancelled';
    await participation.save();

    await Initiative.findByIdAndUpdate(participation.initiative, {
      $inc: { registeredCount: -1 },
    });

    res.json({
      success: true,
      message: 'Participation has been cancelled.',
      participation,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Submit Participation Evidence & Activity Outcomes
 */
const submitEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { hoursClaimed, evidenceNotes, evidenceUrls, peopleReachedClaimed } = req.body;

    const participation = await Participation.findOne({ _id: id, user: userId })
      .populate('initiative')
      .populate('organization');

    if (!participation) {
      return res.status(404).json({ success: false, message: 'Participation record not found.' });
    }

    if (participation.verificationStatus === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'This activity has already been verified. Further evidence cannot be submitted.',
      });
    }

    if (!evidenceNotes || !evidenceNotes.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide notes describing your contribution and what was accomplished.',
      });
    }

    const hours = parseFloat(hoursClaimed);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      return res.status(400).json({
        success: false,
        message: 'Claimed hours must be between 0.5 and 24 hours.',
      });
    }

    // Validate evidence URLs
    const validatedUrls = [];
    if (Array.isArray(evidenceUrls)) {
      for (const u of evidenceUrls) {
        if (u && isValidHttpUrl(u)) {
          validatedUrls.push(u.trim());
        }
      }
    }

    participation.status = 'attended';
    participation.verificationStatus = 'pending';
    participation.hoursClaimed = hours;
    participation.evidenceNotes = evidenceNotes.trim();
    participation.evidenceUrls = validatedUrls;
    participation.peopleReachedClaimed = parseInt(peopleReachedClaimed, 10) || 0;
    participation.submittedAt = new Date();
    participation.rejectionReason = '';

    await participation.save();

    // Notify organization
    if (participation.organization && participation.organization.owner) {
      await createNotification({
        recipientId: participation.organization.owner,
        title: 'Volunteer Evidence Submitted',
        message: `${req.user.name} submitted completion evidence for "${participation.initiative.title}". Please review.`,
        type: 'verification',
        link: `/organization/dashboard`,
      });
    }

    res.json({
      success: true,
      message: 'Evidence submitted successfully! It is now pending organization verification.',
      participation,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Organization Review: Approve or Reject Verification
 */
const verifyParticipation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, rejectionReason, verifiedHours, peopleReached, contributionType } = req.body;

    const participation = await Participation.findById(id)
      .populate('initiative')
      .populate('organization')
      .populate('user');

    if (!participation) {
      return res.status(404).json({ success: false, message: 'Participation record not found.' });
    }

    // Check authorization: must be organization owner or admin
    const isOrgOwner =
      participation.organization &&
      participation.organization.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOrgOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the organizing organization or an administrator can verify participation.',
      });
    }

    // Invariant: Self-approval prevention
    if (participation.user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Conflict of interest: You cannot verify your own participation submission.',
      });
    }

    // Invariant: Prevent double verification
    if (participation.verificationStatus === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'This participation record has already been verified and recorded.',
      });
    }

    if (decision === 'reject') {
      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json({
          success: false,
          message: 'A rejection reason is required when rejecting verification.',
        });
      }

      participation.verificationStatus = 'rejected';
      participation.rejectionReason = rejectionReason.trim();
      participation.verifiedBy = req.user._id;
      participation.verifiedAt = new Date();
      await participation.save();

      // Notify participant
      await createNotification({
        recipientId: participation.user._id,
        title: 'Participation Verification Update',
        message: `Your verification for "${participation.initiative.title}" was not approved: ${rejectionReason.trim()}`,
        type: 'verification',
        link: '/my-activities',
      });

      return res.json({
        success: true,
        message: 'Participation rejected with recorded reason.',
        participation,
      });
    }

    if (decision === 'approve') {
      const finalHours = parseFloat(verifiedHours) || participation.hoursClaimed || participation.initiative.estimatedHours || 3;
      const finalPeople = parseInt(peopleReached, 10) || participation.peopleReachedClaimed || 0;

      // Check if ImpactRecord already exists
      let impactRecord = await ImpactRecord.findOne({ participation: participation._id });
      if (!impactRecord) {
        impactRecord = new ImpactRecord({
          participation: participation._id,
          user: participation.user._id,
          initiative: participation.initiative._id,
          organization: participation.organization._id,
          causeCategory: participation.initiative.causeCategory,
          contributionType: contributionType || 'field_volunteering',
          verifiedHours: finalHours,
          peopleReached: finalPeople,
          outcomeSummary: participation.evidenceNotes || 'Verified on-site participation.',
          evidenceUrls: participation.evidenceUrls,
          verifiedBy: req.user._id,
          verifiedAt: new Date(),
        });
        await impactRecord.save();
      }

      participation.status = 'completed';
      participation.verificationStatus = 'verified';
      participation.verifiedBy = req.user._id;
      participation.verifiedAt = new Date();
      participation.impactRecord = impactRecord._id;
      await participation.save();

      // Authoritative aggregate updates!
      const userStats = await recalculateUserStats(participation.user._id);
      await recalculateOrgStats(participation.organization._id);

      // Notify participant of verified impact
      await createNotification({
        recipientId: participation.user._id,
        title: 'Impact Verified! 🎉',
        message: `Your participation in "${participation.initiative.title}" has been verified! +${finalHours} hours added to your official impact record.`,
        type: 'verification',
        link: '/impact-dashboard',
      });

      return res.json({
        success: true,
        message: 'Participation verified successfully and authoritative impact recorded!',
        participation,
        impactRecord,
        updatedUserStats: userStats,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Decision must be either "approve" or "reject".',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current user's activities
 */
const getMyActivities = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, verification } = req.query;

    const query = { user: userId };
    if (status) query.status = status;
    if (verification) query.verificationStatus = verification;

    const participations = await Participation.find(query)
      .populate({
        path: 'initiative',
        populate: { path: 'organization', select: 'name logoUrl verificationStatus' },
      })
      .populate('impactRecord')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      participations,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get participants for an initiative (for organization organizer)
 */
const getInitiativeParticipants = async (req, res, next) => {
  try {
    const { initiativeId } = req.params;

    const initiative = await Initiative.findById(initiativeId);
    if (!initiative) {
      return res.status(404).json({ success: false, message: 'Initiative not found.' });
    }

    const org = await Organization.findOne({ owner: req.user._id });
    const isOwner = org && initiative.organization.toString() === org._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the hosting organization or admin can view volunteer details.',
      });
    }

    const participants = await Participation.find({ initiative: initiativeId })
      .populate('user', 'name email avatarUrl location skills verifiedStats')
      .populate('impactRecord')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      initiative,
      participants,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  joinInitiative,
  cancelParticipation,
  submitEvidence,
  verifyParticipation,
  getMyActivities,
  getInitiativeParticipants,
};
