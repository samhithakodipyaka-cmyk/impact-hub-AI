import React, { useState } from 'react';
import apiRequest from '../services/api';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import {
  IconUser,
  IconShieldCheck,
  IconCheckCircle,
  IconAlertCircle,
  IconPlus,
  IconX,
} from '../components/common/Icons';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.location?.city || '');
  const [stateName, setStateName] = useState(user?.location?.state || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [interests, setInterests] = useState(user?.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [availability, setAvailability] = useState({
    weekdays: user?.availability?.weekdays ?? false,
    weekends: user?.availability?.weekends ?? true,
    mornings: user?.availability?.mornings ?? true,
    afternoons: user?.availability?.afternoons ?? false,
    evenings: user?.availability?.evenings ?? true,
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');

    try {
      const res = await apiRequest('/users/profile', {
        method: 'PUT',
        body: {
          name,
          avatarUrl,
          bio,
          location: { city, state: stateName },
          skills,
          interests,
          availability,
        },
      });

      if (res.success) {
        setMsg('Profile updated successfully.');
        updateUser(res.user);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    setLoading(true);
    setMsg('');
    setError('');

    try {
      const res = await authService.updatePassword(currentPassword, newPassword);
      if (res.success) {
        setMsg('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 740 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1>Account & Profile Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage your personal profile, volunteering skills, availability, and security credentials.
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setMsg(''); setError(''); }}
            className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
          >
            <IconUser width={16} height={16} /> Edit Profile
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('security'); setMsg(''); setError(''); }}
            className={`btn btn-sm ${activeTab === 'security' ? 'btn-primary' : 'btn-outline'}`}
          >
            <IconShieldCheck width={16} height={16} /> Security & Password
          </button>
        </div>

        {msg && (
          <div className="alert alert-success">
            <IconCheckCircle width={18} height={18} />
            <span>{msg}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            <IconAlertCircle width={18} height={18} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="card" style={{ padding: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Avatar URL (Validated HTTP/HTTPS Link)</label>
              <input
                type="url"
                className="input-field"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.example.com/photo.jpg"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Biography</label>
              <textarea
                className="textarea-field"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your volunteering background and passions..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="input-field"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hyderabad"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="input-field"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Telangana"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="form-group">
              <label className="form-label">Skills</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {skills.map((s, idx) => (
                  <span key={idx} className="badge badge-category" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <IconX width={12} height={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-field"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                />
                <button type="button" onClick={handleAddSkill} className="btn btn-outline btn-sm">
                  <IconPlus width={15} height={15} /> Add
                </button>
              </div>
            </div>

            {/* Interests */}
            <div className="form-group">
              <label className="form-label">Interests & Causes</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {interests.map((it, idx) => (
                  <span key={idx} className="badge badge-category" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {it}
                    <button type="button" onClick={() => setInterests(interests.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <IconX width={12} height={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-field"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add cause interest..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
                />
                <button type="button" onClick={handleAddInterest} className="btn btn-outline btn-sm">
                  <IconPlus width={15} height={15} /> Add
                </button>
              </div>
            </div>

            {/* Availability checkboxes */}
            <div className="form-group">
              <label className="form-label">Volunteering Schedule Availability</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '0.3rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={availability.weekdays}
                    onChange={(e) => setAvailability({ ...availability, weekdays: e.target.checked })}
                  />
                  Weekdays
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={availability.weekends}
                    onChange={(e) => setAvailability({ ...availability, weekends: e.target.checked })}
                  />
                  Weekends
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={availability.mornings}
                    onChange={(e) => setAvailability({ ...availability, mornings: e.target.checked })}
                  />
                  Mornings
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={availability.evenings}
                    onChange={(e) => setAvailability({ ...availability, evenings: e.target.checked })}
                  />
                  Evenings
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        )}

        {/* TAB 2: Security */}
        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword} className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--forest-900)' }}>
              Change Account Password
            </h3>

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="input-field"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
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

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
