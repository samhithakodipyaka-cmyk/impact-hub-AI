import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import InitiativeCard from '../components/initiative/InitiativeCard';
import {
  IconSparkles,
  IconClock,
  IconMapPin,
  IconHeart,
  IconCheckCircle,
  IconCalendar,
  IconAward,
  IconBuilding,
} from '../components/common/Icons';

export default function AiActionAssistantPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('what-can-i-do'); // 'what-can-i-do', 'occasions', 'gaps'

  // Tab 1: "What Can I Do?" state
  const [wcidHours, setWcidHours] = useState(2);
  const [wcidCity, setWcidCity] = useState(user?.location?.city || 'Hyderabad');
  const [wcidCause, setWcidCause] = useState('Food & Hunger');
  const [wcidResult, setWcidResult] = useState(null);
  const [wcidLoading, setWcidLoading] = useState(false);

  // Tab 2: Occasion Planner state
  const [occasionType, setOccasionType] = useState('birthday');
  const [occasionCause, setOccasionCause] = useState('Environment & Nature');
  const [guestCount, setGuestCount] = useState(12);
  const [occasionIdea, setOccasionIdea] = useState(null);
  const [occasionLoading, setOccasionLoading] = useState(false);

  // Tab 3: Gap Analysis state
  const [gapData, setGapData] = useState(null);
  const [gapLoading, setGapLoading] = useState(false);

  // Execute What Can I Do
  const handleWhatCanIDo = async (e) => {
    if (e) e.preventDefault();
    setWcidLoading(true);
    try {
      const res = await aiService.whatCanIDo({
        hoursAvailable: wcidHours,
        city: wcidCity,
        cause: wcidCause,
        skills: user?.skills || [],
      });
      if (res.success) {
        setWcidResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWcidLoading(false);
    }
  };

  // Execute Occasion Ideas
  const handleGenerateOccasion = async (e) => {
    if (e) e.preventDefault();
    setOccasionLoading(true);
    try {
      const res = await aiService.getOccasionIdeas({
        occasionType,
        preferredCause: occasionCause,
        guestCount,
      });
      if (res.success) {
        setOccasionIdea(res.idea);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOccasionLoading(false);
    }
  };

  // Load Gap Insights on tab open
  useEffect(() => {
    if (activeTab === 'gaps' && !gapData) {
      setGapLoading(true);
      aiService.getGapInsights()
        .then((res) => {
          if (res.success) setGapData(res);
        })
        .finally(() => setGapLoading(false));
    }
  }, [activeTab, gapData]);

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>
            <IconSparkles width={14} height={14} /> Rule-Based Transparent AI
          </div>
          <h1>AI Action Assistant</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 680 }}>
            Practical, explainable social impact recommendations based on real platform records and transparent heuristic templates.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'var(--bg-subtle)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-md)',
            width: 'fit-content',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('what-can-i-do')}
            className={`btn btn-sm ${activeTab === 'what-can-i-do' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', boxShadow: activeTab === 'what-can-i-do' ? 'var(--shadow-sm)' : 'none' }}
          >
            "What Can I Do?" Wizard
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('occasions'); if (!occasionIdea) handleGenerateOccasion(); }}
            className={`btn btn-sm ${activeTab === 'occasions' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', boxShadow: activeTab === 'occasions' ? 'var(--shadow-sm)' : 'none' }}
          >
            Birthday & Occasion Ideas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gaps')}
            className={`btn btn-sm ${activeTab === 'gaps' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', boxShadow: activeTab === 'gaps' ? 'var(--shadow-sm)' : 'none' }}
          >
            Community Gap Insights
          </button>
        </div>

        {/* TAB 1: What Can I Do? */}
        {activeTab === 'what-can-i-do' && (
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2.5rem' }}>
            {/* Input Form */}
            <div className="card" style={{ padding: '1.75rem', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
                Your Availability & Preference
              </h3>

              <form onSubmit={handleWhatCanIDo}>
                <div className="form-group">
                  <label className="form-label">Available Time</label>
                  <select
                    className="select-field"
                    value={wcidHours}
                    onChange={(e) => setWcidHours(e.target.value)}
                  >
                    <option value={1}>1 Hour (Quick Action)</option>
                    <option value={2}>2 Hours (Standard Session)</option>
                    <option value={3.5}>3.5 Hours (Half-Day Drive)</option>
                    <option value={6}>6 Hours (Full Weekend Drive)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location / City</label>
                  <input
                    type="text"
                    className="input-field"
                    value={wcidCity}
                    onChange={(e) => setWcidCity(e.target.value)}
                    placeholder="e.g. Hyderabad, Bengaluru"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Cause</label>
                  <select
                    className="select-field"
                    value={wcidCause}
                    onChange={(e) => setWcidCause(e.target.value)}
                  >
                    <option value="Food & Hunger">Food & Hunger</option>
                    <option value="Environment & Nature">Environment & Nature</option>
                    <option value="Education & Literacy">Education & Literacy</option>
                    <option value="Animal Welfare">Animal Welfare</option>
                    <option value="Community Cleanup">Community Cleanup</option>
                  </select>
                </div>

                <button type="submit" disabled={wcidLoading} className="btn btn-primary w-full" style={{ marginTop: '0.75rem' }}>
                  {wcidLoading ? 'Analyzing Platform...' : 'Find What I Can Do'}
                </button>
              </form>
            </div>

            {/* Results Area */}
            <div>
              {wcidLoading ? (
                <div className="skeleton" style={{ height: 260 }} />
              ) : wcidResult ? (
                <div>
                  <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
                    <IconSparkles width={18} height={18} />
                    <span>{wcidResult.summary}</span>
                  </div>

                  {wcidResult.type === 'real_initiatives' && (
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
                        Live Upcoming Initiatives Matching Your Schedule
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        {wcidResult.initiatives.map((init) => (
                          <InitiativeCard key={init._id} initiative={init} />
                        ))}
                      </div>
                    </div>
                  )}

                  {wcidResult.type === 'diy_action_plan' && wcidResult.actionPlan && (
                    <div className="card" style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span className="badge badge-category">{wcidResult.actionPlan.cause}</span>
                        <span className="badge" style={{ background: 'var(--bg-subtle)' }}>
                          {wcidResult.actionPlan.estimatedHours} Hours Suggested
                        </span>
                      </div>

                      <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
                        {wcidResult.actionPlan.title}
                      </h2>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.6rem' }}>Action Checklist</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {wcidResult.actionPlan.checklist.map((c, i) => (
                            <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.92rem' }}>
                              <IconCheckCircle width={16} height={16} color="var(--forest-700)" style={{ flexShrink: 0, marginTop: 2 }} />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ background: 'var(--sage-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--forest-900)' }}>
                        <strong>Estimated Impact Outcome:</strong> {wcidResult.actionPlan.impactOutcome}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <strong>Safety Guidance:</strong> {wcidResult.actionPlan.safetyTips}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <IconSparkles width={24} height={24} />
                  </div>
                  <h3 className="empty-state-title">Ready to discover your next action</h3>
                  <p className="empty-state-desc">
                    Select how much time you have available and your preferred cause to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Occasion Ideas */}
        {activeTab === 'occasions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2.5rem' }}>
            <div className="card" style={{ padding: '1.75rem', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
                Occasion Generator
              </h3>

              <form onSubmit={handleGenerateOccasion}>
                <div className="form-group">
                  <label className="form-label">Occasion Type</label>
                  <select
                    className="select-field"
                    value={occasionType}
                    onChange={(e) => setOccasionType(e.target.value)}
                  >
                    <option value="birthday">Birthday Celebration</option>
                    <option value="anniversary">Anniversary / Milestone</option>
                    <option value="corporate_team">Corporate / Team Impact Sprint</option>
                    <option value="memorial">Memorial / Living Legacy</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Focus</label>
                  <select
                    className="select-field"
                    value={occasionCause}
                    onChange={(e) => setOccasionCause(e.target.value)}
                  >
                    <option value="Environment & Nature">Environment & Nature</option>
                    <option value="Food & Hunger">Food & Hunger</option>
                    <option value="Education & Literacy">Education & Literacy</option>
                    <option value="Community Cleanup">Community Cleanup</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Invited Guests / Volunteers</label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    className="input-field"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={occasionLoading} className="btn btn-primary w-full" style={{ marginTop: '0.75rem' }}>
                  {occasionLoading ? 'Drafting...' : 'Generate Impact Idea'}
                </button>
              </form>
            </div>

            {/* Generated Occasion Plan */}
            <div>
              {occasionIdea ? (
                <div className="card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className="badge badge-category">{occasionIdea.causeCategory}</span>
                    <span className="badge" style={{ background: 'var(--bg-subtle)' }}>
                      Capacity: {occasionIdea.volunteerCapacity} participants
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: 'var(--forest-900)' }}>
                    {occasionIdea.title}
                  </h2>

                  <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    {occasionIdea.description}
                  </p>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.6rem' }}>Preparation Checklist</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {occasionIdea.checklist?.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.92rem' }}>
                          <IconCheckCircle width={16} height={16} color="var(--forest-700)" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.6rem' }}>Projected Outcomes</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {occasionIdea.suggestedOutcomes?.map((out, idx) => (
                        <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.92rem' }}>
                          <span style={{ color: 'var(--forest-800)', fontWeight: 700 }}>•</span>
                          <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                    {occasionIdea.disclaimer}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <h3 className="empty-state-title">Occasion impact draft ready to generate</h3>
                  <p className="empty-state-desc">Select your event type and click generate to create an editable plan.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Community Gap Insights */}
        {activeTab === 'gaps' && (
          <div>
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--forest-900)' }}>
                <IconAward width={20} height={20} />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Cause Coverage & Opportunity Gaps</h3>
              </div>

              {gapLoading ? (
                <div className="skeleton" style={{ height: 180 }} />
              ) : gapData ? (
                <div>
                  <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
                    <span>{gapData.insights}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    {gapData.breakdown.map((item) => (
                      <div
                        key={item.category}
                        style={{
                          background: item.count === 0 ? '#FFFBEB' : '#FFFFFF',
                          border: `1px solid ${item.count === 0 ? '#FDE68A' : 'var(--border-subtle)'}`,
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--forest-900)', marginBottom: '0.25rem' }}>
                          {item.category}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--forest-800)' }}>
                          {item.count} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>initiatives ({item.sharePercentage}%)</span>
                        </div>
                        <span
                          className={`badge ${item.count === 0 ? 'badge-pending' : item.count <= 2 ? 'badge-category' : 'badge-verified'}`}
                          style={{ marginTop: '0.5rem' }}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    {gapData.disclaimer}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
