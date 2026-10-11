const { getPersonalizedRecommendations } = require('../services/recommendationEngine');
const {
  whatCanIDo,
  generateOccasionIdeas,
  getOpportunityGaps,
  assistInitiativeDraft,
} = require('../services/aiActionService');

const getRecommendations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;
    const recommendations = await getPersonalizedRecommendations(req.user, limit);
    res.json({
      success: true,
      recommendations,
      meta: {
        engine: 'Rule-Based Weighted Multi-Factor Heuristic',
        factorsEvaluated: ['Interests', 'Skills', 'Location', 'Availability', 'Category Need'],
      },
    });
  } catch (err) {
    next(err);
  }
};

const handleWhatCanIDo = async (req, res, next) => {
  try {
    const { hoursAvailable, city, cause, skills } = req.body;
    const result = await whatCanIDo({
      hoursAvailable: parseFloat(hoursAvailable) || 2,
      city: city || (req.user?.location?.city || ''),
      cause: cause || '',
      skills: Array.isArray(skills) ? skills : (req.user?.skills || []),
    });
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

const handleOccasionIdeas = async (req, res, next) => {
  try {
    const { occasionType, preferredCause, guestCount } = req.body;
    const idea = generateOccasionIdeas(
      occasionType || 'birthday',
      preferredCause || 'Environment & Nature',
      parseInt(guestCount, 10) || 10
    );
    res.json({
      success: true,
      idea,
    });
  } catch (err) {
    next(err);
  }
};

const handleGapInsights = async (req, res, next) => {
  try {
    const gaps = await getOpportunityGaps();
    res.json({
      success: true,
      ...gaps,
    });
  } catch (err) {
    next(err);
  }
};

const handleAssistDraft = async (req, res, next) => {
  try {
    const { titleHint, category, targetCity } = req.body;
    const draft = assistInitiativeDraft({
      titleHint,
      category,
      targetCity,
    });
    res.json({
      success: true,
      draft,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecommendations,
  handleWhatCanIDo,
  handleOccasionIdeas,
  handleGapInsights,
  handleAssistDraft,
};
