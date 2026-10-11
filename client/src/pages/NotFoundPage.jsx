import React from 'react';
import { Link } from 'react-router-dom';
import { IconCompass, IconSparkles } from '../components/common/Icons';

export default function NotFoundPage() {
  return (
    <div style={{ padding: '6rem 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 540 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--sage-surface)', color: 'var(--forest-800)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <IconCompass width={32} height={32} />
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: 'var(--forest-950)' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The page or impact initiative you were looking for could not be found or may have moved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            Return Home
          </Link>
          <Link to="/initiatives" className="btn btn-outline">
            Discover Causes
          </Link>
        </div>
      </div>
    </div>
  );
}
