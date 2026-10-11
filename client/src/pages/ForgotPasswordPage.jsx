import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { IconSparkles, IconAlertCircle, IconCheckCircle, IconArrowRight } from '../components/common/Icons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authService.forgotPassword(email);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to submit password reset request.');
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
                backgroundColor: 'var(--amber-100)',
                color: 'var(--amber-600)',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <IconSparkles width={22} height={22} />
            </div>
            <h2>Password Recovery</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Enter your account email to receive a recovery link
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <IconAlertCircle width={18} height={18} />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div>
              <div className="alert alert-success">
                <IconCheckCircle width={20} height={20} />
                <span>{result.message}</span>
              </div>

              {result.devResetToken && (
                <div style={{ backgroundColor: 'var(--sage-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1rem 0' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--forest-900)', marginBottom: '0.4rem' }}>
                    Development Recovery Token:
                  </div>
                  <code style={{ fontSize: '0.78rem', wordBreak: 'break-all', display: 'block', background: '#FFF', padding: '0.5rem', borderRadius: 4 }}>
                    {result.devResetToken}
                  </code>
                  <div style={{ marginTop: '0.75rem' }}>
                    <Link
                      to={`/reset-password?token=${result.devResetToken}`}
                      className="btn btn-primary btn-sm"
                    >
                      Proceed to Reset Password <IconArrowRight width={14} height={14} />
                    </Link>
                  </div>
                </div>
              )}

              <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem' }}>
                <Link to="/login" style={{ color: 'var(--forest-800)', fontWeight: 600 }}>
                  Back to Sign In
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '0.5rem' }}>
                {loading ? 'Processing...' : 'Send Reset Instructions'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: 'var(--forest-800)', fontWeight: 600 }}>
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
