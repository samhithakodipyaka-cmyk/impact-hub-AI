import React, { useState, useEffect } from 'react';
import apiRequest from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  IconShieldCheck,
  IconCheckCircle,
  IconAlertCircle,
  IconBuilding,
} from '../components/common/Icons';

export default function OrgVerificationPage() {
  const { organization, refreshUser } = useAuth();
  const [org, setOrg] = useState(organization);
  const [loading, setLoading] = useState(!organization);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [docTitle, setDocTitle] = useState('Official Non-Profit Registration');
  const [docUrl, setDocUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrg() {
      try {
        const res = await apiRequest('/orgs/me');
        if (res.success) {
          setOrg(res.organization);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrg();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await apiRequest('/orgs/verify-request', {
        method: 'POST',
        body: {
          verificationNotes: notes,
          documentTitle: docTitle,
          documentUrl: docUrl,
        },
      });

      if (res.success) {
        setOrg(res.organization);
        setMessage('Verification documentation submitted successfully! Administrators have been notified.');
        refreshUser();
      }
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const status = org?.verificationStatus || 'pending';

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="badge badge-category" style={{ marginBottom: '0.4rem' }}>
            <IconShieldCheck width={14} height={14} /> Trust & Verification
          </div>
          <h1>Organization Verification Status</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            To safeguard volunteer safety and prevent misleading campaigns, community organizations must be vetted by administrators before publishing official initiatives.
          </p>
        </div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <IconCheckCircle width={18} height={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <IconAlertCircle width={18} height={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Current Status Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--forest-900)' }}>
              Current Status: {status.toUpperCase()}
            </h3>

            {status === 'approved' && (
              <span className="badge badge-verified" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                <IconShieldCheck width={16} height={16} /> Official Approved Partner
              </span>
            )}
            {status === 'pending' && (
              <span className="badge badge-pending" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                Pending Review
              </span>
            )}
            {status === 'rejected' && (
              <span className="badge badge-rejected" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                Verification Rejected
              </span>
            )}
          </div>

          {status === 'approved' && (
            <div style={{ backgroundColor: 'var(--verified-bg)', border: '1px solid var(--verified-border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--verified-color)', fontSize: '0.9rem' }}>
              Your organization has been officially verified! You are authorized to publish live initiatives that appear in the public discovery feed.
            </div>
          )}

          {status === 'pending' && (
            <div style={{ backgroundColor: 'var(--pending-bg)', border: '1px solid var(--pending-border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--pending-color)', fontSize: '0.9rem' }}>
              Your credentials are under active review by platform administrators. You can create and edit draft initiatives in your portal. They will become publishable once approved.
            </div>
          )}

          {status === 'rejected' && (
            <div style={{ backgroundColor: 'var(--rejected-bg)', border: '1px solid var(--rejected-border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--rejected-color)', fontSize: '0.9rem' }}>
              <strong>Rejection Reason:</strong> {org.rejectionReason || 'Submitted documentation was incomplete or could not be verified.'}
            </div>
          )}
        </div>

        {/* Document Submission Form */}
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--forest-900)' }}>
            {status === 'rejected' ? 'Resubmit Verification Credentials' : 'Submit Verification Documentation'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Provide public links to government registrations, trust deeds, NGO Darpan IDs, or institutional credentials.
          </p>

          <div className="form-group">
            <label className="form-label">Document Title</label>
            <input
              type="text"
              className="input-field"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Society Registration Certificate"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Document / Proof URL (Validated HTTP/HTTPS Link)</label>
            <input
              type="url"
              className="input-field"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              placeholder="https://example.org/docs/registration-cert.pdf"
              required
            />
            <span className="form-hint">Paste a link to your official registration scan, annual report, or website credential.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Verification Notes</label>
            <textarea
              className="textarea-field"
              style={{ minHeight: '90px' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mention your registration number, registered address, or institutional affiliations..."
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            {submitting ? 'Submitting...' : 'Submit Credentials for Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
