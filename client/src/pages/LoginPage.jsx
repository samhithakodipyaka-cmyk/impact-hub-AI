import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconSparkles, IconAlertCircle } from '../components/common/Icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.success) {
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else if (res.user.role === 'organization') {
          navigate('/organization/dashboard');
        } else {
          navigate(from === '/' ? '/my-activities' : from);
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div style={{ padding: '3.5rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 460 }}>
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
            <h2>Welcome Back</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Sign in to your ImpactHub account
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <IconAlertCircle width={18} height={18} />
              <span>{error}</span>
            </div>
          )}

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

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--coral-500)', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Fillers */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>
              Quick Fill Demo Accounts:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleFillDemo('ananya.sharma@example.com', 'VolunteerPass1!')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Volunteer
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('aahaar@impacthub.ai', 'OrgPassword2026!')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Organization
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin@impacthub.ai', 'Admin@ImpactHub2026!')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Admin
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--forest-800)', fontWeight: 600 }}>
              Join Platform
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
