const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const { ensureAdminExists } = require('../scripts/seedAdmin');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Initiative = require('../models/Initiative');
const Participation = require('../models/Participation');
const ImpactRecord = require('../models/ImpactRecord');

test.before(async () => {
  await connectDB();
  try {
    await User.collection.dropIndex('id_1');
  } catch (e) {}
  await User.deleteMany({
    email: { $in: ['volunteer_test@impacthub.ai', 'ecoaction@impacthub.ai', 'fakeadmin@test.com'] },
  });
  await ensureAdminExists();
});

test.after(async () => {
  await disconnectDB();
});

test('1. Health check endpoint reports database status', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'healthy');
  assert.equal(res.body.database.connected, true);
});

test('2. Authentication flow & role guard invariants', async (t) => {
  // A. Public registration cannot select admin role
  const adminAttempt = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Fake Admin',
      email: 'fakeadmin@test.com',
      password: 'Password123!',
      role: 'admin',
    });
  assert.equal(adminAttempt.status, 403);

  // B. Register individual volunteer
  const volunteerReg = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Volunteer',
      email: 'volunteer_test@impacthub.ai',
      password: 'VolPassword123!',
      role: 'individual',
    });
  assert.equal(volunteerReg.status, 201);
  assert.ok(volunteerReg.body.token);
  assert.equal(volunteerReg.body.user.role, 'individual');

  // C. Re-registering with duplicate email fails with 409
  const dupReg = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Volunteer Dup',
      email: 'volunteer_test@impacthub.ai',
      password: 'VolPassword123!',
      role: 'individual',
    });
  assert.equal(dupReg.status, 409);

  // D. Successful Login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'volunteer_test@impacthub.ai',
      password: 'VolPassword123!',
    });
  assert.equal(loginRes.status, 200);
  assert.ok(loginRes.body.token);

  // E. Incorrect password fails with 401
  const badLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'volunteer_test@impacthub.ai',
      password: 'WrongPassword!',
    });
  assert.equal(badLogin.status, 401);
});

