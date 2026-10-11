import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { initiativeService } from '../services/initiativeService';
import { participationService } from '../services/participationService';
import { useAuth } from '../context/AuthContext';
import ReportModal from '../components/common/ReportModal';
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconShieldCheck,
  IconCheckCircle,
  IconAlertCircle,
  IconFlag,
  IconSparkles,
  IconX,
} from '../components/common/Icons';

export default function InitiativeDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [initiative, setInitiative] = useState(null);
  const [participation, setParticipation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Evidence Form state
  const [hoursClaimed, setHoursClaimed] = useState(3);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceUrlInput, setEvidenceUrlInput] = useState('');
  const [peopleReachedClaimed, setPeopleReachedClaimed] = useState(0);

  useEffect(() => {
    async function loadInitiative() {
      setLoading(true);
      try {
        const res = await initiativeService.getById(id);
        if (res.success) {
          setInitiative(res.initiative);
          setParticipation(res.userParticipation || null);
          if (res.initiative.estimatedHours) {
            setHoursClaimed(res.initiative.estimatedHours);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load initiative details.');
      } finally {
        setLoading(false);
      }
    }
    loadInitiative();
  }, [id]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      return navigate('/login');
    }
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await participationService.join(id);
      if (res.success) {
        setParticipation(res.participation);
        setSuccessMsg('You have successfully registered for this initiative!');
        setInitiative((prev) => ({
          ...prev,
          registeredCount: (prev.registeredCount || 0) + 1,
        }));
      }
    } catch (err) {
      setError(err.message || 'Unable to join initiative.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelParticipation = async () => {
    if (!participation) return;
    if (!window.confirm('Are you sure you want to cancel your participation?')) return;

    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await participationService.cancel(participation._id);
      if (res.success) {
        setParticipation(res.participation);
        setSuccessMsg('Your registration has been cancelled.');
        setInitiative((prev) => ({
          ...prev,
          registeredCount: Math.max(0, (prev.registeredCount || 1) - 1),
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel participation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (!participation) return;

    setActionLoading(true);
    setError('');

    try {
      const payload = {
        hoursClaimed: parseFloat(hoursClaimed),
        evidenceNotes: evidenceNotes.trim(),
        evidenceUrls: evidenceUrlInput ? [evidenceUrlInput.trim()] : [],
        peopleReachedClaimed: parseInt(peopleReachedClaimed, 10) || 0,
      };

      const res = await participationService.submitEvidence(participation._id, payload);
      if (res.success) {
        setParticipation(res.participation);
        setShowEvidenceModal(false);
        setSuccessMsg('Evidence submitted successfully! It is now pending organization review.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit evidence.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  if (error && !initiative) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="alert alert-error">
          <IconAlertCircle width={20} height={20} />
          <span>{error}</span>
        </div>
        <Link to="/initiatives" className="btn btn-outline btn-sm">Back to Discover</Link>
      </div>
    );
  }

  const {
    title,
    description,
    causeCategory,
    startDate,
    endDate,
    startTime,
    endTime,
    estimatedHours,
    location,
    requiredSkills = [],
    volunteerCapacity,
    registeredCount = 0,
    imageUrl,
    preparationChecklist = [],
    targetOutcomes = [],
    organization,
  } = initiative;

  const isFull = registeredCount >= volunteerCapacity;
  const isRegistered = participation && participation.status === 'registered';
  const isAttended = participation && (participation.status === 'attended' || participation.status === 'completed');
  const isVerified = participation && participation.verificationStatus === 'verified';
  const isPending = participation && participation.verificationStatus === 'pending';
  const isRejected = participation && participation.verificationStatus === 'rejected';

  const formattedDate = startDate
    ? new Date(startDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const fallbackImage =
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&q=80';

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container">
        {/* Breadcrumb & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <Link to="/initiatives" style={{ color: 'var(--forest-800)' }}>Initiatives</Link>
            <span>/</span>
            <span>{causeCategory}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="btn btn-outline btn-sm"
            style={{ color: '#BE123C', borderColor: 'var(--border-subtle)', fontSize: '0.82rem' }}
          >
            <IconFlag width={14} height={14} /> Report Initiative
          </button>
        </div>

        {successMsg && (
          <div className="alert alert-success">
            <IconCheckCircle width={18} height={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <IconAlertCircle width={18} height={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="detail-layout">
          {/* Main Content Column */}
          <div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 380, marginBottom: '2rem', backgroundColor: 'var(--bg-muted)' }}>
              <img
                src={imageUrl || fallbackImage}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = fallbackImage; }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-category">{causeCategory}</span>
              <span className="badge" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                {estimatedHours} Hours Required
              </span>
            </div>

            <h1 style={{ marginBottom: '1.25rem', fontSize: '2.4rem' }}>{title}</h1>

            <div style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-line', marginBottom: '2.5rem' }}>
              {description}
            </div>

            {/* Target Outcomes */}
            {targetOutcomes.length > 0 && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.75rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
                  Target Impact Outcomes
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {targetOutcomes.map((outcome, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.95rem' }}>
                      <IconCheckCircle width={18} height={18} color="var(--forest-700)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preparation Checklist */}
            {preparationChecklist.length > 0 && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.75rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
                  Volunteer Preparation Checklist
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {preparationChecklist.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.95rem' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--sage-surface)', color: 'var(--forest-800)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            {requiredSkills.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>Desired Volunteer Skills</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {requiredSkills.map((s, idx) => (
                    <span key={idx} className="badge badge-category" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action & Organizer Sidebar */}
          <div>
            <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: 90 }}>
              {/* Participation Status Card */}
              {participation ? (
                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', marginBottom: '1.5rem', border: '1px solid var(--border-medium)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Your Status
                    </span>
                    {isVerified ? (
                      <span className="badge badge-verified">Verified Impact</span>
                    ) : isPending ? (
                      <span className="badge badge-pending">Verification Pending</span>
                    ) : isRejected ? (
                      <span className="badge badge-rejected">Verification Rejected</span>
                    ) : isRegistered ? (
                      <span className="badge badge-category">Registered Participant</span>
                    ) : (
                      <span className="badge">{participation.status}</span>
                    )}
                  </div>

                  {isVerified && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--verified-color)', fontWeight: 500 }}>
                      ✔ Your contribution has been verified by the organization. Hours are recorded on your profile.
                    </p>
                  )}

                  {isPending && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--pending-color)' }}>
                      ⏳ Evidence submitted. Waiting for organizer review.
                    </p>
                  )}

                  {isRejected && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--rejected-color)', marginTop: '0.4rem' }}>
                      <strong>Reason:</strong> {participation.rejectionReason}
                    </div>
                  )}

                  {/* Actions for registered volunteer */}
                  {isRegistered && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowEvidenceModal(true)}
                        className="btn btn-primary btn-sm w-full"
                      >
                        Submit Completion Evidence
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelParticipation}
                        disabled={actionLoading}
                        className="btn btn-outline btn-sm w-full"
                        style={{ color: '#BE123C' }}
                      >
                        Cancel Registration
                      </button>
                    </div>
                  )}

                  {isRejected && (
                    <button
                      type="button"
                      onClick={() => setShowEvidenceModal(true)}
                      className="btn btn-secondary btn-sm w-full"
                      style={{ marginTop: '0.75rem' }}
                    >
                      Resubmit Evidence
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Volunteer Slots</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                      {registeredCount} / {volunteerCapacity} Filled
                    </span>
                  </div>

                  <div style={{ height: 8, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (registeredCount / volunteerCapacity) * 100)}%`,
                        background: isFull ? '#BE123C' : 'var(--forest-600)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={isFull || actionLoading}
                    className="btn btn-primary btn-lg w-full"
                  >
                    {actionLoading ? 'Registering...' : isFull ? 'Capacity Reached' : 'Join Initiative'}
                  </button>
                </div>
              )}

              {/* Schedule and Logistics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <IconCalendar width={18} height={18} color="var(--forest-700)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Date</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{formattedDate}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <IconClock width={18} height={18} color="var(--forest-700)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Schedule</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{startTime} - {endTime} ({estimatedHours} hrs)</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <IconMapPin width={18} height={18} color="var(--forest-700)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Location</div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {location?.venue && `${location.venue}, `}
                      {location?.address && `${location.address}, `}
                      {location?.city}
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Profile Card */}
              {organization && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                    Hosted By
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--forest-100)', flexShrink: 0 }}>
                      {organization.logoUrl ? (
                        <img src={organization.logoUrl} alt={organization.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest-800)', fontWeight: 700 }}>
                          {organization.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Link to={`/organizations/${organization._id}`} style={{ fontWeight: 600, color: 'var(--forest-900)' }}>
                          {organization.name}
                        </Link>
                        {organization.verificationStatus === 'approved' && (
                          <span title="Verified Organization" style={{ color: 'var(--verified-color)' }}>
                            <IconShieldCheck width={15} height={15} />
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{organization.category}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                    {organization.description?.slice(0, 140)}...
                  </p>

                  <Link to={`/organizations/${organization._id}`} className="btn btn-outline btn-sm w-full">
                    View Organization Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Submission Modal */}
      {showEvidenceModal && (
        <div className="modal-overlay" onClick={() => setShowEvidenceModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Submit Completion Evidence</h3>
              <button
                type="button"
                onClick={() => setShowEvidenceModal(false)}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.2rem 0.4rem', border: 'none' }}
              >
                <IconX width={18} height={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEvidence}>
              <div className="modal-body">
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Please share details of your on-site volunteering contribution. The hosting organization will review this submission to verify your official impact hours.
                </p>

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
                    <label className="form-label">Estimated People Reached</label>
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      value={peopleReachedClaimed}
                      onChange={(e) => setPeopleReachedClaimed(e.target.value)}
                      placeholder="e.g. 25"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Activity & Outcome Notes</label>
                  <textarea
                    className="textarea-field"
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="Describe your role, tasks performed, and quantifiable results achieved..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Photo / Supporting Evidence URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={evidenceUrlInput}
                    onChange={(e) => setEvidenceUrlInput(e.target.value)}
                    placeholder="https://images.example.com/cleanup-proof.jpg"
                  />
                  <span className="form-hint">Paste an image link or public link demonstrating your on-site presence.</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          targetType="initiative"
          targetId={id}
          title={title}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
