import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import {
  IconShieldCheck,
  IconBuilding,
  IconUsers,
  IconFlag,
  IconClock,
  IconCheckCircle,
  IconAlertCircle,
  IconX,
} from '../components/common/Icons';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orgs', 'users', 'reports', 'audits'

  const [overview, setOverview] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action feedback
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  // Org decision modal
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgDecision, setOrgDecision] = useState('approved');
  const [orgNotes, setOrgNotes] = useState('');
  const [orgRejectionReason, setOrgRejectionReason] = useState('');

  // Report resolution modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportAction, setReportAction] = useState('resolved');
  const [actionTakenNote, setActionTakenNote] = useState('');

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOverview();
      if (res.success) setOverview(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrgs = async () => {
    try {
      const res = await adminService.getOrganizations();
      if (res.success) setOrgs(res.organizations || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await adminService.getUsers();
      if (res.success) setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async () => {
    try {
      const res = await adminService.getReports();
      if (res.success) setReports(res.reports || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAudits = async () => {
    try {
      const res = await adminService.getAuditLogs();
      if (res.success) setAuditLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'orgs') loadOrgs();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'audits') loadAudits();
  }, [activeTab]);

  const handleOrgVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;

    try {
      const res = await adminService.verifyOrganization(selectedOrg._id, {
        status: orgDecision,
        notes: orgNotes,
        rejectionReason: orgRejectionReason,
      });

      if (res.success) {
        setActionMsg(`Organization verification updated to ${orgDecision}.`);
        setSelectedOrg(null);
        loadOrgs();
        loadOverview();
      }
    } catch (err) {
      setActionError(err.message || 'Action failed.');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const reason = prompt(`Reason for setting status to ${newStatus}:`, 'Administrative policy compliance');
    if (!reason) return;

    try {
      const res = await adminService.updateUserStatus(userId, newStatus, reason);
      if (res.success) {
        setActionMsg(`User status updated to ${newStatus}.`);
        loadUsers();
        loadOverview();
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update user status.');
    }
  };

  const handleResolveReportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const res = await adminService.resolveReport(selectedReport._id, {
        status: reportAction,
        actionTaken: actionTakenNote,
      });

      if (res.success) {
        setActionMsg(`Report marked as ${reportAction}.`);
        setSelectedReport(null);
        loadReports();
        loadOverview();
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update report.');
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="badge badge-rejected" style={{ marginBottom: '0.4rem' }}>
            <IconShieldCheck width={14} height={14} /> Administrator Governance Portal
          </div>
          <h1>Platform Trust & Governance</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Oversee organization credentials, moderate reported content, manage user accounts, and review authoritative audit logs.
          </p>
        </div>

        {actionMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <IconCheckCircle width={18} height={18} />
            <span>{actionMsg}</span>
          </div>
        )}
        {actionError && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <IconAlertCircle width={18} height={18} />
            <span>{actionError}</span>
          </div>
        )}

        {/* Tab Navigation */}
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
            onClick={() => { setActiveTab('overview'); loadOverview(); }}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            Overview & Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orgs')}
            className={`btn btn-sm ${activeTab === 'orgs' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            Organization Approvals ({overview?.metrics?.pendingOrganizations || 0} Pending)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            Users & Accounts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`btn btn-sm ${activeTab === 'reports' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            Moderation Reports ({overview?.metrics?.pendingReports || 0} Pending)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audits')}
            className={`btn btn-sm ${activeTab === 'audits' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            Audit Logs
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && overview && (
          <div>
            <div className="dashboard-grid">
              <div className="metric-card">
                <span className="badge badge-category">Users</span>
                <div className="metric-value">{overview.metrics.totalUsers}</div>
                <div style={{ fontWeight: 600 }}>Total Accounts</div>
                <div className="metric-sub">{overview.metrics.individualUsers} volunteers</div>
              </div>

              <div className="metric-card">
                <span className="badge badge-verified">Organizations</span>
                <div className="metric-value">{overview.metrics.approvedOrganizations}</div>
                <div style={{ fontWeight: 600 }}>Approved NGOs</div>
                <div className="metric-sub">{overview.metrics.pendingOrganizations} pending review</div>
              </div>

              <div className="metric-card">
                <span className="badge badge-category">Campaigns</span>
                <div className="metric-value">{overview.metrics.totalInitiatives}</div>
                <div style={{ fontWeight: 600 }}>Total Initiatives</div>
                <div className="metric-sub">{overview.metrics.activeInitiatives} active/ongoing</div>
              </div>

              <div className="metric-card">
                <span className="badge badge-verified">Authoritative</span>
                <div className="metric-value" style={{ color: 'var(--verified-color)' }}>
                  {overview.metrics.totalVerifiedHours}
                </div>
                <div style={{ fontWeight: 600 }}>Total Verified Hours</div>
                <div className="metric-sub">{overview.metrics.verifiedParticipations} verified drives</div>
              </div>
            </div>

            {/* Recent Audits Snippet */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--forest-900)' }}>
                Recent Administrator Actions
              </h3>
              {overview.recentAudits?.length > 0 ? (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Target</th>
                        <th>Admin</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.recentAudits.map((a) => (
                        <tr key={a._id}>
                          <td><strong>{a.action}</strong></td>
                          <td>{a.targetType}</td>
                          <td>{a.admin?.name || a.admin?.email}</td>
                          <td>{new Date(a.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No audit entries recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORGANIZATIONS VERIFICATION */}
        {activeTab === 'orgs' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--forest-900)' }}>
              Organizations Directory & Verification Requests
            </h3>

            {orgs.length > 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Organization</th>
                      <th>Category & Location</th>
                      <th>Representative</th>
                      <th>Verification</th>
                      <th>Documents</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgs.map((o) => (
                      <tr key={o._id}>
                        <td>
                          <strong>{o.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.contactEmail}</div>
                        </td>
                        <td>
                          <span className="badge badge-category">{o.category}</span>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {o.location?.city}
                          </div>
                        </td>
                        <td>{o.owner?.name}</td>
                        <td>
                          <span className={`badge ${o.verificationStatus === 'approved' ? 'badge-verified' : o.verificationStatus === 'pending' ? 'badge-pending' : 'badge-rejected'}`}>
                            {o.verificationStatus}
                          </span>
                        </td>
                        <td>
                          {o.submittedDocuments?.length > 0 ? (
                            <a
                              href={o.submittedDocuments[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--forest-800)', fontSize: '0.85rem', textDecoration: 'underline' }}
                            >
                              {o.submittedDocuments[0].title}
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>None</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrg(o);
                              setOrgDecision(o.verificationStatus === 'approved' ? 'rejected' : 'approved');
                              setOrgNotes(o.verificationNotes || '');
                              setOrgRejectionReason(o.rejectionReason || '');
                            }}
                            className="btn btn-outline btn-sm"
                          >
                            Review / Decision
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No organizations found.</p>
            )}
          </div>
        )}

        {/* TAB 3: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--forest-900)' }}>
              Registered Users & Roles
            </h3>

            {users.length > 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Verified Hours</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td><span className="badge badge-category">{u.role}</span></td>
                        <td>
                          <span className={`badge ${u.status === 'active' ? 'badge-verified' : 'badge-rejected'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>{u.verifiedStats?.hours || 0} hrs</td>
                        <td>
                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u._id, u.status)}
                              className="btn btn-outline btn-sm"
                              style={{ color: u.status === 'active' ? '#BE123C' : 'var(--verified-color)' }}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Restore'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No users found.</p>
            )}
          </div>
        )}

        {/* TAB 4: MODERATION REPORTS */}
        {activeTab === 'reports' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--forest-900)' }}>
              Moderation & Spam Reports
            </h3>

            {reports.length > 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reported Type</th>
                      <th>Reason</th>
                      <th>Details</th>
                      <th>Reporter</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r._id}>
                        <td><strong>{r.targetType?.toUpperCase()}</strong></td>
                        <td><span className="badge badge-rejected">{r.reason}</span></td>
                        <td style={{ maxWidth: 260, fontSize: '0.85rem' }}>{r.details || '—'}</td>
                        <td>{r.reporter?.name || r.reporter?.email}</td>
                        <td>
                          <span className={`badge ${r.status === 'pending' ? 'badge-pending' : 'badge-verified'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          {r.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => { setSelectedReport(r); setActionTakenNote(''); }}
                              className="btn btn-outline btn-sm"
                            >
                              Resolve / Dismiss
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No active moderation reports.</p>
            )}
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audits' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--forest-900)' }}>
              Administrative Governance Audit Ledger
            </h3>

            {auditLogs.length > 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Target Type</th>
                      <th>Admin Performer</th>
                      <th>IP Address</th>
                      <th>Details</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td><strong>{log.action}</strong></td>
                        <td>{log.targetType}</td>
                        <td>{log.admin?.name || log.admin?.email}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.ipAddress || '—'}</td>
                        <td style={{ fontSize: '0.8rem', maxWidth: 200, wordBreak: 'break-all' }}>
                          {JSON.stringify(log.details)}
                        </td>
                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No audit logs found.</p>
            )}
          </div>
        )}

        {/* Org Verification Decision Modal */}
        {selectedOrg && (
          <div className="modal-overlay" onClick={() => setSelectedOrg(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Review Organization: {selectedOrg.name}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedOrg(null)}
                  className="btn btn-outline btn-sm"
                  style={{ border: 'none', padding: '0.2rem' }}
                >
                  <IconX width={18} height={18} />
                </button>
              </div>

              <form onSubmit={handleOrgVerificationSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Verification Decision</label>
                    <select
                      className="select-field"
                      value={orgDecision}
                      onChange={(e) => setOrgDecision(e.target.value)}
                    >
                      <option value="approved">Approve Verification (Grants live publishing)</option>
                      <option value="rejected">Reject Verification</option>
                      <option value="pending">Mark as Pending Additional Info</option>
                    </select>
                  </div>

                  {orgDecision === 'rejected' ? (
                    <div className="form-group">
                      <label className="form-label">Rejection Reason</label>
                      <textarea
                        className="textarea-field"
                        value={orgRejectionReason}
                        onChange={(e) => setOrgRejectionReason(e.target.value)}
                        placeholder="State why credentials were insufficient..."
                        required
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Verification Audit Notes</label>
                      <textarea
                        className="textarea-field"
                        value={orgNotes}
                        onChange={(e) => setOrgNotes(e.target.value)}
                        placeholder="Document verified 80G, NGO Darpan, or registry certificate details..."
                      />
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setSelectedOrg(null)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Decision
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report Resolution Modal */}
        {selectedReport && (
          <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Moderate Report: {selectedReport.reason}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="btn btn-outline btn-sm"
                  style={{ border: 'none', padding: '0.2rem' }}
                >
                  <IconX width={18} height={18} />
                </button>
              </div>

              <form onSubmit={handleResolveReportSubmit}>
                <div className="modal-body">
                  <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Reported content type: <strong>{selectedReport.targetType}</strong>
                  </p>

                  <div className="form-group">
                    <label className="form-label">Action Outcome</label>
                    <select
                      className="select-field"
                      value={reportAction}
                      onChange={(e) => setReportAction(e.target.value)}
                    >
                      <option value="resolved">Resolved (Action taken, content sanitized/warned)</option>
                      <option value="dismissed">Dismissed (No violation found)</option>
                      <option value="reviewed">Reviewed (Flagged for ongoing monitoring)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Action Taken Notes</label>
                    <textarea
                      className="textarea-field"
                      value={actionTakenNote}
                      onChange={(e) => setActionTakenNote(e.target.value)}
                      placeholder="Describe administrative moderation resolution..."
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setSelectedReport(null)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Submit Resolution
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
