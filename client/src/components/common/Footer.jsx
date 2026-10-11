import React from 'react';
import { Link } from 'react-router-dom';
import { IconSparkles, IconShieldCheck, IconHeart } from './Icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: 'var(--forest-600)',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <IconSparkles width={18} height={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
                ImpactHub <span style={{ color: 'var(--coral-500)' }}>AI</span>
              </span>
            </div>
            <p style={{ color: '#A8B7AF', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 300 }}>
              Transforming fragmented social causes into verified real-world community impact.
              Discover, participate, verify, and measure.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Causes
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <li><Link to="/initiatives?cause=Food+%26+Hunger">Food Rescue & Hunger Relief</Link></li>
              <li><Link to="/initiatives?cause=Environment+%26+Nature">Reforestation & Climate</Link></li>
              <li><Link to="/initiatives?cause=Education+%26+Literacy">Education & Teaching</Link></li>
              <li><Link to="/initiatives?cause=Healthcare+%26+Blood+Donation">Blood Donation & Health</Link></li>
              <li><Link to="/initiatives?cause=Animal+Welfare">Animal Welfare & First-Aid</Link></li>
              <li><Link to="/initiatives?cause=Community+Cleanup">Urban Cleanups & Lakes</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Governance & Integrity
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <li><Link to="/impact-dashboard">Authoritative Verification Principles</Link></li>
              <li><Link to="/organization/verification">Organization Credential Standards</Link></li>
              <li><Link to="/ai-assistant">Explainable AI Methodology</Link></li>
              <li><Link to="/feed">Community Guidelines</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Integrity Commitment
            </h4>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#52B788', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <IconShieldCheck width={16} height={16} /> Zero-Fabrication Metric Standard
              </div>
              <p style={{ fontSize: '0.8rem', color: '#B7C7BF', lineHeight: 1.5 }}>
                Impact totals are derived strictly from reviewed on-the-ground proof records, never registrations, likes, or unverified claims.
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} ImpactHub AI. Connect. Act. Create Impact. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Built on pure MERN stack</span>
            <span>Mongoose Authoritative Aggregation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
