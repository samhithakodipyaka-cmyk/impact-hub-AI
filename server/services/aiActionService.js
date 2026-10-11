const Initiative = require('../models/Initiative');

/**
 * Feature B: "What Can I Do?" Interactive Action Assistant
 */
const whatCanIDo = async ({ hoursAvailable = 2, city = '', cause = '', skills = [] }) => {
  const query = {
    status: { $in: ['published', 'ongoing'] },
    endDate: { $gte: new Date() },
  };

  if (city) {
    query['location.city'] = { $regex: new RegExp(city.trim(), 'i') };
  }
  if (cause && cause !== 'All Causes') {
    query.causeCategory = cause;
  }

  const matchingInitiatives = await Initiative.find(query)
    .populate('organization', 'name verificationStatus logoUrl')
    .limit(4)
    .lean();

  // If real initiatives match
  if (matchingInitiatives.length > 0) {
    return {
      type: 'real_initiatives',
      initiatives: matchingInitiatives,
      summary: `Found ${matchingInitiatives.length} verified real-world initiatives matching your criteria.`,
    };
  }

  // If no initiatives exist in the area, generate structured DIY Action Plan
  const diyActionPlans = {
    'Food & Hunger': {
      title: 'Community Surplus Food Rescue & Distribution',
      estimatedHours: hoursAvailable,
      checklist: [
        'Coordinate with 2-3 neighborhood bakeries, catering units, or restaurants for safe surplus food.',
        'Use clean, food-grade storage containers and label with preparation time.',
        'Deliver directly to a local shelter, night shelter, or verified community kitchen within 90 minutes.',
      ],
      impactOutcome: `Can safely nourish 25-40 individuals from food that would otherwise be wasted.`,
      safetyTips: 'Only accept freshly prepared, unserved surplus food. Follow thermal safety standards.',
    },
    'Environment & Nature': {
      title: 'Neighborhood Micro-Reforestation & Seedball Drive',
      estimatedHours: hoursAvailable,
      checklist: [
        'Procure native seeds (e.g. Neem, Peepal, Tamarind) and red clay soil.',
        'Gather 3-5 neighbors to mold 50 native seedballs.',
        'Disperse in monitored urban vacant plots or designated degraded green spaces with local authority consent.',
      ],
      impactOutcome: 'Potential growth of 15+ native shade-providing trees over the next monsoon cycle.',
      safetyTips: 'Plant only indigenous, non-invasive species suited to local rainfall levels.',
    },
    'Education & Literacy': {
      title: 'Sunday Digital Literacy & Book Donation Circle',
      estimatedHours: hoursAvailable,
      checklist: [
        'Collect 20 illustrated children books or basic learning materials from friends.',
        'Set up an open reading hour at a community center or government school ground.',
        'Engage 10-15 primary students in reading aloud and foundational math games.',
      ],
      impactOutcome: 'Fosters reading fluency and educational enthusiasm for 15 under-resourced children.',
      safetyTips: 'Coordinate in advance with community elders or school authorities for permission.',
    },
    'Animal Welfare': {
      title: 'Community Animal Hydration & First-Aid Patrol',
      estimatedHours: hoursAvailable,
      checklist: [
        'Install 5 clean water bowls in shaded spots across your street.',
        'Replenish daily and clean algae twice a week.',
        'Keep emergency contact numbers of 2 local animal rescue clinics saved.',
      ],
      impactOutcome: 'Sustains 20-30 community stray animals during extreme weather conditions.',
      safetyTips: 'Approach unfamiliar street animals cautiously. Never handle aggressive or sick animals alone.',
    },
  };

  const selectedCategory = cause || 'Environment & Nature';
  const plan = diyActionPlans[selectedCategory] || diyActionPlans['Environment & Nature'];

  return {
    type: 'diy_action_plan',
    actionPlan: {
      cause: selectedCategory,
      ...plan,
    },
    summary: `No live campaigns were found in "${city || 'your area'}" matching those filters. Here is an actionable DIY initiative you can initiate or mobilize today.`,
  };
};

/**
 * Feature C: Birthday & Occasion Impact Ideas Generator
 */
