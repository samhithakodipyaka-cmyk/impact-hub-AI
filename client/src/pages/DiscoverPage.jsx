import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { initiativeService } from '../services/initiativeService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import InitiativeCard from '../components/initiative/InitiativeCard';
import {
  IconSearch,
  IconFilter,
  IconSparkles,
  IconX,
  IconCompass,
} from '../components/common/Icons';

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [initiatives, setInitiatives] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters state
  const causeParam = searchParams.get('cause') || 'All Causes';
  const cityParam = searchParams.get('city') || '';
  const searchParam = searchParams.get('search') || '';

  const [selectedCause, setSelectedCause] = useState(causeParam);
  const [cityInput, setCityInput] = useState(cityParam);
  const [searchInput, setSearchInput] = useState(searchParam);
  const [skillInput, setSkillInput] = useState('');
  const [startDateInput, setStartDateInput] = useState('');

  const causesList = [
    'All Causes',
    'Food & Hunger',
    'Environment & Nature',
    'Education & Literacy',
    'Healthcare & Blood Donation',
    'Animal Welfare',
    'Community Cleanup',
    'Disaster Relief',
    'Civic Engagement',
  ];

  // Fetch Initiatives
  useEffect(() => {
    async function loadInitiatives() {
      setLoading(true);
      try {
        const params = {
          page: searchParams.get('page') || 1,
          limit: 9,
        };

        if (selectedCause && selectedCause !== 'All Causes') params.cause = selectedCause;
        if (cityInput.trim()) params.city = cityInput.trim();
        if (searchInput.trim()) params.search = searchInput.trim();
        if (skillInput.trim()) params.skill = skillInput.trim();
        if (startDateInput) params.startDate = startDateInput;

        const res = await initiativeService.getAll(params);
        if (res.success) {
          setInitiatives(res.initiatives || []);
          setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadInitiatives();
  }, [searchParams, selectedCause, cityInput, searchInput, skillInput, startDateInput]);

  // Load AI Recommendations if logged in
  useEffect(() => {
    if (isAuthenticated) {
      aiService.getRecommendations(3).then((res) => {
        if (res.success) {
          setRecommendations(res.recommendations || []);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams();
    if (selectedCause && selectedCause !== 'All Causes') newParams.set('cause', selectedCause);
    if (cityInput.trim()) newParams.set('city', cityInput.trim());
    if (searchInput.trim()) newParams.set('search', searchInput.trim());
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedCause('All Causes');
    setCityInput('');
    setSearchInput('');
    setSkillInput('');
    setStartDateInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="badge badge-category" style={{ marginBottom: '0.5rem' }}>
            <IconCompass width={14} height={14} /> Discovery Engine
          </div>
          <h1 style={{ marginBottom: '0.5rem' }}>Discover Causes & Initiatives</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 640 }}>
            Find active on-the-ground volunteer drives organized by verified community partners and NGOs.
          </p>
        </div>

        {/* AI Recommendations Panel (if available) */}
        {recommendations.length > 0 && (
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#92400E' }}>
              <IconSparkles width={20} height={20} />
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#92400E' }}>Personalized AI Recommendations</h3>
              <span className="badge badge-ai" style={{ marginLeft: 'auto' }}>
                Multi-Factor Heuristic Match
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#78350F', marginBottom: '1.25rem' }}>
              Ranked dynamically by your registered skills, stated interests, and schedule availability with explainable match factors.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {recommendations.map((init) => (
                <InitiativeCard key={init._id} initiative={init} />
              ))}
            </div>
          </div>
        )}

        {/* Main Grid: Filters + Initiatives */}
        <div className="discovery-layout">
          {/* Filters Sidebar */}
          <aside className="filters-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <IconFilter width={18} height={18} />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem', border: 'none' }}
              >
                Reset All
              </button>
            </div>

            <form onSubmit={handleApplyFilters}>
              <div className="form-group">
                <label className="form-label">Search Keywords</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '2.4rem' }}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Trees, Food, Lake..."
                  />
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <IconSearch width={16} height={16} />
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cause Category</label>
                <select
                  className="select-field"
                  value={selectedCause}
                  onChange={(e) => setSelectedCause(e.target.value)}
                >
                  {causesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location / City</label>
                <input
                  type="text"
                  className="input-field"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="e.g. Hyderabad, Bengaluru"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Required Skill</label>
                <input
                  type="text"
                  className="input-field"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. Photography, Gardening"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available From Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem' }}>
                Apply Filters
              </button>
            </form>
          </aside>

          {/* Initiatives Results */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Showing <strong>{initiatives.length}</strong> of {pagination.total} initiatives
              </span>
            </div>

            {loading ? (
              <div className="initiatives-grid">
                <div className="skeleton" style={{ height: 360 }} />
                <div className="skeleton" style={{ height: 360 }} />
                <div className="skeleton" style={{ height: 360 }} />
              </div>
            ) : initiatives.length > 0 ? (
              <div className="initiatives-grid">
                {initiatives.map((init) => (
                  <InitiativeCard key={init._id} initiative={init} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <IconSearch width={24} height={24} />
                </div>
                <h3 className="empty-state-title">No initiatives match your filters</h3>
                <p className="empty-state-desc">
                  Try broadening your location, category, or search keywords. You can also use our AI Action Assistant to organize a community drive.
                </p>
                <button type="button" onClick={handleResetFilters} className="btn btn-outline btn-sm">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => {
                    const nextP = new URLSearchParams(searchParams);
                    nextP.set('page', String(pagination.page - 1));
                    setSearchParams(nextP);
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.88rem' }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => {
                    const nextP = new URLSearchParams(searchParams);
                    nextP.set('page', String(pagination.page + 1));
                    setSearchParams(nextP);
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
