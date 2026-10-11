const Initiative = require('../models/Initiative');
const Organization = require('../models/Organization');
const Participation = require('../models/Participation');
const { isValidHttpUrl } = require('../utils/validators');

/**
 * Get all initiatives with filtering, search, and pagination
 */
const getInitiatives = async (req, res, next) => {
  try {
    const {
      cause,
      city,
      status,
      search,
      skill,
      startDate,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // By default, show published or ongoing
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['published', 'ongoing'] };
    }

    if (cause && cause !== 'All Causes') {
      query.causeCategory = cause;
    }

    if (city && city.trim()) {
      query['location.city'] = { $regex: new RegExp(city.trim(), 'i') };
    }

    if (skill && skill.trim()) {
      query.requiredSkills = { $in: [new RegExp(skill.trim(), 'i')] };
    }

    if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: new RegExp(search.trim(), 'i') } },
        { description: { $regex: new RegExp(search.trim(), 'i') } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Initiative.countDocuments(query);
    const initiatives = await Initiative.find(query)
      .populate('organization', 'name verificationStatus logoUrl category location')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      initiatives,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Initiative Details by ID
 */
const getInitiativeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const initiative = await Initiative.findById(id).populate(
      'organization',
      'name description verificationStatus logoUrl category location contactEmail website'
    );

    if (!initiative) {
      return res.status(404).json({ success: false, message: 'Initiative not found.' });
    }

    // Check participation status for logged in user
    let userParticipation = null;
    if (req.user) {
      userParticipation = await Participation.findOne({
        initiative: id,
        user: req.user._id,
      });
    }

    res.json({
      success: true,
      initiative,
      userParticipation,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new Initiative (Organization only; must be approved to publish)
 */
const createInitiative = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ owner: req.user._id });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'No organization profile associated with your account.',
      });
    }

    // Only approved organizations can publish live public initiatives
    let status = req.body.status || 'published';
    if (org.verificationStatus !== 'approved' && status === 'published') {
      return res.status(403).json({
        success: false,
        message:
          'Your organization verification is currently pending or not approved. You can save initiatives as drafts, but cannot publish publicly until an administrator approves your verification.',
      });
    }

    const {
      title,
      description,
      causeCategory,
      startDate,
      endDate,
      startTime,
      endTime,
      estimatedHours,
      location,
      requiredSkills,
      volunteerCapacity,
      imageUrl,
      preparationChecklist,
      targetOutcomes,
      isAiGeneratedDraft,
    } = req.body;

    if (!title || !description || !causeCategory || !startDate || !endDate || !volunteerCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required initiative details.',
      });
    }

    if (imageUrl && !isValidHttpUrl(imageUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Image URL must be a valid http or https web address.',
      });
    }

    const initiative = new Initiative({
      organization: org._id,
      createdBy: req.user._id,
      title: title.trim(),
      description: description.trim(),
      causeCategory,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime: startTime || '09:00 AM',
      endTime: endTime || '12:00 PM',
      estimatedHours: estimatedHours || 3,
      location: {
        venue: location?.venue || '',
        address: location?.address || '',
        city: location?.city ? location.city.trim() : org.location.city,
        state: location?.state || org.location.state,
        country: location?.country || 'India',
        isVirtual: !!location?.isVirtual,
      },
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      volunteerCapacity: parseInt(volunteerCapacity, 10),
      status,
      imageUrl: imageUrl ? imageUrl.trim() : '',
      preparationChecklist: Array.isArray(preparationChecklist) ? preparationChecklist : [],
      targetOutcomes: Array.isArray(targetOutcomes) ? targetOutcomes : [],
      isAiGeneratedDraft: !!isAiGeneratedDraft,
    });

    await initiative.save();

    res.status(201).json({
      success: true,
      message: 'Initiative created successfully.',
      initiative,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing Initiative
 */
const updateInitiative = async (req, res, next) => {
  try {
    const { id } = req.params;
    const initiative = await Initiative.findById(id);

    if (!initiative) {
      return res.status(404).json({ success: false, message: 'Initiative not found.' });
    }

    // Check ownership or admin
    const org = await Organization.findOne({ owner: req.user._id });
    const isOwner = org && initiative.organization.toString() === org._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only edit initiatives created by your organization.',
      });
    }

    // If publishing, check org approval
    if (req.body.status === 'published' && org && org.verificationStatus !== 'approved' && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Organization verification must be approved before publishing publicly.',
      });
    }

    const fields = [
      'title',
      'description',
      'causeCategory',
      'startDate',
      'endDate',
      'startTime',
      'endTime',
      'estimatedHours',
      'location',
      'requiredSkills',
      'volunteerCapacity',
      'status',
      'imageUrl',
      'preparationChecklist',
      'targetOutcomes',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        initiative[field] = req.body[field];
      }
    });

    await initiative.save();

    res.json({
      success: true,
      message: 'Initiative updated successfully.',
      initiative,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get initiatives belonging to logged in organization
 */
const getMyOrgInitiatives = async (req, res, next) => {
  try {
    const org = await Organization.findOne({ owner: req.user._id });
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    const initiatives = await Initiative.find({ organization: org._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      initiatives,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInitiatives,
  getInitiativeById,
  createInitiative,
  updateInitiative,
  getMyOrgInitiatives,
};
