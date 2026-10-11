import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initiativeService } from '../services/initiativeService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import {
  IconSparkles,
  IconAlertCircle,
  IconCheckCircle,
  IconPlus,
  IconX,
  IconBuilding,
} from '../components/common/Icons';

export default function CreateInitiativePage() {
  const { user, organization } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [causeCategory, setCauseCategory] = useState(organization?.category || 'Food & Hunger');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [estimatedHours, setEstimatedHours] = useState(3);
  const [city, setCity] = useState(organization?.location?.city || 'Hyderabad');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [volunteerCapacity, setVolunteerCapacity] = useState(15);
  const [imageUrl, setImageUrl] = useState('');
  const [skills, setSkills] = useState(['Teamwork', 'Communication']);
  const [newSkill, setNewSkill] = useState('');
  const [checklist, setChecklist] = useState([
    'Bring personal reusable water bottle',
    'Wear comfortable walking shoes',
  ]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [targetOutcomes, setTargetOutcomes] = useState([
    'Provide direct assistance to 50+ community members',
  ]);
  const [newOutcome, setNewOutcome] = useState('');
  const [status, setStatus] = useState('published'); // 'published' or 'draft'

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiNotice, setAiNotice] = useState('');

  // AI Draft Assistant
  const handleAiDraft = async () => {
    setAiLoading(true);
    setAiNotice('');
    setError('');

    try {
      const res = await aiService.assistDraft({
        titleHint: title,
        category: causeCategory,
        targetCity: city,
      });

      if (res.success && res.draft) {
        const d = res.draft;
        setTitle(d.suggestedTitle);
        setDescription(d.suggestedDescription);
        setEstimatedHours(d.estimatedHours);
        setVolunteerCapacity(d.volunteerCapacity);
        if (Array.isArray(d.requiredSkills)) setSkills(d.requiredSkills);
        if (Array.isArray(d.preparationChecklist)) setChecklist(d.preparationChecklist);
        if (Array.isArray(d.targetOutcomes)) setTargetOutcomes(d.targetOutcomes);
        setAiNotice('AI draft generated! All fields have been populated and remain fully editable.');
      }
    } catch (err) {
      setError(err.message || 'AI assistant encountered an error.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleAddChecklist = () => {
    if (newChecklistItem.trim()) {
      setChecklist([...checklist, newChecklistItem.trim()]);
      setNewChecklistItem('');
    }
  };

  const handleRemoveChecklist = (idx) => {
    setChecklist(checklist.filter((_, i) => i !== idx));
  };

  const handleAddOutcome = () => {
    if (newOutcome.trim()) {
      setTargetOutcomes([...targetOutcomes, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const handleRemoveOutcome = (idx) => {
    setTargetOutcomes(targetOutcomes.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        title,
        causeCategory,
        description,
        startDate,
        endDate: endDate || startDate,
        startTime,
        endTime,
        estimatedHours: parseFloat(estimatedHours),
        location: {
          city,
          venue,
          address,
        },
        volunteerCapacity: parseInt(volunteerCapacity, 10),
        requiredSkills: skills,
        preparationChecklist: checklist,
        targetOutcomes,
        imageUrl,
        status,
        isAiGeneratedDraft: !!aiNotice,
      };

      const res = await initiativeService.create(payload);
      if (res.success) {
        navigate(`/initiatives/${res.initiative._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create initiative.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 840 }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="badge badge-category" style={{ marginBottom: '0.4rem' }}>
            <IconBuilding width={14} height={14} /> Organization Portal
          </div>
          <h1>Create New Initiative</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Publish a community service opportunity with verifiable volunteer requirements.
          </p>
        </div>

        {/* AI Assistant Banner */}
        <div
          style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#92400E', fontWeight: 600 }}>
              <IconSparkles width={18} height={18} />
              <span>AI Initiative Creation Assistant</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#78350F', margin: '0.3rem 0 0' }}>
              Select a cause and city, then let our rule-based assistant draft an initial structured title, description, skills, checklist, and outcomes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAiDraft}
            disabled={aiLoading}
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: '#92400E', borderColor: '#78350F' }}
          >
            {aiLoading ? 'Drafting...' : 'Assist with AI Draft'}
          </button>
        </div>

        {aiNotice && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <IconCheckCircle width={18} height={18} />
            <span>{aiNotice}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <IconAlertCircle width={18} height={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Initiative Title</label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Food Rescue & Distribution Drive"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Cause Category</label>
              <select
                className="select-field"
                value={causeCategory}
                onChange={(e) => setCauseCategory(e.target.value)}
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
              <label className="form-label">City</label>
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
            <label className="form-label">Detailed Description</label>
            <textarea
              className="textarea-field"
              style={{ minHeight: '130px' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, the on-the-ground activities, and volunteer responsibilities..."
              required
            />
          </div>

          {/* Dates and Times */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="text"
                className="input-field"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00 AM"
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="text"
                className="input-field"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="12:00 PM"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                className="input-field"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Venue & Capacity */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Venue / Meeting Spot</label>
              <input
                type="text"
                className="input-field"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Agara Lake Wetland Gate"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Volunteer Capacity</label>
              <input
                type="number"
                min="1"
                max="1000"
                className="input-field"
                value={volunteerCapacity}
                onChange={(e) => setVolunteerCapacity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Photo / Banner URL (Validated HTTP/HTTPS URL)</label>
            <input
              type="url"
              className="input-field"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-example.jpg"
            />
          </div>

          {/* Skills chips */}
          <div className="form-group">
            <label className="form-label">Required Volunteer Skills</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              {skills.map((s, idx) => (
                <span key={idx} className="badge badge-category" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
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
                placeholder="Add a required skill..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              />
              <button type="button" onClick={handleAddSkill} className="btn btn-outline btn-sm">
                <IconPlus width={15} height={15} /> Add
              </button>
            </div>
          </div>

          {/* Preparation Checklist */}
          <div className="form-group">
            <label className="form-label">Preparation Checklist for Volunteers</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {checklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '0.4rem 0.75rem', borderRadius: 4, fontSize: '0.88rem' }}>
                  <span>{item}</span>
                  <button type="button" onClick={() => handleRemoveChecklist(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BE123C' }}>
                    <IconX width={14} height={14} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="e.g. Bring photo ID, wear gloves..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklist(); } }}
              />
              <button type="button" onClick={handleAddChecklist} className="btn btn-outline btn-sm">
                <IconPlus width={15} height={15} /> Add
              </button>
            </div>
          </div>

          {/* Target Outcomes */}
          <div className="form-group">
            <label className="form-label">Target Outcomes / Expected Metrics</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {targetOutcomes.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '0.4rem 0.75rem', borderRadius: 4, fontSize: '0.88rem' }}>
                  <span>{item}</span>
                  <button type="button" onClick={() => handleRemoveOutcome(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BE123C' }}>
                    <IconX width={14} height={14} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                placeholder="e.g. Distribute 150 meals..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOutcome(); } }}
              />
              <button type="button" onClick={handleAddOutcome} className="btn btn-outline btn-sm">
                <IconPlus width={15} height={15} /> Add
              </button>
            </div>
          </div>

          {/* Submission Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => { setStatus('draft'); }}
              disabled={loading}
              className="btn btn-outline"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              onClick={() => { setStatus('published'); }}
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              {loading ? 'Publishing...' : 'Publish Initiative'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
