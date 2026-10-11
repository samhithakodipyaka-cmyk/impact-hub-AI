const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Initiative = require('../models/Initiative');
const Participation = require('../models/Participation');
const ImpactRecord = require('../models/ImpactRecord');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const { recalculateUserStats, recalculateOrgStats } = require('../services/impactAggregator');

// Connection string can be passed via command line argument or server/.env
const targetUri = process.argv[2] || process.env.MONGODB_URI || env.MONGODB_URI;

console.log('========================================================');
console.log('   ImpactHub AI — MongoDB Atlas & Database Seeder       ');
console.log('========================================================');
console.log(`Connecting to: ${targetUri.replace(/:([^:@]{4,})@/, ':****@')}`);

async function seedDatabase() {
  try {
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('[MongoDB] Connected successfully.');

    // Clean rogue legacy indexes if present
    const collections = await mongoose.connection.db.collections();
    for (const col of collections) {
      try {
        const indexes = await col.indexes();
        for (const idx of indexes) {
          if (['id_1', 'userId_1', 'activityId_1', 'userId_1_activityId_1'].includes(idx.name)) {
            await col.dropIndex(idx.name);
            console.log(`[Index Cleanup] Dropped legacy index '${idx.name}' from ${col.collectionName}`);
          }
        }
      } catch (err) {
        // ignore index cleanup errors
      }
    }

    console.log('[Seeding] Clearing existing collections...');
    await ImpactRecord.deleteMany({});
    await Participation.deleteMany({});
    await Initiative.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Report.deleteMany({});
    await Organization.deleteMany({});
    // Keep or recreate admin
    await User.deleteMany({ email: { $ne: env.ADMIN_EMAIL || 'admin@impacthub.ai' } });

    console.log('[Seeding] Ensuring platform administrator exists...');
    let admin = await User.findOne({ email: env.ADMIN_EMAIL || 'admin@impacthub.ai' });
    if (!admin) {
      admin = await User.create({
        name: 'ImpactHub Global Admin',
        email: env.ADMIN_EMAIL || 'admin@impacthub.ai',
        password: env.ADMIN_PASSWORD || 'Admin@ImpactHub2026!',
        role: 'admin',
        bio: 'Chief safety and community oversight administrator.',
        location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80',
      });
      console.log('  ✔ Created Administrator: admin@impacthub.ai');
    }

    console.log('[Seeding] Creating verified NGOs and Community Organizations...');

    // NGO 1: Aahaar Food Rescue Alliance (Food & Hunger)
    const userOrg1 = await User.create({
      name: 'Vikram Joshi',
      email: 'aahaar@impacthub.ai',
      password: 'OrgPassword2026!',
      role: 'organization',
      bio: 'Logistics coordinator working to eradicate food waste through community redistribution.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    });

    const org1 = await Organization.create({
      owner: userOrg1._id,
      name: 'Aahaar Food Rescue Alliance',
      category: 'Food & Hunger',
      description: 'Mobilizing volunteer food-rescue teams to collect safe surplus meals from events and corporate cafeterias for direct delivery to hunger shelters.',
      location: { address: '42 Banjara Hills Road No 3', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      contactEmail: 'helpline@aahaarrescue.org',
      contactPhone: '+91 40 2345 6789',
      website: 'https://aahaarrescue.org',
      registrationNumber: 'HYD/SOC/2019/3312',
      verificationStatus: 'approved',
      verificationNotes: 'Verified community non-profit partner operating 24/7 food rescue helpline.',
      logoUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=80',
    });
    userOrg1.organizationProfile = org1._id;
    await userOrg1.save();

    // NGO 2: GreenCanopy Foundation (Environment & Nature)
    const userOrg2 = await User.create({
      name: 'Dr. Radhika Sen',
      email: 'greencanopy@impacthub.ai',
      password: 'OrgPassword2026!',
      role: 'organization',
      bio: 'Environmental ecologist coordinating urban micro-forest projects and lake revival drives.',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
    });

    const org2 = await Organization.create({
      owner: userOrg2._id,
      name: 'GreenCanopy Foundation',
      category: 'Environment & Nature',
      description: 'A citizen-driven environmental conservation trust committed to increasing urban canopy cover, restoring lake ecosystems, and promoting climate literacy.',
      location: { address: '14 Indiranagar 100ft Road', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      contactEmail: 'contact@greencanopy.org',
      contactPhone: '+91 80 4123 9876',
      website: 'https://greencanopy.org',
      registrationNumber: 'BLR/TRUST/2021/8942',
      verificationStatus: 'approved',
      verificationNotes: 'Registered charitable trust verified with 80G registration documentation.',
      logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&q=80',
    });
    userOrg2.organizationProfile = org2._id;
    await userOrg2.save();

    // NGO 3: Vidya Jyoti Shiksha Abhiyan (Education & Literacy)
    const userOrg3 = await User.create({
      name: 'Meera Nambiar',
      email: 'vidyajyoti@impacthub.ai',
      password: 'OrgPassword2026!',
      role: 'organization',
      bio: 'Educator and curriculum specialist creating weekend learning centers in informal settlements.',
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80',
    });

    const org3 = await Organization.create({
      owner: userOrg3._id,
      name: 'Vidya Jyoti Shiksha Abhiyan',
      category: 'Education & Literacy',
      description: 'Bridging foundational literacy and numeracy gaps for underprivileged children through weekend volunteer tutoring.',
      location: { address: '88 Shivaji Park, Dadar West', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      contactEmail: 'contact@vidyajyoti.org',
      contactPhone: '+91 22 2430 5511',
      website: 'https://vidyajyoti.org',
      registrationNumber: 'MUM/EDU/2018/1042',
      verificationStatus: 'approved',
      verificationNotes: 'Government-recognized educational society verified with Darpan registration ID.',
      logoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&q=80',
    });
    userOrg3.organizationProfile = org3._id;
    await userOrg3.save();

    // NGO 4: Paws & Tails Animal Shelter (Animal Welfare)
    const userOrg4 = await User.create({
      name: 'Kabir Varma',
      email: 'pawstails@impacthub.ai',
      password: 'OrgPassword2026!',
      role: 'organization',
      bio: 'Veterinary care volunteer managing community street dog vaccination and shelter care.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    });

    const org4 = await Organization.create({
      owner: userOrg4._id,
      name: 'Paws & Tails Welfare Society',
      category: 'Animal Welfare',
      description: 'Dedicated to rescue, anti-rabies vaccination, and peaceful community integration of community animals.',
      location: { address: 'Sector 5, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      contactEmail: 'care@pawstails.org',
      contactPhone: '+91 40 2311 4422',
      website: 'https://pawstails.org',
      registrationNumber: 'HYD/AWB/2020/5512',
      verificationStatus: 'approved',
      verificationNotes: 'Animal Welfare Board recognized sanctuary and emergency clinic.',
      logoUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&q=80',
    });
    userOrg4.organizationProfile = org4._id;
    await userOrg4.save();

    // NGO 5: CleanCity Action Collective (Community Cleanup)
    const userOrg5 = await User.create({
      name: 'Suresh Patil',
      email: 'cleancity@impacthub.ai',
      password: 'OrgPassword2026!',
      role: 'organization',
      bio: 'Civic activist organizing neighborhood lake cleanup drives and zero-waste segregation workshops.',
      location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    });

    const org5 = await Organization.create({
      owner: userOrg5._id,
      name: 'CleanCity Action Collective',
      category: 'Community Cleanup',
      description: 'Transforming black spots, clogged storm-water drains, and polluted parks into green public spaces.',
      location: { address: '22 FC Road, Shivajinagar', city: 'Pune', state: 'Maharashtra', country: 'India' },
      contactEmail: 'connect@cleancitypune.org',
      contactPhone: '+91 20 2567 8900',
      website: 'https://cleancitypune.org',
      registrationNumber: 'PUN/CIVIC/2022/901',
      verificationStatus: 'approved',
      verificationNotes: 'Registered civic society partnering with local municipal corporation.',
      logoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&q=80',
    });
    userOrg5.organizationProfile = org5._id;
    await userOrg5.save();

    // NGO 6: LifeDrop Blood & Health Mission (Healthcare & Blood Donation) - PENDING
    const userOrg6 = await User.create({
      name: 'Dr. Anita Roy',
      email: 'lifedrop@impacthub.ai',
      password: 'OrgPassword2026!',
      role: 'organization',
      bio: 'Hematologist establishing emergency voluntary blood donor registries and rare group directories.',
      location: { city: 'Delhi', state: 'Delhi', country: 'India' },
      avatarUrl: 'https://images.unsplash.com/photo-1594824813589-9800d9f4e3c9?w=300&q=80',
    });

    const org6 = await Organization.create({
      owner: userOrg6._id,
      name: 'LifeDrop Voluntary Blood Network',
      category: 'Healthcare & Blood Donation',
      description: 'Organizing voluntary blood donation camps in colleges and tech parks for emergency transfusion patients.',
      location: { address: '12 Connaught Place', city: 'Delhi', state: 'Delhi', country: 'India' },
      contactEmail: 'info@lifedropindia.org',
      contactPhone: '+91 11 2334 5678',
      website: 'https://lifedropindia.org',
      registrationNumber: 'DEL/MED/2023/4491',
      verificationStatus: 'pending', // PENDING SO ADMIN CAN VERIFY OR REJECT
      verificationNotes: 'Submitted medical society certificates; pending admin document review.',
      logoUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=300&q=80',
    });
    userOrg6.organizationProfile = org6._id;
    await userOrg6.save();

    console.log('  ✔ Created 6 Community Organizations (5 approved, 1 pending in admin queue)');

    console.log('[Seeding] Creating Active Volunteers...');

    // Volunteer 1: Ananya Sharma
    const vol1 = await User.create({
      name: 'Ananya Sharma',
      email: 'ananya.sharma@example.com',
      password: 'VolunteerPass1!',
      role: 'individual',
      bio: 'Software engineer passionate about tree canopy restoration, civic cleanups, and educating children in low-income schools.',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      skills: ['Teaching & Mentoring', 'First Aid', 'Tree Planting', 'Event Coordination'],
      interests: ['Environment & Nature', 'Education & Literacy', 'Community Cleanup', 'Food & Hunger'],
      availability: ['Weekends', 'Saturday Mornings'],
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
    });

    // Volunteer 2: Rohan Mehta
    const vol2 = await User.create({
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      password: 'VolunteerPass1!',
      role: 'individual',
      bio: 'College student and active animal foster volunteer. Available on weekends for rescue operations and feeding drives.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
      skills: ['Animal Care', 'Driving / Logistics', 'Crowd Management'],
      interests: ['Animal Welfare', 'Food & Hunger'],
      availability: ['Weekends', 'Sunday Mornings'],
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80',
    });

    // Volunteer 3: Priya Kulkarni
    const vol3 = await User.create({
      name: 'Priya Kulkarni',
      email: 'priya.kulkarni@example.com',
      password: 'VolunteerPass1!',
      role: 'individual',
      bio: 'Public health researcher and community health volunteer passionate about preventive health and clean waterways.',
      location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
      skills: ['Public Speaking', 'Health Education', 'Data Entry'],
      interests: ['Healthcare & Blood Donation', 'Community Cleanup', 'Environment & Nature'],
      availability: ['Saturday Mornings', 'Weekday Evenings'],
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
    });

    // Volunteer 4: Arjun Nair
    const vol4 = await User.create({
      name: 'Arjun Nair',
      email: 'arjun.nair@example.com',
      password: 'VolunteerPass1!',
      role: 'individual',
      bio: 'Creative designer and photographer documenting grassroots community solutions and food waste redistribution.',
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      skills: ['Photography', 'Teaching & Mentoring'],
      interests: ['Education & Literacy', 'Food & Hunger'],
      availability: ['Weekends'],
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
    });

    console.log('  ✔ Created 4 Active Volunteers');

    console.log('[Seeding] Creating Initiatives across Multiple Causes & Metros...');

    const now = new Date();
    const inDays = (d) => new Date(now.getTime() + d * 86400000);
    const pastDays = (d) => new Date(now.getTime() - d * 86400000);

    // Initiative 1: Weekend Surplus Food Rescue (Hyderabad)
    const init1 = await Initiative.create({
      organization: org1._id,
      createdBy: userOrg1._id,
      title: 'Weekend Surplus Food Rescue & Night Shelter Redistribution',
      description: 'Join volunteer delivery pairs to collect packed surplus meals from corporate kitchens and community banquets across HITEC City and Gachibowli, followed by quality inspection and distribution to certified night shelters.',
      causeCategory: 'Food & Hunger',
      startDate: inDays(3),
      endDate: inDays(3),
      startTime: '07:30 PM',
      endTime: '10:30 PM',
      estimatedHours: 3,
      location: {
        venue: 'Madhapur Community Redistribution Hub',
        address: 'Plot 12, Kavuri Hills Phase 2',
        city: 'Hyderabad',
        state: 'Telangana',
        lat: 17.4483,
        lng: 78.3915,
      },
      volunteerCapacity: 25,
      registeredCount: 14,
      requiredSkills: ['Driving / Logistics', 'Food Sorting', 'Good Communication'],
      preparationChecklist: [
        'Bring a clean reusable apron and gloves',
        'Wear comfortable closed-toe walking shoes',
        'Carry an insulated carrier bag if you have a two-wheeler',
        'Arrive 15 minutes early for safety briefing',
      ],
      targetOutcomes: ['Rescue and deliver ~350 hot meals to families and night shelters before 10 PM.'],
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
    });

    // Initiative 2: Urban Lake Buffer Afforestation (Bengaluru)
    const init2 = await Initiative.create({
      organization: org2._id,
      createdBy: userOrg2._id,
      title: 'Varthur Lake Buffer Zone Miyawaki Forest Plantation Drive',
      description: 'Help plant 600 indigenous native saplings (Neem, Peepal, Jamun, Honge) using the rapid Miyawaki afforestation method along the restored wetlands of Varthur Lake to filter runoff and create a bird sanctuary.',
      causeCategory: 'Environment & Nature',
      startDate: inDays(5),
      endDate: inDays(5),
      startTime: '06:30 AM',
      endTime: '10:00 AM',
      estimatedHours: 3.5,
      location: {
        venue: 'Varthur Lake Eco-Restoration Site',
        address: 'Old Airport-Varthur Main Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        lat: 12.9406,
        lng: 77.7466,
      },
      volunteerCapacity: 40,
      registeredCount: 28,
      requiredSkills: ['Tree Planting', 'Physical Stamina', 'Environmental Care'],
      preparationChecklist: [
        'Bring a refillable 2L water bottle and sun hat',
        'Gardening gloves will be provided on site',
        'Wear clothes you do not mind getting muddy',
        'Saplings and tools are provided by GreenCanopy',
      ],
      targetOutcomes: ['Plant and mulch 600 saplings with protective drip irrigation stakes.'],
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    });

    // Initiative 3: Foundational Math & English Mentorship (Mumbai)
    const init3 = await Initiative.create({
      organization: org3._id,
      createdBy: userOrg3._id,
      title: 'Weekend Math & Storytelling Mentorship for Primary Learners',
      description: 'Work 1-on-1 with children aged 7-12 from municipal schools in Dharavi to build foundational numeracy and reading confidence through fun story cards and educational games.',
      causeCategory: 'Education & Literacy',
      startDate: inDays(6),
      endDate: inDays(6),
      startTime: '09:00 AM',
      endTime: '12:30 PM',
      estimatedHours: 3.5,
      location: {
        venue: 'Vidya Jyoti Learning Center #4',
        address: 'Kala Killa Community Hall, 90ft Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        lat: 19.0416,
        lng: 72.8536,
      },
      volunteerCapacity: 20,
      registeredCount: 16,
      requiredSkills: ['Teaching & Mentoring', 'Patience'],
      preparationChecklist: [
        'Review the digital activity sheets sent 24 hours prior',
        'Bring stationary, pencils, and coloring sets if possible',
        'Smile and be ready to encourage timid learners',
      ],
      targetOutcomes: ['Conduct 3 hours of focused learning for 45 children with diagnostic learning tracker.'],
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
    });

    // Initiative 4: Community Dog Health & Anti-Rabies Camp (Hyderabad)
    const init4 = await Initiative.create({
      organization: org4._id,
      createdBy: userOrg4._id,
      title: 'Jubilee Hills Community Dog Health Checkup & Rabies Drive',
      description: 'Assist licensed veterinarians with gentle handling, collar tagging, record-keeping, and administering essential 7-in-1 and anti-rabies vaccines for friendly community dogs across residential colonies.',
      causeCategory: 'Animal Welfare',
      startDate: inDays(8),
      endDate: inDays(8),
      startTime: '08:00 AM',
      endTime: '12:00 PM',
      estimatedHours: 4,
      location: {
        venue: 'Paws Sanctuary Outpost',
        address: 'Road No 36, Beside Peddamma Temple',
        city: 'Hyderabad',
        state: 'Telangana',
        lat: 17.4326,
        lng: 78.3995,
      },
      volunteerCapacity: 15,
      registeredCount: 12,
      requiredSkills: ['Animal Care', 'First Aid'],
      preparationChecklist: [
        'Wear thick denim trousers and closed shoes',
        'Treat pouches and leash lines provided',
        'Do not handle aggressive animals; vets handle all inoculations',
      ],
      targetOutcomes: ['Inoculate and health-chart 60+ community animals and distribute reflective safety collars.'],
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80',
    });

    // Initiative 5: Mutha River Bank Cleanliness & Plastic Audit (Pune)
    const init5 = await Initiative.create({
      organization: org5._id,
      createdBy: userOrg5._id,
      title: 'Mutha Riverbank Cleanup & Micro-Plastic Brand Audit',
      description: 'Remove legacy non-biodegradable waste along the Shivajinagar stretch of the Mutha River, catalog multi-layered plastic waste for producer responsibility audits, and route recyclables to registered recyclers.',
      causeCategory: 'Community Cleanup',
      startDate: inDays(10),
      endDate: inDays(10),
      startTime: '07:00 AM',
      endTime: '10:30 AM',
      estimatedHours: 3.5,
      location: {
        venue: 'Z-Bridge Riverbank Steps',
        address: 'Deccan Gymkhana Ghat',
        city: 'Pune',
        state: 'Maharashtra',
        lat: 18.5167,
        lng: 73.8417,
      },
      volunteerCapacity: 35,
      registeredCount: 22,
      requiredSkills: ['Physical Stamina'],
      preparationChecklist: [
        'Puncture-resistant industrial gloves will be issued',
        'Wear gumboots or sturdy high-grip shoes',
        'Bring a hydration bottle and cap',
      ],
      targetOutcomes: ['Clear ~800 kg of plastic trash and prevent micro-plastic breakdown in downstream waterways.'],
      status: 'published',
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
    });

    // Initiative 6: COMPLETED Initiative for Verified Impact History (Bengaluru)
    const init6 = await Initiative.create({
      organization: org2._id,
      createdBy: userOrg2._id,
      title: 'Koramangala 4th Block Community Native Seedling Care Drive',
      description: 'Completed citizen drive to nurture, fertilize, and mulch 250 young urban saplings planted during the pre-monsoon season.',
      causeCategory: 'Environment & Nature',
      startDate: pastDays(7),
      endDate: pastDays(7),
      startTime: '07:00 AM',
      endTime: '10:00 AM',
      estimatedHours: 3,
      location: {
        venue: 'Swabhimana Park',
        address: '4th Block Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        lat: 12.9344,
        lng: 77.6258,
      },
      volunteerCapacity: 20,
      registeredCount: 18,
      requiredSkills: ['Tree Planting'],
      preparationChecklist: ['Gardening trowels provided'],
      targetOutcomes: ['250 saplings de-weeded and mulched with organic compost.'],
      status: 'completed',
      imageUrl: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=800&q=80',
    });

    // Initiative 7: COMPLETED Initiative (Food Rescue in Hyderabad)
    const init7 = await Initiative.create({
      organization: org1._id,
      createdBy: userOrg1._id,
      title: 'Koti Women’s Shelter Food Redistribution Drive',
      description: 'Redistributed 180 freshly prepared nutritious meals from a major tech conference to regional family transition shelters.',
      causeCategory: 'Food & Hunger',
      startDate: pastDays(12),
      endDate: pastDays(12),
      startTime: '08:00 PM',
      endTime: '10:30 PM',
      estimatedHours: 2.5,
      location: {
        venue: 'Koti Government Maternity Shelter Annex',
        address: 'Bank Street, Koti',
        city: 'Hyderabad',
        state: 'Telangana',
        lat: 17.385,
        lng: 78.4867,
      },
      volunteerCapacity: 12,
      registeredCount: 12,
      requiredSkills: ['Food Sorting', 'Driving / Logistics'],
      preparationChecklist: ['Thermal food carriers provided'],
      targetOutcomes: ['180 balanced warm meals delivered within 90 minutes of banquet completion.'],
      status: 'completed',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
    });

    console.log('  ✔ Created 7 Diverse Initiatives across 5 Causes & Metros');

    console.log('[Seeding] Creating Real Participations & Authoritative Impact Records...');

    // Ananya participating in init6 (Completed & Verified)
    const part1 = await Participation.create({
      user: vol1._id,
      initiative: init6._id,
      organization: org2._id,
      status: 'completed',
      verificationStatus: 'verified',
      hoursClaimed: 3,
      evidenceNotes: 'De-weeded and spread 5 bags of organic leaf mulch across 32 neem and banyan saplings along the perimeter fence.',
      evidenceUrls: ['https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=600&q=80'],
      submittedAt: pastDays(6),
      verifiedBy: userOrg2._id,
      verifiedAt: pastDays(6),
    });

    const impact1 = await ImpactRecord.create({
      participation: part1._id,
      user: vol1._id,
      initiative: init6._id,
      organization: org2._id,
      causeCategory: 'Environment & Nature',
      contributionType: 'field_volunteering',
      verifiedHours: 3,
      peopleReached: 50,
      outcomeSummary: 'De-weeded and mulched 32 native saplings along the perimeter fence.',
      evidenceUrls: part1.evidenceUrls,
      verifiedBy: userOrg2._id,
      verifiedAt: pastDays(6),
    });
    part1.impactRecord = impact1._id;
    await part1.save();

    // Ananya participating in init7 (Completed & Verified)
    const part2 = await Participation.create({
      user: vol1._id,
      initiative: init7._id,
      organization: org1._id,
      status: 'completed',
      verificationStatus: 'verified',
      hoursClaimed: 2.5,
      evidenceNotes: 'Assisted in thermal packing, quality temperature checks, and handing over meal boxes to shelter coordinators.',
      evidenceUrls: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80'],
      submittedAt: pastDays(11),
      verifiedBy: userOrg1._id,
      verifiedAt: pastDays(11),
    });

    const impact2 = await ImpactRecord.create({
      participation: part2._id,
      user: vol1._id,
      initiative: init7._id,
      organization: org1._id,
      causeCategory: 'Food & Hunger',
      contributionType: 'field_volunteering',
      verifiedHours: 2.5,
      peopleReached: 90,
      outcomeSummary: 'Redistributed 180 hot meals to women shelter residents.',
      evidenceUrls: part2.evidenceUrls,
      verifiedBy: userOrg1._id,
      verifiedAt: pastDays(11),
    });
    part2.impactRecord = impact2._id;
    await part2.save();

    // Rohan participating in init7 (Completed & Verified)
    const part3 = await Participation.create({
      user: vol2._id,
      initiative: init7._id,
      organization: org1._id,
      status: 'completed',
      verificationStatus: 'verified',
      hoursClaimed: 3,
      evidenceNotes: 'Drove the delivery van from the banquet hall to Koti shelter and assisted in food unloading.',
      evidenceUrls: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80'],
      submittedAt: pastDays(11),
      verifiedBy: userOrg1._id,
      verifiedAt: pastDays(11),
    });

    const impact3 = await ImpactRecord.create({
      participation: part3._id,
      user: vol2._id,
      initiative: init7._id,
      organization: org1._id,
      causeCategory: 'Food & Hunger',
      contributionType: 'field_volunteering',
      verifiedHours: 3,
      peopleReached: 90,
      outcomeSummary: 'Transported 180 packed meals with safety checks and unloading.',
      evidenceUrls: part3.evidenceUrls,
      verifiedBy: userOrg1._id,
      verifiedAt: pastDays(11),
    });
    part3.impactRecord = impact3._id;
    await part3.save();

    // Ananya currently registered for upcoming init2 (Varthur Lake Plantation)
    await Participation.create({
      user: vol1._id,
      initiative: init2._id,
      organization: org2._id,
      status: 'registered',
      verificationStatus: 'unverified',
    });

    // Rohan currently registered for upcoming init4 (Animal Health Camp)
    await Participation.create({
      user: vol2._id,
      initiative: init4._id,
      organization: org4._id,
      status: 'registered',
      verificationStatus: 'unverified',
    });

    // Priya submitted evidence for init5 waiting for organizer review (pending verification)
    await Participation.create({
      user: vol3._id,
      initiative: init5._id,
      organization: org5._id,
      status: 'attended',
      verificationStatus: 'pending',
      hoursClaimed: 3.5,
      evidenceNotes: 'Cleared 4 bags of plastic wrappers and segregated PET bottles into the blue bins.',
      evidenceUrls: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80'],
      submittedAt: now,
    });

    console.log('  ✔ Created Participations (Verified, Registered, Pending Review)');

    console.log('[Seeding] Recalculating Authoritative Impact Totals & Milestone Badges...');
    await recalculateUserStats(vol1._id);
    await recalculateUserStats(vol2._id);
    await recalculateUserStats(vol3._id);
    await recalculateUserStats(vol4._id);

    await recalculateOrgStats(org1._id);
    await recalculateOrgStats(org2._id);
    await recalculateOrgStats(org3._id);
    await recalculateOrgStats(org4._id);
    await recalculateOrgStats(org5._id);
    await recalculateOrgStats(org6._id);

    console.log('  ✔ Recalculated user & organization impact totals');

    console.log('[Seeding] Creating Community Feed Posts & Interactions...');

    const post1 = await Post.create({
      author: userOrg1._id,
      authorRole: 'organization',
      content: 'A huge thank you to the 12 volunteers who turned up for our Koti Shelter distribution drive last weekend! We successfully rerouted 180 hot, fresh meals that would have otherwise ended up in a landfill. Real impact happens when citizens step up together.',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
      causeCategory: 'Food & Hunger',
      initiative: init7._id,
      likes: [vol1._id, vol2._id, vol3._id],
      commentCount: 2,
    });

    await Comment.create({
      post: post1._id,
      author: vol1._id,
      content: 'Such a humbling experience seeing the smile on the shelter resident coordinators faces. Happy to help out every weekend!',
    });

    await Comment.create({
      post: post1._id,
      author: vol2._id,
      content: 'Smooth logistics coordination by the Aahaar team. Count me in for the next one too.',
    });

    const post2 = await Post.create({
      author: vol1._id,
      authorRole: 'individual',
      content: 'Spent Saturday morning with the GreenCanopy team mulching 32 native saplings. There is something deeply grounding about getting your hands dirty for your city’s tree cover. Looking forward to the Varthur Lake plantation next week!',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
      causeCategory: 'Environment & Nature',
      initiative: init6._id,
      likes: [userOrg2._id, vol4._id],
      commentCount: 1,
    });

    await Comment.create({
      post: post2._id,
      author: userOrg2._id,
      content: 'Thank you Ananya for being such a dependable volunteer! We look forward to seeing you at Varthur Lake.',
    });

    console.log('  ✔ Created Feed Posts, Likes, and Comments');

    console.log('[Seeding] Creating Sample Report for Admin Moderation Dashboard...');
    await Report.create({
      reporter: vol3._id,
      targetType: 'initiative',
      targetId: init1._id,
      reason: 'misleading_impact',
      details: 'Please ensure exact pickup gate instructions are updated before the evening drive.',
      status: 'pending',
    });
    console.log('  ✔ Created Moderation Report for Admin queue');

    console.log('\n========================================================');
    console.log('  MongoDB Database Population Completed Successfully!    ');
    console.log('========================================================');
    console.log('Quick Credentials:');
    console.log('  Admin:        admin@impacthub.ai / Admin@ImpactHub2026!');
    console.log('  Volunteer 1:  ananya.sharma@example.com / VolunteerPass1! (5.5 hrs verified, 2 causes)');
    console.log('  Volunteer 2:  rohan.mehta@example.com / VolunteerPass1! (3 hrs verified)');
    console.log('  Volunteer 3:  priya.kulkarni@example.com / VolunteerPass1! (Pending submission review)');
    console.log('  NGO (Food):   aahaar@impacthub.ai / OrgPassword2026!');
    console.log('  NGO (Trees):  greencanopy@impacthub.ai / OrgPassword2026!');
    console.log('  NGO (School): vidyajyoti@impacthub.ai / OrgPassword2026!');
    console.log('  NGO (Pets):   pawstails@impacthub.ai / OrgPassword2026!');
    console.log('  NGO (Clean):  cleancity@impacthub.ai / OrgPassword2026!');
    console.log('  NGO (Pending):lifedrop@impacthub.ai / OrgPassword2026! (Verify in /admin)');
    console.log('========================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n[Seeding Error]:', err);
    process.exit(1);
  }
}

seedDatabase();
