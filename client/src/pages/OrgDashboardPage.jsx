import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiRequest from '../services/api';
import { initiativeService } from '../services/initiativeService';
import { participationService } from '../services/participationService';
import { useAuth } from '../context/AuthContext';
import {
  IconBuilding,
  IconShieldCheck,
  IconPlus,
  IconUsers,
  IconClock,
  IconCheckCircle,
  IconAlertCircle,
  IconX,
} from '../components/common/Icons';

export default function OrgDashboardPage() {
  const { user, organization } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Volunteer Review Drawer/Modal state
  const [activeInitiative, setActiveInitiative] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [volLoading, setVolLoading] = useState(false);

  // Review action modal state
  const [reviewTarget, setReviewTarget] = useState(null); // participation doc
  const [decision, setDecision] = useState('approve'); // 'approve' or 'reject'
  const [verifiedHours, setVerifiedHours] = useState(3);
  const [peopleReached, setPeopleReached] = useState(25);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewError, setReviewError] = useState('');

  const loadOrgData = async () => {
    setLoading(true);
    try {
      const [metRes, initRes] = await Promise.all([
        apiRequest('/orgs/dashboard-metrics').catch(() => ({})),
        initiativeService.getMyOrg().catch(() => ({})),
      ]);

      if (metRes.success) setMetrics(metRes.metrics);
      if (initRes.success) setInitiatives(initRes.initiatives || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgData();
  }, []);

  const handleOpenVolunteers = async (init) => {
    setActiveInitiative(init);
    setVolLoading(true);
    setReviewMsg('');
    setReviewError('');
    try {
      const res = await participationService.getInitiativeParticipants(init._id);
      if (res.success) {
        setVolunteers(res.participants || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVolLoading(false);
    }
  };

  const handleOpenReviewModal = (participant, initialDecision = 'approve') => {
    setReviewTarget(participant);
    setDecision(initialDecision);
    setVerifiedHours(participant.hoursClaimed || activeInitiative?.estimatedHours || 3);
    setPeopleReached(participant.peopleReachedClaimed || 20);
    setRejectionReason('');
    setReviewError('');
    setReviewMsg('');
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;

    setActionSubmitting(true);
    setReviewError('');

    try {
      const payload = {
        decision,
        ...(decision === 'approve'
          ? {
              verifiedHours: parseFloat(verifiedHours),
              peopleReached: parseInt(peopleReached, 10),
              contributionType: 'field_volunteering',
            }
          : {
              rejectionReason: rejectionReason.trim(),
            }),
      };

      const res = await participationService.verify(reviewTarget._id, payload);
      if (res.success) {
        setReviewMsg(`Volunteer participation marked as ${decision === 'approve' ? 'verified' : 'rejected'}.`);
        // Update local volunteer list
        setVolunteers((prev) =>
          prev.map((v) => (v._id === reviewTarget._id ? res.participation : v))
        );
        setReviewTarget(null);
        // Refresh dashboard metrics in background
        loadOrgData();
      }
    } catch (err) {
      setReviewError(err.message || 'Verification update failed.');
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-category">Organizer Management</span>
              {organization?.verificationStatus === 'approved' ? (
                <span className="badge badge-verified">
                  <IconShieldCheck width={14} height={14} /> Approved Partner
                </span>
              ) : (
                <Link to="/organization/verification" className="badge badge-pending">
                  Verification Pending
                </Link>
              )}
            </div>
            <h1>{organization?.name || 'Organization Dashboard'}</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage campaigns, review on-site attendance, and authorize verified impact records.
            </p>
          </div>

          <Link to="/initiatives/create" className="btn btn-primary">
            <IconPlus width={18} height={18} /> Create New Initiative
          </Link>
        </div>

        {/* Verification Alert if not approved */}
        {organization?.verificationStatus !== 'approved' && (
          <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
            <IconAlertCircle width={20} height={20} />
            <div>
              <strong>Organization Verification Status: {organization?.verificationStatus || 'Pending'}</strong>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem' }}>
                Your organization must be approved by an administrator before published initiatives are visible to the public.
                {' '}<Link to="/organization/verification" style={{ textDecoration: 'underline', fontWeight: 600 }}>Review verification details</Link>.
              </p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {metrics && (
          <div className="dashboard-grid">
            <div className="metric-card">
              <span className="badge badge-category">Campaigns</span>
              <div className="metric-value">{metrics.initiativesCount}</div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Total Initiatives</div>
              <div className="metric-sub">{metrics.activeInitiatives} currently active</div>
            </div>

            <div className="metric-card">
              <span className="badge badge-category">Volunteers</span>
              <div className="metric-value">{metrics.totalRegistrations}</div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Registrations</div>
              <div className="metric-sub">{metrics.verifiedVolunteersCount} verified contributors</div>
            </div>

            <div className="metric-card">
              <span className="badge badge-pending">Action Required</span>
              <div className="metric-value" style={{ color: metrics.pendingVerifications > 0 ? '#B45309' : 'var(--forest-900)' }}>
                {metrics.pendingVerifications}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Pending Reviews</div>
              <div className="metric-sub">Awaiting verification decision</div>
            </div>

            <div className="metric-card">
              <span className="badge badge-verified">Authoritative</span>
              <div className="metric-value" style={{ color: 'var(--verified-color)' }}>
                {metrics.totalVerifiedHours}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Verified Hours</div>
              <div className="metric-sub">Reaching {metrics.totalPeopleReached} people</div>
            </div>
          </div>
        )}

        {/* Organization Initiatives Table */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--forest-900)' }}>
              Your Initiatives & Drives
            </h3>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              {initiatives.length} initiatives created
            </span>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : initiatives.length > 0 ? (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Cause</th>
                    <th>Date & Time</th>
                    <th>Volunteers</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {initiatives.map((init) => (
                    <tr key={init._id}>
                      <td>
                        <Link to={`/initiatives/${init._id}`} style={{ fontWeight: 600, color: 'var(--forest-900)' }}>
                          {init.title}
                        </Link>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{init.location?.city}</div>
                      </td>
                      <td>
                        <span className="badge badge-category">{init.causeCategory}</span>
                      </td>
                      <td>
                        <div>{new Date(init.startDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{init.startTime}</div>
                      </td>
                      <td>
                        <strong>{init.registeredCount || 0}</strong> / {init.volunteerCapacity}
                      </td>
                      <td>
                        <span className={`badge ${init.status === 'published' ? 'badge-verified' : 'badge-category'}`}>
                          {init.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleOpenVolunteers(init)}
                          className="btn btn-outline btn-sm"
                        >
                          <IconUsers width={14} height={14} /> Manage Volunteers
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3 className="empty-state-title">No initiatives created yet</h3>
              <p className="empty-state-desc">
                Start by creating your first community campaign or volunteering opportunity.
              </p>
              <Link to="/initiatives/create" className="btn btn-primary btn-sm">
                Create First Initiative
              </Link>
            </div>
          )}
        </div>

        {/* Volunteer Management Section (if an initiative is selected) */}
        {activeInitiative && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--forest-900)' }}>
                  Registered Volunteers for "{activeInitiative.title}"
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Review field evidence, verify contributions, and log authoritative impact hours.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveInitiative(null)}
                className="btn btn-outline btn-sm"
              >
                Close List
              </button>
            </div>

            {reviewMsg && (
              <div className="alert alert-success">
                <IconCheckCircle width={18} height={18} />
                <span>{reviewMsg}</span>
              </div>
            )}

            {volLoading ? (
              <div className="skeleton" style={{ height: 180 }} />
            ) : volunteers.length > 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Volunteer</th>
                      <th>Registration Status</th>
                      <th>Verification Status</th>
                      <th>Claimed Proof / Evidence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((v) => {
                      const u = v.user || {};
                      const isVerified = v.verificationStatus === 'verified';
                      const isPending = v.verificationStatus === 'pending';
                      const isRejected = v.verificationStatus === 'rejected';

                      return (
                        <tr key={v._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </td>
                          <td>
                            <span className="badge">{v.status}</span>
                          </td>
                          <td>
                            {isVerified && <span className="badge badge-verified">Verified</span>}
                            {isPending && <span className="badge badge-pending">Pending Review</span>}
                            {isRejected && <span className="badge badge-rejected">Rejected</span>}
                            {v.verificationStatus === 'unverified' && <span className="badge">No Evidence Yet</span>}
                          </td>
                          <td>
                            {v.evidenceNotes ? (
                              <div style={{ maxWidth: 260 }}>
                                <div style={{ fontSize: '0.85rem' }}>"{v.evidenceNotes}"</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                  Claimed: {v.hoursClaimed} hrs • {v.peopleReachedClaimed || 0} reached
                                </div>
                                {v.evidenceUrls?.[0] && (
                                  <a
                                    href={v.evidenceUrls[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.75rem', color: 'var(--forest-700)', textDecoration: 'underline' }}
                                  >
                                    View Evidence Photo
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                            )}
                          </td>
                          <td>
                            {!isVerified && (
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReviewModal(v, 'approve')}
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReviewModal(v, 'reject')}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', color: '#BE123C' }}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {isVerified && (
                              <span style={{ color: 'var(--verified-color)', fontSize: '0.85rem', fontWeight: 600 }}>
                                Recorded
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No volunteers have registered for this initiative yet.
              </p>
            )}
          </div>
        )}

        {/* Verification Review Modal */}
        {reviewTarget && (
          <div className="modal-overlay" onClick={() => setReviewTarget(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                  {decision === 'approve' ? 'Approve Participation Verification' : 'Reject Participation Verification'}
                </h3>
                <button
                  type="button"
                  onClick={() => setReviewTarget(null)}
                  className="btn btn-outline btn-sm"
                  style={{ border: 'none', padding: '0.2rem' }}
                >
                  <IconX width={18} height={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitVerification}>
                <div className="modal-body">
                  {reviewError && (
                    <div className="alert alert-error">
                      <IconAlertCircle width={16} height={16} />
                      <span>{reviewError}</span>
                    </div>
                  )}

                  <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Volunteer: <strong>{reviewTarget.user?.name}</strong>
                  </p>

                  {decision === 'approve' ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Verified Hours</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="24"
                            className="input-field"
                            value={verifiedHours}
                            onChange={(e) => setVerifiedHours(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">People Reached</label>
                          <input
                            type="number"
                            min="0"
                            className="input-field"
                            value={peopleReached}
                            onChange={(e) => setPeopleReached(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ background: 'var(--sage-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--forest-900)' }}>
                        <strong>Authoritative Ledger Action:</strong> Upon approval, an immutable ImpactRecord is created and authoritative platform stats are recalculated.
                      </div>
                    </>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Rejection Reason (Recorded)</label>
                      <textarea
                        className="textarea-field"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why evidence was insufficient (e.g. proof does not match date, attendance unconfirmed)..."
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setReviewTarget(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionSubmitting}
                    className={`btn btn-sm ${decision === 'approve' ? 'btn-primary' : 'btn-danger'}`}
                  >
                    {actionSubmitting ? 'Processing...' : decision === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
