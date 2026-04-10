import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminNav from '../components/AdminNav';

// ── Axios instance ───────────────────────────────────────────────────────────
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
  const d   = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  const h   = d.getHours();
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} - ${pad(h % 12 || 12)}:${pad(d.getMinutes())} ${h >= 12 ? 'PM' : 'AM'}`;
};

// ✅ PRIMARY KEY FIX: model uses backup_id not id
const normaliseBackup = (raw) => {
  const id = raw.backup_id ?? raw.id;
  return {
    id,
    filename: raw.file_name ?? `backup_${id}`,
    type:     TYPE_LABEL_MAP[raw.backup_type] ?? 'Database',
    size:     formatBytes(raw.backup_size),
    date:     formatDate(raw.created_at),
    status:   raw.status === 'completed' ? 'Complete' : (raw.status ?? 'Unknown'),
  };
};

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ lg = false }) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin ${lg ? 'w-6 h-6' : 'w-3.5 h-3.5'}`}
    />
  );
}

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
    if (key === 'restore') { fileInputRef.current?.click(); return; }
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
    if (!b.id) {
      showToast('Cannot download — backup ID is missing', 'error');
      return;
    }
    showToast(`↓ Preparing download for ${b.filename}…`);
    try {
      const res = await api.get(`/admin/backups/${b.id}/download`, { responseType: 'blob' });

      const contentType = res.headers['content-type'] ?? '';
      if (contentType.includes('application/json')) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        showToast(json.message ?? 'Download failed', 'error');
        return;
      }

      const url  = URL.createObjectURL(res.data);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = b.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          showToast(json.message ?? 'Download failed', 'error');
        } catch {
          showToast('Download failed', 'error');
        }
      } else {
        showToast(err.response?.data?.message ?? 'Network error – download failed', 'error');
      }
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
    <div className="flex min-h-screen w-full bg-[#eaf2ed]">
      <AdminNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 min-w-0 flex-col bg-[#eaf2ed] overflow-y-auto">

        {/* ── Mobile top bar ── */}
        <div className="flex md:hidden items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            className="bg-transparent border-none text-xl cursor-pointer text-gray-700 flex items-center justify-center p-1 flex-shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">💾</span>
            <span className="font-bold text-[15px] text-gray-900" style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}>
              Backup &amp; Recovery
            </span>
          </div>
        </div>

        <div className="flex-1 px-10 pt-8 pb-16 w-full box-border text-[#1e1e1e] max-lg:px-6 max-md:px-3 max-md:pt-4">

          {/* ── Desktop page header ── */}
          <div className="hidden md:flex items-start justify-between gap-4 mb-7 flex-wrap">
            <div>
              <h2 className="font-semibold text-2xl text-black m-0 mb-1 leading-tight" style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}>
                Backup &amp; Recovery
              </h2>
              <p className="text-sm text-[#6b6a6a] m-0" style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}>
                Manage database and file backups
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 h-[38px] px-[18px] rounded-full border border-[#cac4d0] bg-transparent text-[13px] font-medium text-[#49454f] cursor-pointer transition-colors whitespace-nowrap hover:bg-[#f3f0f6]"
              style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}
              onClick={handleRefresh}
              aria-label="Refresh backup data"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          </div>

          {/* ── Backup action cards ── */}
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            {backupCards.map((card) => (
              <div
                key={card.key}
                className="bg-white border border-[#c2c2c2] rounded-[15px] p-7 flex flex-col gap-1.5 transition-shadow hover:shadow-md"
              >
                <div className="w-9 h-9 flex items-center justify-center bg-[#eff6ff] rounded-lg mb-1 flex-shrink-0">
                  {card.icon}
                </div>
                <h3 className="font-semibold text-sm text-[#111111] m-0" style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}>
                  {card.title}
                </h3>
                <p className="text-xs text-[#6b6a6a] m-0 mb-2.5 leading-snug" style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}>
                  {card.desc}
                </p>
                <button
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 border-none rounded-md bg-transparent text-[13px] font-medium text-[#1458b8] cursor-pointer transition-colors self-start mt-auto hover:bg-[#eff6ff] disabled:opacity-65 disabled:cursor-not-allowed"
                  onClick={() => handleRunNow(card.key)}
                  disabled={runningKey === card.key || (card.key === 'restore' && restoring)}
                  aria-label={`Run ${card.title}`}
                >
                  {(runningKey === card.key || (card.key === 'restore' && restoring)) ? (
                    <Spinner />
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
            className="hidden"
            onChange={handleFileRestore}
          />

          {/* ── Backup history ── */}
          <div className="bg-white border border-[#c2c2c2] rounded-[15px] overflow-hidden">
            <h3
              className="font-normal text-[13px] text-black m-0 px-4 py-2.5 border-b border-[#c2c2c2] bg-white"
              style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}
            >
              Backup History
            </h3>
            <div className="w-full overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-10 text-[13px] text-gray-500">
                  <Spinner lg />
                  <span>Loading backups…</span>
                </div>
              ) : (
                <table className="w-full border-collapse text-sm min-w-[600px]" style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}>
                  <thead>
                    <tr className="bg-[#e6e6e6] border-b border-[#c2c2c2]">
                      {['Filename', 'Type', 'Size', 'Date', 'Status', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className={`px-4 py-2.5 font-normal text-[13px] text-black text-left whitespace-nowrap ${h === 'Actions' ? 'text-center' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((b) => {
                      const tc = TYPE_COLORS[b.type] ?? TYPE_COLORS.Database;
                      return (
                        <tr key={b.id} className="border-b border-[#c2c2c2] last:border-b-0 transition-colors hover:bg-[#f5faf7]">
                          <td className="px-4 py-[9px] align-middle text-[#696868] text-[13px] font-normal">{b.filename}</td>
                          <td className="px-4 py-[9px] align-middle">
                            <span
                              className="inline-flex items-center justify-center px-3 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap"
                              style={{ background: tc.bg, borderColor: tc.border, color: tc.text }}
                            >
                              {b.type}
                            </span>
                          </td>
                          <td className="px-4 py-[9px] align-middle text-[#696868] text-[13px]">{b.size}</td>
                          <td className="px-4 py-[9px] align-middle text-[#696868] text-[13px] whitespace-nowrap">{b.date}</td>
                          <td className="px-4 py-[9px] align-middle">
                            <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full border border-[#baeada] bg-[#e4f6f0] text-xs font-medium text-emerald-600 whitespace-nowrap">
                              ● {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-[9px] align-middle text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                className="w-7 h-7 rounded-md flex items-center justify-center border-none cursor-pointer transition-colors bg-[#eff6ff] text-blue-600 hover:bg-[#dbeafe]"
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
                                className="w-7 h-7 rounded-md flex items-center justify-center border-none cursor-pointer transition-colors bg-[#fef2f2] text-red-500 hover:bg-[#fee2e2]"
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
                        <td colSpan={6} className="text-center py-8 text-[#aaaaaa] text-[13px]">
                          No backup records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      {deleteTarget !== null && (
        <div
          className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl px-7 pt-8 pb-6 w-full max-w-[380px] shadow-2xl flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 text-2xl">
              🗑️
            </div>
            <h3 className="font-semibold text-[17px] text-[#111111] m-0 mb-2.5" style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}>
              Delete Backup?
            </h3>
            <p className="text-[13px] text-[#666666] leading-relaxed m-0 mb-6" style={{ fontFamily: 'Inter, Helvetica, sans-serif' }}>
              This backup file will be permanently removed and cannot be recovered. Are you sure?
            </p>
            <div className="flex gap-2.5 w-full">
              <button
                className="flex-1 h-[38px] rounded-lg bg-transparent border border-[#cccccc] text-[#333333] text-[13px] font-medium cursor-pointer hover:bg-[#f5f5f5]"
                style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 h-[38px] rounded-lg bg-red-500 text-white text-[13px] font-medium cursor-pointer border-none hover:opacity-85"
                style={{ fontFamily: 'Poppins, Helvetica, sans-serif' }}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastMsg && (
        <div
          className={`fixed bottom-7 left-1/2 -translate-x-1/2 text-white text-[13px] px-[22px] py-2.5 rounded-full shadow-lg z-[300] whitespace-nowrap ${
            toastType === 'error' ? 'bg-red-600' : 'bg-[#111827]'
          }`}
          style={{ fontFamily: 'Inter, Helvetica, sans-serif' }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}