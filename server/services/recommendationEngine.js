const Initiative = require('../models/Initiative');
const Participation = require('../models/Participation');

/**
 * Rank initiatives with explainable rule scoring
 */
const getPersonalizedRecommendations = async (user, limit = 6) => {
  // Find published upcoming initiatives
  const now = new Date();
  const initiatives = await Initiative.find({
    status: { $in: ['published', 'ongoing'] },
    endDate: { $gte: now },
  })
    .populate('organization', 'name verificationStatus logoUrl category')
    .lean();

  if (!initiatives.length) return [];

  // Find user's past joined initiatives to learn cause affinities
  let pastCauseSet = new Set();
  let userJoinedInitiativeIds = new Set();
  if (user && user._id) {
    const userParticipations = await Participation.find({ user: user._id }).populate('initiative', 'causeCategory').lean();
    userParticipations.forEach((p) => {
      if (p.initiative) {
        userJoinedInitiativeIds.add(p.initiative._id ? p.initiative._id.toString() : p.initiative.toString());
        if (p.initiative.causeCategory) pastCauseSet.add(p.initiative.causeCategory);
      }
    });
  }

  const scoredList = initiatives
    .filter((init) => !userJoinedInitiativeIds.has(init._id.toString())) // exclude already joined
    .map((init) => {
      let score = 20; // baseline popularity/freshness score
      const explanations = [];

      // 1. Cause & Interest Match (+35)
      if (user && Array.isArray(user.interests) && user.interests.length > 0) {
        const matchesInterest = user.interests.some(
          (interest) => interest.toLowerCase().includes(init.causeCategory.toLowerCase()) ||
                        init.causeCategory.toLowerCase().includes(interest.toLowerCase())
        );
        if (matchesInterest) {
          score += 35;
          explanations.push(`Direct match with your interest in "${init.causeCategory}" (+35)`);
        }
      }

      // 2. Skill Alignment (+25)
      if (user && Array.isArray(user.skills) && user.skills.length > 0 && Array.isArray(init.requiredSkills)) {
        const matchingSkills = init.requiredSkills.filter((reqSkill) =>
          user.skills.some((uSkill) => uSkill.toLowerCase() === reqSkill.toLowerCase())
        );
        if (matchingSkills.length > 0) {
          const points = Math.min(matchingSkills.length * 15, 25);
          score += points;
          explanations.push(`Your skills match: ${matchingSkills.join(', ')} (+${points})`);
        }
      }

      // 3. Location Match (+20)
      if (user && user.location && user.location.city && init.location && init.location.city) {
        if (user.location.city.toLowerCase() === init.location.city.toLowerCase()) {
          score += 20;
          explanations.push(`Happening in your city: ${init.location.city} (+20)`);
        }
      }

      // 4. Past Cause Loyalty (+15)
      if (pastCauseSet.has(init.causeCategory)) {
        score += 15;
        explanations.push(`Matches your previous participation history in ${init.causeCategory} (+15)`);
      }

      // 5. Availability Schedule Match (+15)
      if (user && user.availability && init.startDate) {
        const dayOfWeek = new Date(init.startDate).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (isWeekend && user.availability.weekends) {
          score += 15;
          explanations.push('Scheduled on the weekend matching your active availability (+15)');
        } else if (!isWeekend && user.availability.weekdays) {
          score += 15;
          explanations.push('Scheduled on weekdays matching your active availability (+15)');
        }
      }

      // 6. Organization Trust (+10)
      if (init.organization && init.organization.verificationStatus === 'approved') {
        score += 10;
        explanations.push('Organized by a verified and trusted community partner (+10)');
      }

      // 7. Open Capacity Bonus (+10)
      const openSlots = (init.volunteerCapacity || 0) - (init.registeredCount || 0);
      if (openSlots > 0 && openSlots <= 5) {
        score += 10;
        explanations.push(`Urgent need for volunteers (${openSlots} spots remaining) (+10)`);
      }

      if (explanations.length === 0) {
        explanations.push('General recommended upcoming initiative (+20)');
      }

      return {
        ...init,
        aiRecommendation: {
          matchScore: score,
          explanation: explanations,
          algorithm: 'Rule-Based Weighted Multi-Factor Heuristic',
        },
      };
    });

  // Sort descending by matchScore
  scoredList.sort((a, b) => b.aiRecommendation.matchScore - a.aiRecommendation.matchScore);

  return scoredList.slice(0, limit);
};

module.exports = {
  getPersonalizedRecommendations,
};
