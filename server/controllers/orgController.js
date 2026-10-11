const Organization = require('../models/Organization');
const Initiative = require('../models/Initiative');
const Participation = require('../models/Participation');
const ImpactRecord = require('../models/ImpactRecord');
const { isValidHttpUrl } = require('../utils/validators');

/**
 * Get current organization profile for the logged in org user
 */
const getMyOrgProfile = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ owner: req.user._id });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'No organization profile found for this account.',
      });
    }

    res.json({ success: true, organization: org });
  } catch (err) {
    next(err);
  }
};

/**
 * Update organization profile details
 */
const updateMyOrgProfile = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      location,
      contactEmail,
      contactPhone,
      website,
      registrationNumber,
      logoUrl,
    } = req.body;

    const org = await Organization.findOne({ owner: req.user._id });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'No organization profile found.',
      });
    }

    if (name) org.name = name.trim();
    if (description) org.description = description.trim();
    if (category) org.category = category;
    if (contactEmail) org.contactEmail = contactEmail.trim();
    if (contactPhone !== undefined) org.contactPhone = contactPhone.trim();
    if (website !== undefined) {
      if (website && !isValidHttpUrl(website)) {
        return res.status(400).json({
          success: false,
          message: 'Website must be a valid URL.',
        });
      }
      org.website = website.trim();
    }
    if (registrationNumber !== undefined) org.registrationNumber = registrationNumber.trim();
    if (logoUrl !== undefined) {
      if (logoUrl && !isValidHttpUrl(logoUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Logo URL must be a valid URL.',
        });
      }
      org.logoUrl = logoUrl.trim();
    }

    if (location) {
      org.location = {
        address: location.address ? location.address.trim() : org.location.address,
        city: location.city ? location.city.trim() : org.location.city,
        state: location.state ? location.state.trim() : org.location.state,
        country: location.country ? location.country.trim() : org.location.country,
        lat: location.lat !== undefined ? location.lat : org.location.lat,
        lng: location.lng !== undefined ? location.lng : org.location.lng,
      };
    }

    await org.save();

    res.json({
      success: true,
      message: 'Organization profile updated successfully.',
      organization: org,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Submit organization verification request
 */
const submitVerificationRequest = async (req, res, next) => {
  try {
    const { verificationNotes, documentUrl, documentTitle } = req.body;

    const org = await Organization.findOne({ owner: req.user._id });
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    if (verificationNotes) org.verificationNotes = verificationNotes.trim();

    if (documentUrl && isValidHttpUrl(documentUrl)) {
      org.submittedDocuments.push({
        title: documentTitle ? documentTitle.trim() : 'Official Registration Document',
        url: documentUrl.trim(),
        uploadedAt: new Date(),
      });
    }

    org.verificationStatus = 'pending';
    org.rejectionReason = ''; // Clear prior rejection if resubmitted
    await org.save();

    res.json({
      success: true,
      message: 'Verification request submitted. Our platform administrators will review your application.',
      organization: org,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public organization profile
 */
const getPublicOrgProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const org = await Organization.findById(id).populate('owner', 'name email');

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    // Public initiatives by this org
    const initiatives = await Initiative.find({
      organization: id,
      status: { $in: ['published', 'ongoing', 'completed'] },
    }).sort({ startDate: -1 });

    res.json({
      success: true,
      organization: org,
      initiatives,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Organization Dashboard Metrics
 */
const getOrgDashboardMetrics = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ owner: req.user._id });
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    const initiativesCount = await Initiative.countDocuments({ organization: org._id });
    const activeInitiatives = await Initiative.countDocuments({
      organization: org._id,
      status: { $in: ['published', 'ongoing'] },
    });
    const completedInitiatives = await Initiative.countDocuments({
      organization: org._id,
      status: 'completed',
    });

    const totalRegistrations = await Participation.countDocuments({ organization: org._id });
    const pendingVerifications = await Participation.countDocuments({
      organization: org._id,
      verificationStatus: 'pending',
    });
    const verifiedParticipations = await Participation.countDocuments({
      organization: org._id,
      verificationStatus: 'verified',
    });

    // Authoritative verified impact hours & volunteers from ImpactRecord
    const impactRecords = await ImpactRecord.find({ organization: org._id });
    let totalVerifiedHours = 0;
    let totalPeopleReached = 0;
    const volunteerIds = new Set();

    impactRecords.forEach((r) => {
      totalVerifiedHours += r.verifiedHours || 0;
      totalPeopleReached += r.peopleReached || 0;
      if (r.user) volunteerIds.add(r.user.toString());
    });

    res.json({
      success: true,
      organization: org,
      metrics: {
        initiativesCount,
        activeInitiatives,
        completedInitiatives,
        totalRegistrations,
        pendingVerifications,
        verifiedParticipations,
        verifiedVolunteersCount: volunteerIds.size,
        totalVerifiedHours: Math.round(totalVerifiedHours * 10) / 10,
        totalPeopleReached,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyOrgProfile,
  updateMyOrgProfile,
  submitVerificationRequest,
  getPublicOrgProfile,
  getOrgDashboardMetrics,
};
