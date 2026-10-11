import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  IconCompass,
  IconSparkles,
  IconUsers,
  IconAward,
  IconBuilding,
  IconShieldCheck,
  IconBell,
  IconLogOut,
  IconUser,
  IconMenu,
  IconX,
} from './Icons';

export default function Navbar() {
  const { user, organization, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    setMobileOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-link" onClick={() => setMobileOpen(false)}>
          <div className="brand-logo-mark">
            <IconSparkles width={22} height={22} />
          </div>
          <span>ImpactHub <span style={{ color: 'var(--coral-500)', fontSize: '0.9em' }}>AI</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          <li>
            <NavLink to="/initiatives" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
              Discover Causes
            </NavLink>
          </li>
          <li>
            <NavLink to="/feed" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
              Community Feed
            </NavLink>
          </li>
          <li>
            <NavLink to="/ai-assistant" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
              AI Action Assistant
            </NavLink>
          </li>
          {isAuthenticated && (
            <li>
              <NavLink to="/my-activities" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
                My Activities
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/impact-dashboard" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
              Impact Dashboard
            </NavLink>
          </li>
          {user?.role === 'organization' && (
            <li>
              <NavLink to="/organization/dashboard" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
                Org Portal
              </NavLink>
            </li>
          )}
          {user?.role === 'admin' && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
                Admin Portal
              </NavLink>
            </li>
          )}
        </ul>

        {/* Nav Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <Link to="/notifications" className="btn btn-outline btn-sm" style={{ padding: '0.45rem', borderRadius: '50%', position: 'relative' }} title="Notifications">
                <IconBell width={18} height={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--coral-500)',
                      color: '#FFF',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu Trigger */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <IconUser width={16} height={16} />
                  )}
                  <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: '200px',
                      padding: '0.5rem',
                      zIndex: 200,
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{user.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                      <span className={`badge ${user.role === 'admin' ? 'badge-rejected' : user.role === 'organization' ? 'badge-category' : 'badge-verified'}`} style={{ marginTop: '0.35rem' }}>
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={`/users/${user._id}`}
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.75rem' }}
                      onClick={() => setUserDropdown(false)}
                    >
                      <IconUser width={15} height={15} /> My Public Profile
                    </Link>

                    {user.role === 'organization' && (
                      <>
                        <Link
                          to="/organization/dashboard"
                          className="btn btn-outline btn-sm"
                          style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.75rem' }}
                          onClick={() => setUserDropdown(false)}
                        >
                          <IconBuilding width={15} height={15} /> Manage Initiatives
                        </Link>
                        <Link
                          to="/organization/verification"
                          className="btn btn-outline btn-sm"
                          style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.75rem' }}
                          onClick={() => setUserDropdown(false)}
                        >
                          <IconShieldCheck width={15} height={15} /> Verification Status
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="btn btn-outline btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.75rem' }}
                        onClick={() => setUserDropdown(false)}
                      >
                        <IconShieldCheck width={15} height={15} /> Admin Governance
                      </Link>
                    )}

                    <Link
                      to="/settings"
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.75rem' }}
                      onClick={() => setUserDropdown(false)}
                    >
                      Account Settings
                    </Link>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="btn btn-outline btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', border: 'none', color: '#BE123C', padding: '0.5rem 0.75rem' }}
                      >
                        <IconLogOut width={15} height={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join Platform
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none' }}
            id="mobile-nav-toggle"
          >
            {mobileOpen ? <IconX width={20} height={20} /> : <IconMenu width={20} height={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-subtle)', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/initiatives" onClick={() => setMobileOpen(false)}>Discover Causes</Link>
            <Link to="/feed" onClick={() => setMobileOpen(false)}>Community Feed</Link>
            <Link to="/ai-assistant" onClick={() => setMobileOpen(false)}>AI Action Assistant</Link>
            <Link to="/impact-dashboard" onClick={() => setMobileOpen(false)}>Impact Dashboard</Link>
            {isAuthenticated && <Link to="/my-activities" onClick={() => setMobileOpen(false)}>My Activities</Link>}
            {user?.role === 'organization' && <Link to="/organization/dashboard" onClick={() => setMobileOpen(false)}>Org Portal</Link>}
            {user?.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin Portal</Link>}
          </div>
        </div>
      )}
    </nav>
  );
}
