import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiRequest from '../services/api';
import InitiativeCard from '../components/initiative/InitiativeCard';
import {
  IconBuilding,
  IconShieldCheck,
  IconMapPin,
  IconCompass,
  IconClock,
} from '../components/common/Icons';

export default function OrgProfilePage() {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrg() {
      setLoading(true);
      try {
        const res = await apiRequest(`/orgs/${id}`);
        if (res.success) {
          setOrg(res.organization);
          setInitiatives(res.initiatives || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrg();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="skeleton" style={{ height: 320 }} />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="empty-state">
          <h3 className="empty-state-title">Organization not found</h3>
          <p className="empty-state-desc">The requested organization profile does not exist.</p>
          <Link to="/initiatives" className="btn btn-outline btn-sm">Explore Causes</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Org Banner Card */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 88, height: 88, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--forest-100)', flexShrink: 0, border: '2px solid var(--sage-border)' }}>
              {org.logoUrl ? (
                <img src={org.logoUrl} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'var(--forest-800)' }}>
                  {org.name.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.9rem', margin: 0 }}>{org.name}</h1>
                {org.verificationStatus === 'approved' && (
                  <span className="badge badge-verified" title="Administrator Verified Organization">
                    <IconShieldCheck width={15} height={15} /> Verified Partner
                  </span>
                )}
                <span className="badge badge-category">{org.category}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                {org.location?.city && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <IconMapPin width={14} height={14} />
                    <span>{org.location.city}, {org.location.country || 'India'}</span>
                  </div>
                )}
                {org.contactEmail && <div>Contact: {org.contactEmail}</div>}
                {org.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest-800)', textDecoration: 'underline' }}>
                    Visit Website
                  </a>
                )}
              </div>

              <p style={{ color: 'var(--text-secondary)', maxWidth: 680, fontSize: '0.95rem', lineHeight: 1.6 }}>
                {org.description}
              </p>
            </div>
          </div>
        </div>

        {/* Initiatives List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Initiatives Hosted by {org.name}</h2>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{initiatives.length} campaigns</span>
          </div>

          {initiatives.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {initiatives.map((init) => (
                <InitiativeCard key={init._id} initiative={{ ...init, organization: org }} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No active public initiatives currently published by this organization.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
