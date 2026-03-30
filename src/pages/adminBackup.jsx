import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminNav from '../components/AdminNav';
import '../style/adminBackup.css';

// ── Axios instance (same pattern as your other admin pages) ─────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// ── Constants ────────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  Database: { bg: '#daf5ff', border: '#b9cff8', text: '#2563eb' },
  Files:    { bg: '#fef3c7', border: '#fde68a', text: '#d97706' },
  Full:     { bg: '#ede9fe', border: '#ddd6fe', text: '#7c3aed' },
};

const BACKUP_TYPE_MAP = {
  full:     3,
  database: 1,
  files:    2,
};

const TYPE_LABEL_MAP = {
  1: 'Database',
  2: 'Files',
  3: 'Full',
};

const backupCards = [
  {
    key: 'full',
    title: 'Full Backup',
    desc: 'Database + Uploaded files',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#155dfc" strokeWidth="1.8">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    key: 'database',
    title: 'Database Only',
    desc: 'SQL dump of all tables',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#155dfc" strokeWidth="1.8">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.657-4.03 3-9 3S3 13.657 3 12"/>
        <path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/>
      </svg>
    ),
  },
  {
    key: 'files',
    title: 'Files Only',
    desc: 'Uploaded images & documents',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#155dfc" strokeWidth="1.8">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    key: 'restore',
    title: 'Upload & Restore',
    desc: 'Restore from a backup file',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#155dfc" strokeWidth="1.8">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDate = (isoString) => {
  if (!isoString) return '—';
  const d    = new Date(isoString);
  const pad  = (n) => String(n).padStart(2, '0');
  const h    = d.getHours();
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} - ${pad(h % 12 || 12)}:${pad(d.getMinutes())} ${h >= 12 ? 'PM' : 'AM'}`;
};

const normaliseBackup = (raw) => ({
  id:       raw.id,
  filename: raw.file_name ?? `backup_${raw.id}`,
  type:     TYPE_LABEL_MAP[raw.backup_type] ?? 'Database',
  size:     formatBytes(raw.backup_size),
  date:     formatDate(raw.created_at),
  status:   raw.status === 'completed' ? 'Complete' : (raw.status ?? 'Unknown'),
});

// ── Component ────────────────────────────────────────────────────────────────
export default function AdminBackup() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [backups,      setBackups]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [runningKey,   setRunningKey]   = useState(null);
  const [restoring,    setRestoring]    = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastType,    setToastType]    = useState('success');
  const fileInputRef = useRef(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 3500);
  }, []);

  // ── Fetch history ──────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/admin/backups');
      if (res.data.status === 'success') {
        setBackups((res.data.data ?? []).map(normaliseBackup));
      } else {
        showToast(res.data.message ?? 'Failed to load backups', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Network error – could not load backup history', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Run backup ─────────────────────────────────────────────────────────────
  const handleRunNow = async (key) => {
    if (key === 'restore') {
      fileInputRef.current?.click();
      return;
    }
    setRunningKey(key);
    try {
      const res = await api.post('/admin/backups/run', { backup_type: BACKUP_TYPE_MAP[key] });
      if (res.data.status === 'success') {
        const newBackup = normaliseBackup(res.data.data);
        setBackups((prev) => [newBackup, ...prev]);
        showToast(`✓ ${newBackup.type} backup completed successfully`);
      } else {
        const msg = typeof res.data.message === 'object'
          ? Object.values(res.data.message).flat().join(' ')
          : (res.data.message ?? 'Backup failed');
        showToast(msg, 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Network error – backup could not be started';
      showToast(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg, 'error');
    } finally {
      setRunningKey(null);
    }
  };

  // ── Upload & Restore ───────────────────────────────────────────────────────
  const handleFileRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append('backup_file', file);
      const res = await api.post('/admin/backups/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'success') {
        showToast(`✓ Restore from "${file.name}" completed successfully`);
        fetchHistory(true);
      } else {
        const msg = typeof res.data.message === 'object'
          ? Object.values(res.data.message).flat().join(' ')
          : (res.data.message ?? 'Restore failed');
        showToast(msg, 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Network error – restore could not be completed', 'error');
    } finally {
      setRestoring(false);
    }
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = async (b) => {
    showToast(`↓ Preparing download for ${b.filename}…`);
    try {
      const res = await api.get(`/admin/backups/${b.id}/download`, { responseType: 'blob' });
      const url  = URL.createObjectURL(res.data);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = b.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Network error – download failed', 'error');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    const targetId = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await api.delete(`/admin/backups/${targetId}`);
      if (res.data.status === 'success') {
        setBackups((prev) => prev.filter((b) => b.id !== targetId));
        showToast('Backup deleted successfully');
      } else {
        showToast(res.data.message ?? 'Delete failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Network error – delete failed', 'error');
    }
  };

  // ── Refresh ────────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    fetchHistory();
    showToast('✓ Backup list refreshed');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="br-layout">
      <AdminNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="br-body">

        {/* Mobile top bar */}
        <div className="br-topbar">
          <button className="br-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">☰</button>
          <div className="br-topbar__heading">
            <span className="br-topbar__icon">💾</span>
            <span className="br-topbar__label">Backup &amp; Recovery</span>
          </div>
        </div>

        <div className="br-page">

          {/* Desktop header */}
          <div className="br-page-header">
            <div>
              <h2 className="br-page-header__title">Backup &amp; Recovery</h2>
              <p className="br-page-header__sub">Manage database and file backups</p>
            </div>
            <button className="br-refresh-btn" onClick={handleRefresh} aria-label="Refresh backup data">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          </div>

          {/* Backup Action Cards */}
          <div className="br-cards">
            {backupCards.map((card) => (
              <div key={card.key} className="br-card">
                <div className="br-card__icon">{card.icon}</div>
                <h3 className="br-card__title">{card.title}</h3>
                <p className="br-card__desc">{card.desc}</p>
                <button
                  className="br-run-btn"
                  onClick={() => handleRunNow(card.key)}
                  disabled={runningKey === card.key || (card.key === 'restore' && restoring)}
                  aria-label={`Run ${card.title}`}
                >
                  {(runningKey === card.key || (card.key === 'restore' && restoring)) ? (
                    <span className="br-spinner" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  )}
                  {runningKey === card.key
                    ? 'Running…'
                    : (card.key === 'restore' && restoring)
                      ? 'Restoring…'
                      : 'Run Now'}
                </button>
              </div>
            ))}
          </div>

          {/* Hidden file input for restore */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.zip,.tar,.gz"
            style={{ display: 'none' }}
            onChange={handleFileRestore}
          />

          {/* Backup History */}
          <div className="br-history">
            <h3 className="br-history__title">Backup History</h3>
            <div className="br-table-wrap">
              {loading ? (
                <div className="br-loading">
                  <span className="br-spinner br-spinner--lg" />
                  <span>Loading backups…</span>
                </div>
              ) : (
                <table className="br-table">
                  <thead>
                    <tr>
                      <th className="br-th">Filename</th>
                      <th className="br-th">Type</th>
                      <th className="br-th">Size</th>
                      <th className="br-th">Date</th>
                      <th className="br-th">Status</th>
                      <th className="br-th br-th--actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((b) => {
                      const tc = TYPE_COLORS[b.type] ?? TYPE_COLORS.Database;
                      return (
                        <tr key={b.id} className="br-row">
                          <td className="br-td br-td--name">{b.filename}</td>
                          <td className="br-td">
                            <span
                              className="br-type-badge"
                              style={{ background: tc.bg, borderColor: tc.border, color: tc.text }}
                            >
                              {b.type}
                            </span>
                          </td>
                          <td className="br-td">{b.size}</td>
                          <td className="br-td br-td--date">{b.date}</td>
                          <td className="br-td">
                            <span className="br-status-badge">● {b.status}</span>
                          </td>
                          <td className="br-td br-td--actions">
                            <div className="br-action-btns">
                              <button
                                className="br-action-btn br-action-btn--dl"
                                onClick={() => handleDownload(b)}
                                title="Download"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                  <polyline points="7 10 12 15 17 10"/>
                                  <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                              </button>
                              <button
                                className="br-action-btn br-action-btn--del"
                                onClick={() => setDeleteTarget(b.id)}
                                title="Delete"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                  <path d="M10 11v6M14 11v6"/>
                                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {backups.length === 0 && (
                      <tr>
                        <td colSpan={6} className="br-empty">No backup records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteTarget !== null && (
        <div className="br-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="br-modal" onClick={(e) => e.stopPropagation()}>
            <div className="br-modal__icon-wrap">
              <span className="br-modal__icon">🗑️</span>
            </div>
            <h3 className="br-modal__title">Delete Backup?</h3>
            <p className="br-modal__body">
              This backup file will be permanently removed and cannot be recovered. Are you sure?
            </p>
            <div className="br-modal__actions">
              <button className="br-modal-btn br-modal-btn--outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="br-modal-btn br-modal-btn--danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className={`br-toast ${toastType === 'error' ? 'br-toast--error' : ''}`}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}