const generateOccasionIdeas = (occasionType, preferredCause, guestCount = 10) => {
  const templates = {
    birthday: {
      title: 'Birthday of Gratitude: Clean Green Celebration',
      description: `Celebrate your birthday by gifting life back to the planet. Instead of single-use party favors, invite ${guestCount} friends to plant native saplings and clean a local park.`,
      causeCategory: preferredCause || 'Environment & Nature',
      volunteerCapacity: Math.max(5, guestCount),
      estimatedHours: 2.5,
      checklist: [
        'Order 15-20 native saplings from a local government forestry nursery.',
        'Bring reusable gardening gloves and watering cans.',
        'Share clean compost and sapling care responsibilities among guests.',
      ],
      suggestedOutcomes: [
        `${guestCount} saplings planted with assigned 6-month caretakers`,
        'Zero-waste celebration preventing 5kg of party plastics',
      ],
    },
    anniversary: {
      title: 'Milestone of Kindness: Nourishing 100 Families',
      description: `Commemorate this anniversary by sponsoring and packaging wholesome ration kits for families in low-income community settlements.`,
      causeCategory: preferredCause || 'Food & Hunger',
      volunteerCapacity: Math.max(4, guestCount),
      estimatedHours: 3,
      checklist: [
        'Procure rice, lentils, oil, and salt in bulk packages.',
        'Set up a packing assembly line with volunteer friends.',
        'Coordinate with a verified local distribution partner.',
      ],
      suggestedOutcomes: [
        '50-100 wholesome dry-ration meal kits assembled and distributed',
        'Direct nutritional relief provided to vulnerable families',
      ],
    },
    corporate_team: {
      title: 'Team Impact Sprint: Community Cleanup & Segregation Drive',
      description: `Energize team spirit through a collaborative 3-hour micro-cleanup focused on lakebeds or public community spaces.`,
      causeCategory: preferredCause || 'Community Cleanup',
      volunteerCapacity: Math.max(10, guestCount),
      estimatedHours: 3,
      checklist: [
        'Arrange protective gloves, trash pickers, and color-coded segregation bags.',
        'Coordinate safe municipal waste pickup after the drive.',
        'Weigh collected waste to benchmark segregated dry recyclables.',
      ],
      suggestedOutcomes: [
        '100+ kg of plastic and litter removed from public grounds',
        '100% of recyclable plastics diverted to authorized recyclers',
      ],
    },
    memorial: {
      title: 'Living Legacy: Education & Library Endowment Drive',
      description: `Honor the memory of a loved one by establishing a reading corner and donating curated storybooks to a community school.`,
      causeCategory: preferredCause || 'Education & Literacy',
      volunteerCapacity: Math.max(5, guestCount),
      estimatedHours: 2,
      checklist: [
        'Gather 50-100 quality books suited for grades 1 through 8.',
        'Construct or set up a clean bookshelf with simple catalog tags.',
        'Hold an inaugural storytelling session with local students.',
      ],
      suggestedOutcomes: [
        '1 permanent community mini-library established',
        '60+ children gaining ongoing access to quality literature',
      ],
    },
  };

  const idea = templates[occasionType] || templates.birthday;
  return {
    ...idea,
    disclaimer: 'This draft is generated using structured community-impact guidelines. All details are fully editable and must be reviewed before publication.',
  };
};

/**
 * Feature D: Community Opportunity-Gap Insights
 */
