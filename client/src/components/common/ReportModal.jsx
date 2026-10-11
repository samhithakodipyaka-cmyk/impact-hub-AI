import React, { useState } from 'react';
import apiRequest from '../../services/api';
import { IconFlag, IconX, IconCheckCircle, IconAlertCircle } from './Icons';

export default function ReportModal({ targetType, targetId, title = 'Content', onClose }) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiRequest('/reports', {
        method: 'POST',
        body: {
          targetType,
          targetId,
          reason,
          details,
        },
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <IconFlag width={20} height={20} color="#BE123C" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Report {title}</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '0.3rem', border: 'none' }}>
            <IconX width={18} height={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {success ? (
              <div className="alert alert-success">
                <IconCheckCircle width={20} height={20} />
                <span>Thank you. Your report has been submitted to platform administrators for investigation.</span>
              </div>
            ) : (
              <>
                {error && (
                  <div className="alert alert-error">
                    <IconAlertCircle width={18} height={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Reason for Report</label>
                  <select
                    className="select-field"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  >
                    <option value="spam">Spam or Irrelevant Content</option>
                    <option value="misleading_impact">Misleading or Fabricated Impact Claim</option>
                    <option value="fake_organization">Fake or Suspicious Organization</option>
                    <option value="inappropriate_content">Inappropriate / Harmful Content</option>
                    <option value="harassment">Harassment or Offensive Behavior</option>
                    <option value="safety_concern">Safety or Medical Concern</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Specific Details / Context</label>
                  <textarea
                    className="textarea-field"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe why this violates platform guidelines or why you suspect fabrication..."
                    required
                  />
                  <span className="form-hint">Our administration team reviews reports in accordance with community trust standards.</span>
                </div>
              </>
            )}
          </div>

          {!success && (
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-coral btn-sm">
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
