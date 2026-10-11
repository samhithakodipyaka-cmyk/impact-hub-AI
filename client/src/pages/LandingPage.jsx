import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { impactService } from '../services/impactService';
import { initiativeService } from '../services/initiativeService';
import InitiativeCard from '../components/initiative/InitiativeCard';
import {
  IconSparkles,
  IconShieldCheck,
  IconCompass,
  IconUsers,
  IconAward,
  IconArrowRight,
  IconCheckCircle,
} from '../components/common/Icons';

export default function LandingPage() {
  const [stats, setStats] = useState({
    totalVerifiedHours: 0,
    totalPeopleReached: 0,
    verifiedRecordsCount: 0,
    activeVolunteersCount: 0,
  });
  const [featuredInitiatives, setFeaturedInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, initRes] = await Promise.all([
          impactService.getPlatformOverview().catch(() => ({})),
          initiativeService.getAll({ limit: 3 }).catch(() => ({})),
        ]);

        if (statsRes.success && statsRes.stats) {
          setStats(statsRes.stats);
        }
        if (initRes.success && initRes.initiatives) {
          setFeaturedInitiatives(initRes.initiatives);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Editorial Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow">
              <IconSparkles width={14} height={14} /> Connect. Act. Create Impact.
            </div>
            <h1 className="hero-headline">
              Transforming scattered causes into <span style={{ color: 'var(--coral-500)', fontStyle: 'italic' }}>verified</span> real-world impact.
            </h1>
            <p className="hero-subhead">
              No more searching across disparate WhatsApp groups, social feeds, and campus flyers.
              Join transparent community initiatives, record on-the-ground proof, and earn authoritative impact credentials.
            </p>
            <div className="hero-cta-group">
              <Link to="/initiatives" className="btn btn-primary btn-lg">
                <IconCompass width={18} height={18} /> Discover Initiatives
              </Link>
              <Link to="/ai-assistant" className="btn btn-secondary btn-lg">
                <IconSparkles width={18} height={18} /> "What Can I Do?" Assistant
              </Link>
            </div>
          </div>

          <div>
            <div className="hero-card-preview">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span className="badge badge-verified">
                  <IconShieldCheck width={14} height={14} /> Authoritative Standard
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Ledger</span>
              </div>

              <div style={{ borderLeft: '3px solid var(--forest-700)', paddingLeft: '1rem', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--forest-900)' }}>
                  The ImpactHub Lifecycle
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Discover → Connect → Join → Participate → Verify → Measure
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--sage-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--forest-900)' }}>
                <strong>Strict Invariant:</strong> Joining an initiative registers intent. Only organizer-reviewed evidence creates verified volunteer hours and badges.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Platform Stats Strip */}
      <section className="stats-strip">
        <div className="container stats-grid">
          <div>
            <div className="stat-number">{stats.totalVerifiedHours}</div>
            <div className="stat-label">Verified Volunteer Hours</div>
          </div>
          <div>
            <div className="stat-number">{stats.totalPeopleReached}</div>
            <div className="stat-label">Verified People Reached</div>
          </div>
          <div>
            <div className="stat-number">{stats.verifiedRecordsCount}</div>
            <div className="stat-label">Verified Participations</div>
          </div>
          <div>
            <div className="stat-number">{stats.activeVolunteersCount}</div>
            <div className="stat-label">Active Verified Volunteers</div>
          </div>
        </div>
      </section>

      {/* Featured Live Initiatives */}
      <section style={{ padding: '4.5rem 0 3.5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ color: 'var(--coral-500)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                Live Community Drives
              </div>
              <h2>Upcoming Verified Initiatives</h2>
            </div>
            <Link to="/initiatives" className="btn btn-outline btn-sm">
              View All Initiatives <IconArrowRight width={15} height={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div className="skeleton" style={{ height: 320 }} />
              <div className="skeleton" style={{ height: 320 }} />
              <div className="skeleton" style={{ height: 320 }} />
            </div>
          ) : featuredInitiatives.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {featuredInitiatives.map((init) => (
                <InitiativeCard key={init._id} initiative={init} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No initiatives published yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Role Pathway Section */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '5rem 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 3.5rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Built for Volunteers & Community Organizations</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              A single platform connecting students and changemakers with legitimate NGOs, backed by verification workflows.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            <div className="editorial-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--forest-100)', color: 'var(--forest-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <IconUsers width={22} height={22} />
              </div>
              <h3 style={{ marginBottom: '0.75rem' }}>For Volunteers & Students</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <IconCheckCircle width={18} height={18} color="var(--forest-700)" />
                  Discover causes filtered by cause, city, required skills, and schedule.
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <IconCheckCircle width={18} height={18} color="var(--forest-700)" />
                  Submit field completion evidence with hours claimed and outcome notes.
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <IconCheckCircle width={18} height={18} color="var(--forest-700)" />
                  Build an authoritative, verifiable social-impact resume with badges.
                </li>
              </ul>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register as Volunteer
              </Link>
            </div>

            <div className="editorial-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--coral-100)', color: 'var(--coral-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <IconShieldCheck width={22} height={22} />
              </div>
              <h3 style={{ marginBottom: '0.75rem' }}>For NGOs & Community Groups</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <IconCheckCircle width={18} height={18} color="var(--forest-700)" />
                  Submit organization credentials for administrative verification.
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <IconCheckCircle width={18} height={18} color="var(--forest-700)" />
                  Draft, publish, and manage initiatives with volunteer capacities.
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <IconCheckCircle width={18} height={18} color="var(--forest-700)" />
                  Review volunteer submissions with approve/reject workflows and recorded reasons.
                </li>
              </ul>
              <Link to="/register" className="btn btn-secondary btn-sm">
                Register Organization
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
