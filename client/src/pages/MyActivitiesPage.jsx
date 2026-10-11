import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { participationService } from '../services/participationService';
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconShieldCheck,
  IconCheckCircle,
  IconAlertCircle,
  IconX,
} from '../components/common/Icons';

export default function MyActivitiesPage() {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'registered', 'pending', 'verified'

  // Evidence modal state
  const [activeParticipation, setActiveParticipation] = useState(null);
  const [hoursClaimed, setHoursClaimed] = useState(3);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [peopleReached, setPeopleReached] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await participationService.getMyActivities();
      if (res.success) {
        setParticipations(res.participations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleOpenEvidence = (p) => {
    setActiveParticipation(p);
    setHoursClaimed(p.hoursClaimed || p.initiative?.estimatedHours || 3);
    setEvidenceNotes(p.evidenceNotes || '');
    setEvidenceUrl(p.evidenceUrls?.[0] || '');
    setPeopleReached(p.peopleReachedClaimed || 0);
    setModalError('');
  };

  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (!activeParticipation) return;
    setSubmitting(true);
    setModalError('');

    try {
      const payload = {
        hoursClaimed: parseFloat(hoursClaimed),
        evidenceNotes: evidenceNotes.trim(),
        evidenceUrls: evidenceUrl ? [evidenceUrl.trim()] : [],
        peopleReachedClaimed: parseInt(peopleReached, 10) || 0,
      };

      const res = await participationService.submitEvidence(activeParticipation._id, payload);
      if (res.success) {
        setParticipations((prev) =>
          prev.map((item) => (item._id === activeParticipation._id ? res.participation : item))
        );
        setActiveParticipation(null);
      }
    } catch (err) {
      setModalError(err.message || 'Failed to submit evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;
    try {
      const res = await participationService.cancel(id);
      if (res.success) {
        setParticipations((prev) =>
          prev.map((item) => (item._id === id ? res.participation : item))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel.');
    }
  };

  const filteredList = participations.filter((p) => {
    if (filter === 'registered') return p.status === 'registered';
    if (filter === 'pending') return p.verificationStatus === 'pending';
    if (filter === 'verified') return p.verificationStatus === 'verified';
    return true;
  });

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <div className="badge badge-category" style={{ marginBottom: '0.4rem' }}>
            Volunteer Ledger
          </div>
          <h1>My Activities & Participation Status</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Track registered initiatives, submit field evidence, and view verification decisions.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            All Activities ({participations.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('registered')}
            className={`btn btn-sm ${filter === 'registered' ? 'btn-primary' : 'btn-outline'}`}
          >
            Upcoming Registered ({participations.filter((p) => p.status === 'registered').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          >
            Verification Pending ({participations.filter((p) => p.verificationStatus === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('verified')}
            className={`btn btn-sm ${filter === 'verified' ? 'btn-primary' : 'btn-outline'}`}
          >
            Verified Completed ({participations.filter((p) => p.verificationStatus === 'verified').length})
          </button>
        </div>

        {/* List of Participations */}
        {loading ? (
          <div>
            <div className="skeleton" style={{ height: 160, marginBottom: '1.25rem' }} />
            <div className="skeleton" style={{ height: 160, marginBottom: '1.25rem' }} />
          </div>
        ) : filteredList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredList.map((p) => {
              const init = p.initiative || {};
              const org = init.organization || {};
              const isVerified = p.verificationStatus === 'verified';
              const isPending = p.verificationStatus === 'pending';
              const isRejected = p.verificationStatus === 'rejected';

              return (
                <div key={p._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-category">{init.causeCategory || 'Cause'}</span>
                        {isVerified && <span className="badge badge-verified">✔ Verified Impact</span>}
                        {isPending && <span className="badge badge-pending">⏳ Verification Pending</span>}
                        {isRejected && <span className="badge badge-rejected">✖ Verification Rejected</span>}
                        {p.status === 'registered' && <span className="badge">Registered</span>}
                        {p.status === 'cancelled' && <span className="badge" style={{ color: '#BE123C' }}>Cancelled</span>}
                      </div>

                      <Link to={`/initiatives/${init._id}`}>
                        <h3 style={{ fontSize: '1.3rem', margin: '0.2rem 0 0.4rem', color: 'var(--forest-900)' }}>
                          {init.title || 'Initiative'}
                        </h3>
                      </Link>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Organized by: <strong style={{ color: 'var(--forest-800)' }}>{org.name || 'Organization'}</strong>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {p.status === 'registered' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEvidence(p)}
                            className="btn btn-primary btn-sm"
                          >
                            Submit Evidence
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelRegistration(p._id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#BE123C' }}
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {isRejected && (
                        <button
                          type="button"
                          onClick={() => handleOpenEvidence(p)}
                          className="btn btn-secondary btn-sm"
                        >
                          Resubmit Evidence
                        </button>
                      )}

                      <Link to={`/initiatives/${init._id}`} className="btn btn-outline btn-sm">
                        Details
                      </Link>
                    </div>
                  </div>

                  {/* Date and Location */}
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconCalendar width={15} height={15} />
                      <span>{init.startDate ? new Date(init.startDate).toLocaleDateString() : 'TBD'} • {init.startTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconMapPin width={15} height={15} />
                      <span>{init.location?.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconClock width={15} height={15} />
                      <span>{init.estimatedHours} hours scheduled</span>
                    </div>
                  </div>

                  {/* Verification specifics */}
                  {isVerified && p.impactRecord && (
                    <div style={{ background: 'var(--verified-bg)', border: '1px solid var(--verified-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--verified-color)' }}>
                      <strong>Verified Contribution:</strong> {p.impactRecord.verifiedHours} hours completed • Reached {p.impactRecord.peopleReached || 0} people.
                    </div>
                  )}

                  {isRejected && p.rejectionReason && (
                    <div style={{ background: 'var(--rejected-bg)', border: '1px solid var(--rejected-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--rejected-color)' }}>
                      <strong>Rejection Feedback:</strong> {p.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h3 className="empty-state-title">No activities found</h3>
            <p className="empty-state-desc">
              You haven't registered for any initiatives in this category yet. Discover active drives and start creating impact!
            </p>
            <Link to="/initiatives" className="btn btn-primary btn-sm">
              Discover Initiatives
            </Link>
          </div>
        )}
      </div>

      {/* Evidence Modal */}
      {activeParticipation && (
        <div className="modal-overlay" onClick={() => setActiveParticipation(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Submit Completion Evidence</h3>
              <button
                type="button"
                onClick={() => setActiveParticipation(null)}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.2rem 0.4rem', border: 'none' }}
              >
                <IconX width={18} height={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEvidence}>
              <div className="modal-body">
                {modalError && (
                  <div className="alert alert-error">
                    <IconAlertCircle width={16} height={16} />
                    <span>{modalError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Hours Contributed</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      className="input-field"
                      value={hoursClaimed}
                      onChange={(e) => setHoursClaimed(e.target.value)}
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
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">What tasks did you accomplish?</label>
                  <textarea
                    className="textarea-field"
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="Describe your active contribution..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Photo Proof URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://example.com/field-proof.jpg"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setActiveParticipation(null)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
