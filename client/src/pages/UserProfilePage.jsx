import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiRequest from '../services/api';
import { feedService } from '../services/feedService';
import { useAuth } from '../context/AuthContext';
import {
  IconUser,
  IconMapPin,
  IconAward,
  IconShieldCheck,
  IconHeart,
  IconClock,
  IconCheckCircle,
} from '../components/common/Icons';

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentImpact, setRecentImpact] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        const res = await apiRequest(`/users/${id}`);
        if (res.success) {
          setProfile(res.user);
          setStats(res.stats);
          setRecentImpact(res.recentImpact || []);
          setIsFollowing(res.isFollowing);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [id]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await feedService.toggleFollow(id);
      if (res.success) {
        setIsFollowing(res.isFollowing);
      }
    } catch (err) {
      alert(err.message || 'Follow failed.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="skeleton" style={{ height: 340 }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="empty-state">
          <h3 className="empty-state-title">User not found</h3>
          <p className="empty-state-desc">The requested volunteer profile does not exist.</p>
          <Link to="/" className="btn btn-outline btn-sm">Return Home</Link>
        </div>
      </div>
    );
  }

  const isSelf = currentUser?._id === profile._id;

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Profile Header Card */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', background: 'var(--forest-100)', flexShrink: 0, border: '3px solid var(--sage-border)' }}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'var(--forest-800)' }}>
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{profile.name}</h1>
                  <span className="badge badge-category">{profile.role}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.6rem' }}>
                  {profile.location?.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconMapPin width={14} height={14} />
                      <span>{profile.location.city}, {profile.location.country || 'India'}</span>
                    </div>
                  )}
                  <div>
                    <strong>{stats?.followersCount || 0}</strong> Followers • <strong>{stats?.followingCount || 0}</strong> Following
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', maxWidth: 540, fontSize: '0.92rem' }}>
                  {profile.bio || 'Passionate community volunteer dedicating time to social causes.'}
                </p>
              </div>
            </div>

            <div>
              {isSelf ? (
                <Link to="/settings" className="btn btn-outline btn-sm">
                  Edit Profile
                </Link>
              ) : (
                isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={`btn btn-sm ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                  >
                    {isFollowing ? 'Following' : 'Follow Volunteer'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Verified Impact Metrics */}
        <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="metric-card">
            <span className="badge badge-verified">Verified</span>
            <div className="metric-value">{stats?.hours || 0}</div>
            <div style={{ fontWeight: 600 }}>Volunteering Hours</div>
          </div>

          <div className="metric-card">
            <span className="badge badge-category">Activities</span>
            <div className="metric-value">{stats?.activitiesCount || 0}</div>
            <div style={{ fontWeight: 600 }}>Completed Drives</div>
          </div>

          <div className="metric-card">
            <span className="badge badge-category">Breadth</span>
            <div className="metric-value">{stats?.causesCount || 0}</div>
            <div style={{ fontWeight: 600 }}>Causes Supported</div>
          </div>

          <div className="metric-card">
            <span className="badge badge-category">Reach</span>
            <div className="metric-value">{stats?.peopleReached || 0}</div>
            <div style={{ fontWeight: 600 }}>People Reached</div>
          </div>
        </div>

        {/* Badges Earned */}
        {profile.badges?.length > 0 && (
          <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--forest-900)' }}>
              Verified Achievement Milestones
            </h3>
            <div className="badges-container">
              {profile.badges.map((b) => (
                <div key={b.badgeId} className="badge-item-card">
                  <div className="badge-icon-box">
                    <IconAward width={22} height={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--forest-900)' }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {b.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Interests */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--forest-900)' }}>Volunteering Skills</h4>
            {profile.skills?.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {profile.skills.map((s, i) => (
                  <span key={i} className="badge badge-category">{s}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No skills listed yet.</p>
            )}
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--forest-900)' }}>Interests & Causes</h4>
            {profile.interests?.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {profile.interests.map((c, i) => (
                  <span key={i} className="badge badge-category">{c}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No causes listed yet.</p>
            )}
          </div>
        </div>

        {/* Recent Impact History */}
        {recentImpact.length > 0 && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
              Recent Verified Contributions
            </h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Initiative</th>
                    <th>Organization</th>
                    <th>Cause</th>
                    <th>Verified Contribution</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentImpact.map((r) => (
                    <tr key={r._id}>
                      <td><strong>{r.initiative?.title || 'Initiative'}</strong></td>
                      <td>{r.organization?.name}</td>
                      <td><span className="badge badge-category">{r.causeCategory}</span></td>
                      <td><span style={{ color: 'var(--verified-color)', fontWeight: 600 }}>+{r.verifiedHours} hrs</span></td>
                      <td>{new Date(r.verifiedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
