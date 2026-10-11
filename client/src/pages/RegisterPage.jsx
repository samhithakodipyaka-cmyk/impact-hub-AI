import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconSparkles, IconAlertCircle, IconUsers, IconBuilding } from '../components/common/Icons';

export default function RegisterPage() {
  const [role, setRole] = useState('individual'); // 'individual' or 'organization'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Organization-specific fields
  const [orgName, setOrgName] = useState('');
  const [category, setCategory] = useState('Food & Hunger');
  const [city, setCity] = useState('Hyderabad');
  const [orgDescription, setOrgDescription] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        ...(role === 'organization' && {
          organizationDetails: {
            name: orgName || name,
            category,
            city,
            description: orgDescription || `${orgName || name} community organization.`,
          },
        }),
      };

      const res = await register(payload);
      if (res.success) {
        if (role === 'organization') {
          navigate('/organization/verification');
        } else {
          navigate('/my-activities');
        }
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 540 }}>
        <div className="card" style={{ padding: '2.25rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                backgroundColor: 'var(--coral-100)',
                color: 'var(--coral-500)',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <IconSparkles width={22} height={22} />
            </div>
            <h2>Create Your Account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Join the verified social impact network
            </p>
          </div>

          {/* Role selector tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              background: 'var(--bg-subtle)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.75rem',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${role === 'individual' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', boxShadow: role === 'individual' ? 'var(--shadow-sm)' : 'none' }}
              onClick={() => { setRole('individual'); setError(''); }}
            >
              <IconUsers width={16} height={16} /> Volunteer / Student
            </button>
            <button
              type="button"
              className={`btn btn-sm ${role === 'organization' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', boxShadow: role === 'organization' ? 'var(--shadow-sm)' : 'none' }}
              onClick={() => { setRole('organization'); setError(''); }}
            >
              <IconBuilding width={16} height={16} /> Community Org / NGO
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <IconAlertCircle width={18} height={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{role === 'individual' ? 'Full Name' : 'Representative Full Name'}</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'individual' ? 'Ananya Sharma' : 'Dr. Radhika Sen'}
                required
              />
            </div>

            {role === 'organization' && (
              <>
                <div className="form-group">
                  <label className="form-label">Official Organization Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="GreenCanopy Foundation"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Primary Cause Category</label>
                    <select
                      className="select-field"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="Food & Hunger">Food & Hunger</option>
                      <option value="Environment & Nature">Environment & Nature</option>
                      <option value="Education & Literacy">Education & Literacy</option>
                      <option value="Healthcare & Blood Donation">Healthcare & Blood Donation</option>
                      <option value="Animal Welfare">Animal Welfare</option>
                      <option value="Community Cleanup">Community Cleanup</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                      <option value="Civic Engagement">Civic Engagement</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Headquarters City</label>
                    <input
                      type="text"
                      className="input-field"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Hyderabad"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Brief Mission / Description</label>
                  <textarea
                    className="textarea-field"
                    style={{ minHeight: '80px' }}
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    placeholder="Outline your community missions and initiatives..."
                    required
                  />
                </div>
              </>
            )}

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '0.75rem' }}>
              {loading ? 'Creating Account...' : `Register as ${role === 'organization' ? 'Organization' : 'Volunteer'}`}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--forest-800)', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
