const ImpactRecord = require('../models/ImpactRecord');
const User = require('../models/User');
const Organization = require('../models/Organization');

const BADGE_DEFINITIONS = [
  {
    badgeId: 'first_step',
    name: 'First Step to Impact',
    description: 'Completed and verified your first community service initiative.',
    icon: 'compass',
    condition: (stats) => stats.activitiesCount >= 1,
  },
  {
    badgeId: 'community_builder',
    name: 'Community Builder',
    description: 'Contributed 10 or more verified volunteering hours.',
    icon: 'shield-check',
    condition: (stats) => stats.hours >= 10,
  },
  {
    badgeId: 'impact_champion',
    name: 'Impact Champion',
    description: 'Contributed 25 or more verified volunteering hours.',
    icon: 'award',
    condition: (stats) => stats.hours >= 25,
  },
  {
    badgeId: 'multi_cause_hero',
    name: 'Multi-Cause Changemaker',
    description: 'Actively participated in 3 or more distinct social causes.',
    icon: 'heart',
    condition: (stats) => stats.causesCount >= 3,
  },
  {
    badgeId: 'centurion_reach',
    name: 'Community Reach 100+',
    description: 'Contributed to initiatives directly assisting 100 or more people.',
    icon: 'users',
    condition: (stats) => stats.peopleReached >= 100,
  },
];

/**
 * Recalculate authoritative stats for a User from verified ImpactRecords
 */
const recalculateUserStats = async (userId) => {
  const records = await ImpactRecord.find({ user: userId });

  let totalHours = 0;
  let totalPeopleReached = 0;
  const causesSet = new Set();
  const initiativesSet = new Set();

  for (const rec of records) {
    totalHours += rec.verifiedHours || 0;
    totalPeopleReached += rec.peopleReached || 0;
    if (rec.causeCategory) causesSet.add(rec.causeCategory);
    if (rec.initiative) initiativesSet.add(rec.initiative.toString());
  }

  const verifiedStats = {
    hours: Math.round(totalHours * 10) / 10,
    activitiesCount: initiativesSet.size,
    causesCount: causesSet.size,
    peopleReached: totalPeopleReached,
  };

  const user = await User.findById(userId);
  if (!user) return verifiedStats;

  // Evaluate badges
  const existingBadgeIds = new Set((user.badges || []).map((b) => b.badgeId));
  const newBadges = [...(user.badges || [])];

  for (const def of BADGE_DEFINITIONS) {
    if (!existingBadgeIds.has(def.badgeId) && def.condition(verifiedStats)) {
      newBadges.push({
        badgeId: def.badgeId,
        name: def.name,
        description: def.description,
        icon: def.icon,
        awardedAt: new Date(),
      });
    }
  }

  user.verifiedStats = verifiedStats;
  user.badges = newBadges;
  await user.save();

  return verifiedStats;
};

/**
 * Recalculate authoritative stats for an Organization from verified ImpactRecords
 */
const recalculateOrgStats = async (orgId) => {
  const records = await ImpactRecord.find({ organization: orgId });

  let totalHours = 0;
  const volunteerSet = new Set();
  const initiativeSet = new Set();

  for (const rec of records) {
    totalHours += rec.verifiedHours || 0;
    if (rec.user) volunteerSet.add(rec.user.toString());
    if (rec.initiative) initiativeSet.add(rec.initiative.toString());
  }

  const metrics = {
    totalInitiatives: initiativeSet.size,
    activeVolunteers: volunteerSet.size,
    verifiedImpactHours: Math.round(totalHours * 10) / 10,
  };

  await Organization.findByIdAndUpdate(orgId, { metrics });
  return metrics;
};

module.exports = {
  recalculateUserStats,
  recalculateOrgStats,
  BADGE_DEFINITIONS,
};
