const User = require('../models/User');
const Organization = require('../models/Organization');
const Initiative = require('../models/Initiative');
const Participation = require('../models/Participation');
const ImpactRecord = require('../models/ImpactRecord');
const Post = require('../models/Post');
const { recalculateUserStats, recalculateOrgStats } = require('../services/impactAggregator');

const seedInitialData = async () => {
  const existingAnanya = await User.findOne({ email: 'ananya.sharma@example.com' });
  if (existingAnanya) {
    return; // Already populated
  }

  console.log('[Seed Data] Seeding initial authentic social impact records...');

  // 1. Create Organization Owner 1: GreenCanopy
  let orgUser1 = await User.findOne({ email: 'greencanopy@impacthub.ai' });
  if (!orgUser1) {
    orgUser1 = await User.create({
      name: 'Dr. Radhika Sen',
      email: 'greencanopy@impacthub.ai',
      password: 'OrgPassword2026!',
      role: 'organization',
      bio: 'Environmental ecologist coordinating urban micro-forest projects and lake revival drives.',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
    });
  }

  let org1 = await Organization.findOne({ owner: orgUser1._id });
  if (!org1) {
    org1 = await Organization.create({
      owner: orgUser1._id,
      name: 'GreenCanopy Foundation',
      category: 'Environment & Nature',
      description:
        'A citizen-driven environmental conservation trust committed to increasing urban canopy cover, restoring lake ecosystems, and promoting climate literacy.',
      location: {
        address: '14 Indiranagar 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
      },
      contactEmail: 'contact@greencanopy.org',
      contactPhone: '+91 80 4123 9876',
      website: 'https://greencanopy.org',
      registrationNumber: 'BLR/TRUST/2021/8942',
      verificationStatus: 'approved',
      verificationNotes: 'Registered charitable trust verified with 80G registration documentation.',
      logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&q=80',
    });
    orgUser1.organizationProfile = org1._id;
    await orgUser1.save();
  }

  // 2. Create Organization Owner 2: Aahaar Food Rescue
  let orgUser2 = await User.findOne({ email: 'aahaar@impacthub.ai' });
  if (!orgUser2) {
    orgUser2 = await User.create({
      name: 'Vikram Joshi',
      email: 'aahaar@impacthub.ai',
      password: 'OrgPassword2026!',
      role: 'organization',
      bio: 'Logistics coordinator working to eradicate food waste through community redistribution.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    });
  }

  let org2 = await Organization.findOne({ owner: orgUser2._id });
  if (!org2) {
    org2 = await Organization.create({
      owner: orgUser2._id,
      name: 'Aahaar Food Rescue Alliance',
      category: 'Food & Hunger',
      description:
        'Mobilizing volunteer food-rescue teams to collect safe surplus meals from events, corporate cafeterias, and restaurants for direct delivery to hunger shelters.',
      location: {
        address: '42 Banjara Hills Road No 3',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
      },
      contactEmail: 'helpline@aahaarrescue.org',
      contactPhone: '+91 40 2345 6789',
      website: 'https://aahaarrescue.org',
      registrationNumber: 'HYD/SOC/2019/3312',
      verificationStatus: 'approved',
      verificationNotes: 'Verified community non-profit partner operating 24/7 helpline.',
      logoUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=80',
    });
    orgUser2.organizationProfile = org2._id;
    await orgUser2.save();
  }

  // 3. Create Volunteers
  let volunteer1 = await User.findOne({ email: 'ananya.sharma@example.com' });
  if (!volunteer1) {
    volunteer1 = await User.create({
      name: 'Ananya Sharma',
      email: 'ananya.sharma@example.com',
      password: 'VolunteerPass1!',
      role: 'individual',
      bio: 'Computer science undergraduate passionate about environmental stewardship and weekend food distribution drives.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      skills: ['Food Handling', 'Digital Photography', 'Teamwork', 'Teaching'],
      interests: ['Food & Hunger', 'Environment & Nature', 'Education & Literacy'],
      availability: { weekdays: false, weekends: true, mornings: true, afternoons: false, evenings: true },
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    });
  }

  let volunteer2 = await User.findOne({ email: 'rahul.verma@example.com' });
  if (!volunteer2) {
    volunteer2 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      password: 'VolunteerPass2!',
      role: 'individual',
      bio: 'Software engineer volunteer interested in tree plantation drives and community cleanups.',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      skills: ['Gardening', 'Physical Stamina', 'Logistics'],
      interests: ['Environment & Nature', 'Community Cleanup'],
      availability: { weekdays: false, weekends: true, mornings: true, afternoons: true, evenings: false },
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    });
  }

  // 4. Create Initiatives
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const init1 = await Initiative.create({
    organization: org2._id,
    createdBy: orgUser2._id,
    title: 'Weekend Food Rescue & Meal Distribution Drive',
    description:
      'Join our volunteer rescue team to collect surplus banquet meals from partner catering kitchens across HITEC City and redistribute fresh, hygienic meal packages to 180+ families in local rehabilitation clusters.',
    causeCategory: 'Food & Hunger',
    startDate: tomorrow,
    endDate: tomorrow,
    startTime: '08:30 AM',
    endTime: '12:30 PM',
    estimatedHours: 4,
    location: {
      venue: 'HITEC City Community Hub',
      address: 'Phase 2 Near Cyber Towers',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
    requiredSkills: ['Food Handling', 'Local Route Navigation', 'Teamwork'],
    volunteerCapacity: 20,
    registeredCount: 1,
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
    preparationChecklist: [
      'Carry valid photo ID card for entry into partner hubs.',
      'Wear comfortable, slip-resistant walking shoes.',
      'Bring a personal reusable water bottle.',
      'Food-handling gloves and hygiene aprons are provided on site.',
    ],
    targetOutcomes: [
      'Redistribute 200+ warm, nutritious meals before 1:00 PM',
      'Prevent 90 kg of edible meal surplus from entering municipal waste streams',
    ],
  });

  const init2 = await Initiative.create({
    organization: org1._id,
    createdBy: orgUser1._id,
    title: 'Lakeside Miyawaki Urban Micro-Forest Sapling Drive',
    description:
      'Help restore native biodiversity alongside the Agara lake basin. Volunteers will prepare fertile organic soil beds, plant 150 native tree saplings (Neem, Honge, Peepal), install bamboo protective guards, and document sapling locations for periodic monitoring.',
    causeCategory: 'Environment & Nature',
    startDate: nextWeek,
    endDate: nextWeek,
    startTime: '07:00 AM',
    endTime: '10:30 AM',
    estimatedHours: 3.5,
    location: {
      venue: 'Agara Lake North Wetland Gate',
      address: 'Outer Ring Road, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
    },
    requiredSkills: ['Gardening', 'Physical Stamina', 'Environmental Advocacy'],
    volunteerCapacity: 30,
    registeredCount: 1,
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    preparationChecklist: [
      'Wear outdoor sturdy boots or sneakers suited for damp soil.',
      'Wear sun-protective caps or broad-brim hats.',
      'Gardening tools, saplings, and organic compost will be supplied.',
    ],
    targetOutcomes: [
      'Plant 150 native indigenous trees',
      'Establish a 6-month volunteer sapling watering rotation circle',
    ],
  });

  // 5. Create a verified participation and authentic impact record for Ananya
  const part1 = await Participation.create({
    user: volunteer1._id,
    initiative: init1._id,
    organization: org2._id,
    status: 'completed',
    verificationStatus: 'verified',
    hoursClaimed: 4,
    peopleReachedClaimed: 45,
    evidenceNotes:
      'Participated in the food rescue run from Madhapur to Miyapur. Packaged 45 clean meal boxes with hygienic seals and assisted in peaceful distribution.',
    evidenceUrls: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80'],
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    verifiedBy: orgUser2._id,
    verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  const impactRec1 = await ImpactRecord.create({
    participation: part1._id,
    user: volunteer1._id,
    initiative: init1._id,
    organization: org2._id,
    causeCategory: 'Food & Hunger',
    contributionType: 'field_volunteering',
    verifiedHours: 4,
    peopleReached: 45,
    outcomeSummary:
      'Verified: Packaged and handed out 45 hygienic surplus meals during Sunday drive.',
    evidenceUrls: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80'],
    verifiedBy: orgUser2._id,
    verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  part1.impactRecord = impactRec1._id;
  await part1.save();

  // Recalculate stats for Ananya and Aahaar
  await recalculateUserStats(volunteer1._id);
  await recalculateOrgStats(org2._id);

  // 6. Community Post
  await Post.create({
    author: volunteer1._id,
    authorRole: 'individual',
    content:
      'Just finished my first verified meal rescue drive with @Aahaar Food Rescue Alliance! Heartwarming to see zero edible food go to waste while 45 people received wholesome warm meals. Looking forward to the next initiative!',
    mediaUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    causeCategory: 'Food & Hunger',
    initiative: init1._id,
    likes: [volunteer2._id],
    likesCount: 1,
    commentsCount: 0,
  });

  console.log('[Seed Data] Authentic sample data seeding completed.');
};

module.exports = {
  seedInitialData,
};