const getOpportunityGaps = async () => {
  const categories = [
    'Food & Hunger',
    'Environment & Nature',
    'Education & Literacy',
    'Healthcare & Blood Donation',
    'Animal Welfare',
    'Community Cleanup',
    'Disaster Relief',
    'Civic Engagement',
  ];

  // Aggregate current published/ongoing initiatives by causeCategory
  const counts = await Initiative.aggregate([
    { $match: { status: { $in: ['published', 'ongoing', 'completed'] } } },
    { $group: { _id: '$causeCategory', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    countMap[c._id] = c.count;
  });

  const totalInitiatives = counts.reduce((acc, curr) => acc + curr.count, 0);

  const breakdown = categories.map((cat) => {
    const count = countMap[cat] || 0;
    const share = totalInitiatives > 0 ? Math.round((count / totalInitiatives) * 100) : 0;
    return {
      category: cat,
      count,
      sharePercentage: share,
      status: count === 0 ? 'High Opportunity Gap' : count <= 2 ? 'Moderate Gap' : 'Active Engagement',
    };
  });

  // Sort with highest gaps (lowest counts) first
  breakdown.sort((a, b) => a.count - b.count);

  const underServed = breakdown.filter((b) => b.count <= 1).map((b) => b.category);

  return {
    totalInitiativesTracked: totalInitiatives,
    breakdown,
    underServedCategories: underServed,
    insights: underServed.length > 0
      ? `Based on platform records, causes such as ${underServed.slice(0, 3).join(', ')} currently have the lowest initiative density. Organizations are encouraged to organize drives in these focus areas.`
      : 'Initiatives are evenly distributed across major social causes on ImpactHub.',
    disclaimer: 'These suggestions reflect recorded platform data and volunteer listings; they are data-informed indicators, not exhaustive scientific measures of municipal need.',
  };
};

/**
 * Feature E: Initiative Creation Assistant for NGOs
 */
const assistInitiativeDraft = ({ titleHint = '', category = 'Food & Hunger', targetCity = 'Hyderabad' }) => {
  const guidanceCatalog = {
    'Food & Hunger': {
      suggestedTitle: titleHint ? `${titleHint}` : `Weekend Food Rescue & Meal Distribution — ${targetCity}`,
      suggestedDescription: `Join our team in collecting wholesome surplus cooked food from partner commercial kitchens and delivering freshly packaged meals to families and shelters across ${targetCity}. Volunteers will assist with sorting, hygienic packing, and respectful community distribution.`,
      requiredSkills: ['Food Handling', 'Local Route Navigation', 'Teamwork', 'Empathetic Communication'],
      volunteerCapacity: 15,
      estimatedHours: 3,
      preparationChecklist: [
        'Bring hairnets, face masks, and food-grade disposable gloves.',
        'Wear comfortable closed-toe walking shoes.',
        'Carry a personal reusable water bottle.',
        'Follow hygienic food safety protocols at all times.',
      ],
      targetOutcomes: [
        '150-200 freshly prepared meals safely distributed',
        'Direct relief provided to local underserved shelters',
        'Zero edible food sent to landfill from participating kitchens',
      ],
    },
    'Environment & Nature': {
      suggestedTitle: titleHint ? `${titleHint}` : `Urban Miyawaki Afforestation & Tree Care — ${targetCity}`,
      suggestedDescription: `Help expand the green canopy of ${targetCity}. Volunteers will plant native varieties of saplings, mulch soil beds, install protective tree guards, and label tree species for long-term survival monitoring.`,
      requiredSkills: ['Gardening', 'Physical Stamina', 'Environmental Advocacy'],
      volunteerCapacity: 25,
      estimatedHours: 3.5,
      preparationChecklist: [
        'Wear outdoor clothes that you do not mind getting muddy.',
        'Bring sturdy sun protection (hat/cap and sunscreen).',
        'Gardening gloves and digging spades will be provided on site.',
      ],
      targetOutcomes: [
        '100 native saplings planted with survival geotags',
        'Bio-mulching applied to conserve soil moisture',
      ],
    },
    'Education & Literacy': {
      suggestedTitle: titleHint ? `${titleHint}` : `Foundational Math & STEM Mentorship Camp — ${targetCity}`,
      suggestedDescription: `Spend your weekend mentoring high school and middle school students from community learning centers. Facilitate interactive science experiments, practical arithmetic games, and career guidance conversations.`,
      requiredSkills: ['Teaching', 'Mathematics', 'Patience', 'Student Mentoring'],
      volunteerCapacity: 10,
      estimatedHours: 2.5,
      preparationChecklist: [
        'Review the supplied lesson modules 24 hours prior to the session.',
        'Bring stationery supplies and notebook for activities.',
        'Engage students in participatory, encouraging learning exercises.',
      ],
      targetOutcomes: [
        '30 students coached through practical geometry and algebra problem-solving',
        'Interactive learning modules provided for classroom retention',
      ],
    },
  };

  const guidance = guidanceCatalog[category] || guidanceCatalog['Environment & Nature'];

  return {
    category,
    ...guidance,
    disclaimer: 'AI-assisted draft generated via rule-based templates. All details are fully editable by the organization organizer.',
  };
};

module.exports = {
  whatCanIDo,
  generateOccasionIdeas,
  getOpportunityGaps,
  assistInitiativeDraft,
};