test('3. End-to-End Participation, Evidence Submission & Verification Workflow', async () => {
  // Step 1: Login as Admin to approve an organization
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@impacthub.ai',
      password: 'Admin@ImpactHub2026!',
    });
  assert.equal(adminLogin.status, 200);
  const adminToken = adminLogin.body.token;

  // Step 2: Register Organization
  const orgReg = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'EcoAction Trust Organizer',
      email: 'ecoaction@impacthub.ai',
      password: 'OrgPassword123!',
      role: 'organization',
      organizationDetails: {
        name: 'EcoAction Trust',
        category: 'Environment & Nature',
        city: 'Hyderabad',
        description: 'Citizen collective organizing lake cleaning and tree planting.',
      },
    });
  assert.equal(orgReg.status, 201);
  const orgToken = orgReg.body.token;
  const orgId = orgReg.body.organization._id;

  // Verify: Unapproved organization CANNOT publish initiatives
  const unapprovedPub = await request(app)
    .post('/api/initiatives')
    .set('Authorization', `Bearer ${orgToken}`)
    .send({
      title: 'Premature Clean Drive',
      description: 'Clean drive before approval.',
      causeCategory: 'Environment & Nature',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 86400000),
      volunteerCapacity: 10,
      status: 'published',
    });
  assert.equal(unapprovedPub.status, 403);

  // Step 3: Admin approves organization
  const approveRes = await request(app)
    .put(`/api/admin/organizations/${orgId}/verify`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'approved', notes: 'Verified documentation.' });
  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.body.organization.verificationStatus, 'approved');

  // Step 4: Approved organization publishes an initiative
  const initRes = await request(app)
    .post('/api/initiatives')
    .set('Authorization', `Bearer ${orgToken}`)
    .send({
      title: 'Hussain Sagar Lake Wetland Restoration',
      description: 'Removing non-biodegradable plastics and stabilizing shoreline vegetation.',
      causeCategory: 'Environment & Nature',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 86400000),
      volunteerCapacity: 15,
      estimatedHours: 4,
      status: 'published',
    });
  assert.equal(initRes.status, 201);
  const initiativeId = initRes.body.initiative._id;

  // Step 5: Volunteer logs in and joins the initiative
  const volLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'volunteer_test@impacthub.ai',
      password: 'VolPassword123!',
    });
  const volToken = volLogin.body.token;
  const volunteerUser = volLogin.body.user;

  const joinRes = await request(app)
    .post(`/api/participations/${initiativeId}/join`)
    .set('Authorization', `Bearer ${volToken}`);
  assert.equal(joinRes.status, 201);
  const participationId = joinRes.body.participation._id;
  assert.equal(joinRes.body.participation.status, 'registered');
  assert.equal(joinRes.body.participation.verificationStatus, 'unverified');

  // Verify: Invariant: Joining does NOT increase verified impact
  const initialVol = await User.findById(volunteerUser._id);
  assert.equal(initialVol.verifiedStats.hours, 0);
  assert.equal(initialVol.verifiedStats.activitiesCount, 0);

  // Verify: Duplicate join is rejected with 409
  const dupJoin = await request(app)
    .post(`/api/participations/${initiativeId}/join`)
    .set('Authorization', `Bearer ${volToken}`);
  assert.equal(dupJoin.status, 409);

  // Step 6: Volunteer attends and submits evidence
  const submitRes = await request(app)
    .post(`/api/participations/${participationId}/submit-evidence`)
    .set('Authorization', `Bearer ${volToken}`)
    .send({
      hoursClaimed: 4,
      peopleReachedClaimed: 30,
      evidenceNotes: 'Collected 12 sacks of non-biodegradable waste along shoreline.',
      evidenceUrls: ['https://example.com/cleanup-photo.jpg'],
    });
  assert.equal(submitRes.status, 200);
  assert.equal(submitRes.body.participation.verificationStatus, 'pending');

  // Verify: Invariant: Pending evidence does NOT increase verified totals
  const pendingVol = await User.findById(volunteerUser._id);
  assert.equal(pendingVol.verifiedStats.hours, 0);

  // Step 7: Organization reviews and verifies participation
  const verifyRes = await request(app)
    .post(`/api/participations/${participationId}/verify`)
    .set('Authorization', `Bearer ${orgToken}`)
    .send({
      decision: 'approve',
      verifiedHours: 4,
      peopleReached: 30,
      contributionType: 'field_volunteering',
    });
  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.body.participation.verificationStatus, 'verified');

  // Step 8: Verify authoritative database impact recalculation
  const updatedVol = await User.findById(volunteerUser._id);
  assert.equal(updatedVol.verifiedStats.hours, 4);
  assert.equal(updatedVol.verifiedStats.activitiesCount, 1);
  assert.equal(updatedVol.verifiedStats.causesCount, 1);
  assert.equal(updatedVol.verifiedStats.peopleReached, 30);
  // Milestone badge 'first_step' awarded
  assert.ok(updatedVol.badges.some((b) => b.badgeId === 'first_step'));

  // Verify: Invariant: Duplicate approval cannot double-count
  const dupVerify = await request(app)
    .post(`/api/participations/${participationId}/verify`)
    .set('Authorization', `Bearer ${orgToken}`)
    .send({ decision: 'approve' });
  assert.equal(dupVerify.status, 400);

  // Check impact records count in DB is exactly 1
  const impactCount = await ImpactRecord.countDocuments({ participation: participationId });
  assert.equal(impactCount, 1);
});

test('4. Transparent AI Recommendation & Assistant Engine', async () => {
  // A. Recommendations endpoint returns scored array with clear explanation reasons
  const recRes = await request(app).get('/api/ai/recommendations');
  assert.equal(recRes.status, 200);
  assert.ok(Array.isArray(recRes.body.recommendations));
  if (recRes.body.recommendations.length > 0) {
    const first = recRes.body.recommendations[0];
    assert.ok(first.aiRecommendation);
    assert.ok(Array.isArray(first.aiRecommendation.explanation));
    assert.ok(typeof first.aiRecommendation.matchScore === 'number');
  }

  // B. What Can I Do assistant
  const wcidRes = await request(app)
    .post('/api/ai/what-can-i-do')
    .send({ hoursAvailable: 3, cause: 'Food & Hunger', city: 'Hyderabad' });
  assert.equal(wcidRes.status, 200);
  assert.ok(wcidRes.body.type === 'real_initiatives' || wcidRes.body.type === 'diy_action_plan');

  // C. Occasion ideas generator
  const occasionRes = await request(app)
    .post('/api/ai/occasion-ideas')
    .send({ occasionType: 'birthday', preferredCause: 'Environment & Nature', guestCount: 12 });
  assert.equal(occasionRes.status, 200);
  assert.ok(occasionRes.body.idea.title);
  assert.ok(Array.isArray(occasionRes.body.idea.checklist));
  assert.ok(occasionRes.body.idea.disclaimer);

  // D. Opportunity gap insights
  const gapRes = await request(app).get('/api/ai/gap-insights');
  assert.equal(gapRes.status, 200);
  assert.ok(Array.isArray(gapRes.body.breakdown));
  assert.ok(gapRes.body.insights);
});
