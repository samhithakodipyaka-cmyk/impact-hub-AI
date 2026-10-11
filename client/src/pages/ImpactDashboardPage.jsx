import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { impactService } from '../services/impactService';
import { useAuth } from '../context/AuthContext';
import {
  IconAward,
  IconClock,
  IconHeart,
  IconUsers,
  IconShieldCheck,
  IconCalendar,
  IconCompass,
  IconCheckCircle,
} from '../components/common/Icons';

export default function ImpactDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const platformRes = await impactService.getPlatformOverview().catch(() => ({}));
        if (platformRes.success) {
          setPlatformStats(platformRes.stats);
        }

        if (isAuthenticated) {
          const res = await impactService.getMyDashboard().catch(() => ({}));
          if (res.success) {
            setDashboardData(res);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  const allPossibleBadges = [
    { badgeId: 'first_step', name: 'First Step to Impact', description: 'Complete & verify your first initiative', icon: 'compass' },
    { badgeId: 'community_builder', name: 'Community Builder', description: 'Contribute 10+ verified hours', icon: 'shield-check' },
    { badgeId: 'impact_champion', name: 'Impact Champion', description: 'Contribute 25+ verified hours', icon: 'award' },
    { badgeId: 'multi_cause_hero', name: 'Multi-Cause Hero', description: 'Support 3 or more distinct social causes', icon: 'heart' },
    { badgeId: 'centurion_reach', name: 'Community Reach 100+', description: 'Directly assist 100+ individuals', icon: 'users' },
  ];

  const earnedBadgeIds = new Set((dashboardData?.badges || []).map((b) => b.badgeId));

  const stats = dashboardData?.verifiedStats || {
    hours: 0,
    activitiesCount: 0,
    causesCount: 0,
    peopleReached: 0,
  };

  const causeBreakdown = dashboardData?.causeBreakdown || {};
  const totalCauseHours = Object.values(causeBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="badge badge-verified" style={{ marginBottom: '0.4rem' }}>
            <IconShieldCheck width={14} height={14} /> Verified Audit Ledger
          </div>
          <h1>Verified Impact Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 680 }}>
            Real-world contributions backed by review records. Every hour and participant metric is verified by community organizers.
          </p>
        </div>

        {/* Individual Metrics (if logged in) */}
        {isAuthenticated ? (
          <>
            <div className="dashboard-grid">
              <div className="metric-card">
                <span className="badge badge-verified">Verified</span>
                <div className="metric-value">{stats.hours}</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Volunteering Hours</div>
                <div className="metric-sub">Authoritative on-site contribution</div>
              </div>

              <div className="metric-card">
                <span className="badge badge-category">Milestone</span>
                <div className="metric-value">{stats.activitiesCount}</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Completed Activities</div>
                <div className="metric-sub">Across verified initiatives</div>
              </div>

              <div className="metric-card">
                <span className="badge badge-category">Causes</span>
                <div className="metric-value">{stats.causesCount}</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Causes Supported</div>
                <div className="metric-sub">Multi-disciplinary service</div>
              </div>

              <div className="metric-card">
                <span className="badge badge-category">Community Reach</span>
                <div className="metric-value">{stats.peopleReached}</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>People Reached</div>
                <div className="metric-sub">Direct community beneficiaries</div>
              </div>
            </div>

            {/* Badges Section */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem', color: 'var(--forest-900)' }}>
                    Verified Achievement Badges
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Badges awarded exclusively when verified records meet objective thresholds.
                  </p>
                </div>
                <span className="badge badge-verified">
                  {earnedBadgeIds.size} of {allPossibleBadges.length} Unlocked
                </span>
              </div>

              <div className="badges-container">
                {allPossibleBadges.map((badge) => {
                  const isEarned = earnedBadgeIds.has(badge.badgeId);
                  const earnedDoc = (dashboardData?.badges || []).find((b) => b.badgeId === badge.badgeId);

                  return (
                    <div
                      key={badge.badgeId}
                      className="badge-item-card"
                      style={{
                        opacity: isEarned ? 1 : 0.55,
                        backgroundColor: isEarned ? '#FFFFFF' : 'var(--bg-subtle)',
                        border: isEarned ? '1px solid var(--forest-600)' : '1px dashed var(--border-medium)',
                      }}
                    >
                      <div
                        className="badge-icon-box"
                        style={{
                          backgroundColor: isEarned ? 'var(--forest-100)' : 'var(--border-subtle)',
                          color: isEarned ? 'var(--forest-800)' : 'var(--text-muted)',
                        }}
                      >
                        <IconAward width={24} height={24} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: isEarned ? 'var(--forest-900)' : 'var(--text-muted)' }}>
                          {badge.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {badge.description}
                        </div>
                        {isEarned && earnedDoc && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--verified-color)', fontWeight: 600, marginTop: '0.2rem' }}>
                            Awarded {new Date(earnedDoc.awardedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cause Distribution Breakdown */}
            {Object.keys(causeBreakdown).length > 0 && (
              <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--forest-900)' }}>
                  Verified Cause Distribution
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Hours divided across community cause categories.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(causeBreakdown).map(([cause, hours]) => {
                    const percent = Math.round((hours / totalCauseHours) * 100);
                    return (
                      <div key={cause}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--forest-900)' }}>{cause}</span>
                          <span>{hours} hrs ({percent}%)</span>
                        </div>
                        <div style={{ height: 10, background: 'var(--bg-subtle)', borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${percent}%`, background: 'var(--forest-700)', borderRadius: 5 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Verified Records Table */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
                Official Verification History
              </h3>

              {dashboardData?.recentRecords?.length > 0 ? (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Initiative</th>
                        <th>Organization</th>
                        <th>Cause</th>
                        <th>Verified Hours</th>
                        <th>People Reached</th>
                        <th>Date Verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentRecords.map((rec) => (
                        <tr key={rec._id}>
                          <td>
                            <strong>{rec.initiative?.title || 'Initiative'}</strong>
                          </td>
                          <td>{rec.organization?.name}</td>
                          <td>
                            <span className="badge badge-category">{rec.causeCategory}</span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--verified-color)', fontWeight: 600 }}>
                              +{rec.verifiedHours} hrs
                            </span>
                          </td>
                          <td>{rec.peopleReached || '—'}</td>
                          <td>{new Date(rec.verifiedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  No verified records yet. Complete an initiative and submit your evidence to begin accumulating verified hours!
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Sign In to View Your Personal Impact Ledger</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Create an account or sign in to track verified hours, earn badges, and export your volunteer history.
            </p>
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In to Your Dashboard
            </Link>
          </div>
        )}

        {/* Global Platform Ledger Totals */}
        {platformStats && (
          <div style={{ backgroundColor: 'var(--sage-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--sage-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
              <IconCompass width={20} height={20} />
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Platform-Wide Authoritative Aggregates</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              These statistics represent authoritative real-world impact aggregated across all active volunteers and approved organizations on ImpactHub AI.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--forest-900)' }}>
                  {platformStats.totalVerifiedHours}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Hours Verified</div>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--forest-900)' }}>
                  {platformStats.totalPeopleReached}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>People Directly Reached</div>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--forest-900)' }}>
                  {platformStats.verifiedRecordsCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Verified Records</div>
              </div>

              <div style={{ background: '#FFF', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--forest-900)' }}>
                  {platformStats.activeVolunteersCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Changemakers</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
