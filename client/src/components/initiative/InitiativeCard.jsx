import React from 'react';
import { Link } from 'react-router-dom';
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconClock,
  IconShieldCheck,
  IconSparkles,
} from '../common/Icons';

export default function InitiativeCard({ initiative }) {
  if (!initiative) return null;

  const {
    _id,
    title,
    causeCategory,
    startDate,
    startTime,
    estimatedHours,
    location,
    organization,
    volunteerCapacity,
    registeredCount = 0,
    imageUrl,
    aiRecommendation,
  } = initiative;

  const spotsRemaining = Math.max(0, volunteerCapacity - registeredCount);
  const formattedDate = startDate
    ? new Date(startDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const fallbackImage =
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80';

  return (
    <div className="initiative-card">
      <div className="initiative-img-container">
        <img
          src={imageUrl || fallbackImage}
          alt={title}
          className="initiative-card-img"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="badge badge-category">{causeCategory}</span>
          {aiRecommendation && (
            <span className="badge badge-ai" title={aiRecommendation.explanation?.join('; ')}>
              <IconSparkles width={12} height={12} /> {aiRecommendation.matchScore}% Match
            </span>
          )}
        </div>
      </div>

      <div className="initiative-body">
        {/* Organizer info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Organized by</span>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--forest-800)' }}>
            {organization?.name || 'Community Partner'}
          </span>
          {organization?.verificationStatus === 'approved' && (
            <span title="Verified Organization" style={{ color: 'var(--verified-color)', display: 'inline-flex' }}>
              <IconShieldCheck width={15} height={15} />
            </span>
          )}
        </div>

        <Link to={`/initiatives/${_id}`}>
          <h3 className="initiative-title">{title}</h3>
        </Link>

        {/* AI Explanation Reason Box if present */}
        {aiRecommendation?.explanation?.[0] && (
          <div
            style={{
              fontSize: '0.78rem',
              color: '#92400E',
              backgroundColor: '#FEF3C7',
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <IconSparkles width={13} height={13} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {aiRecommendation.explanation[0]}
            </span>
          </div>
        )}

        <div className="initiative-meta">
          <div className="initiative-meta-item">
            <IconCalendar width={15} height={15} />
            <span>{formattedDate} • {startTime}</span>
          </div>
          <div className="initiative-meta-item">
            <IconMapPin width={15} height={15} />
            <span>{location?.city || 'Local'}{location?.venue ? ` • ${location.venue}` : ''}</span>
          </div>
          <div className="initiative-meta-item">
            <IconClock width={15} height={15} />
            <span>{estimatedHours} hours contribution</span>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: spotsRemaining > 0 ? 'var(--text-secondary)' : '#BE123C' }}>
            <IconUsers width={15} height={15} />
            <span>{spotsRemaining > 0 ? `${spotsRemaining} spots left` : 'Full capacity'}</span>
          </div>

          <Link to={`/initiatives/${_id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
