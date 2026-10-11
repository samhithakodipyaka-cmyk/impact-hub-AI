import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { IconSparkles, IconAlertCircle, IconCheckCircle } from '../components/common/Icons';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    setLoading(true);

    try {
      const res = await authService.resetPassword(token, newPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. The token may be expired or already used.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="card" style={{ padding: '2.25rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                backgroundColor: 'var(--forest-100)',
                color: 'var(--forest-800)',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <IconSparkles width={22} height={22} />
            </div>
            <h2>Set New Password</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Create a secure password for your account
            </p>
          </div>

          {success ? (
            <div>
              <div className="alert alert-success">
                <IconCheckCircle width={20} height={20} />
                <span>Password updated successfully! Redirecting you to sign in...</span>
              </div>
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Sign In Now
                </Link>
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-error">
                  <IconAlertCircle width={18} height={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Reset Token</label>
                  <input
                    type="text"
                    className="input-field"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste 64-character token"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '0.5rem' }}>
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
