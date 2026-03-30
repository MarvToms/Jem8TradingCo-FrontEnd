import { useState, useEffect, useCallback } from "react";
import AdminNav from "../components/AdminNav";
import api from "../api/axios";


async function apiFetch(path, options = {}) {
  const method = (options.method ?? "GET").toLowerCase();
  const { data } = await api[method](path, options.body ? JSON.parse(options.body) : undefined);
  return data;
}

// ── Badge styles per category ─────────────────────────────────────────────────
const badgeMap = {
  orders:   "bg-blue-50 text-blue-600 border-blue-200",
  stock:    "bg-green-50 text-green-700 border-green-200",
  blogs:    "bg-orange-50 text-orange-700 border-orange-200",
  backups:  "bg-violet-50 text-violet-700 border-violet-200",
  payments: "bg-emerald-50 text-emerald-600 border-emerald-200",
  account:  "bg-rose-50 text-rose-600 border-rose-200",
  other:    "bg-gray-50 text-gray-600 border-gray-200",
};

// ── Category → icon mapping ───────────────────────────────────────────────────
const iconMap = {
  orders:   "🛒",
  stock:    "📦",
  blogs:    "📝",
  backups:  "💾",
  payments: "💳",
  account:  "👤",
  other:    "📋",
};

const TABS = ["All", "Orders", "Stock", "Account", "Blogs", "Payments", "Backups"];

// Map tab label → API category key
const tabToCategory = {
  All:      "all",
  Orders:   "orders",
  Stock:    "stock",
  Account:  "account",
  Blogs:    "blogs",
  Payments: "payments",
  Backups:  "backups",
};

// ── Build a readable badge label from a log entry ────────────────────────────
function buildBadge(log) {
  if (log.product_unique_code) return log.product_unique_code.toUpperCase();
  if (log.reference_table && log.reference_id)
    return `${log.reference_table.toUpperCase()} - ${String(log.reference_id).padStart(3, "0")}`;
  return log.category?.toUpperCase() ?? "LOG";
}

export default function AdminActivityLog() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab,   setActiveTab]   = useState("All");
  const [search,      setSearch]      = useState("");
  const [grouped,     setGrouped]     = useState({});
  const [pagination,  setPagination]  = useState(null);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  // Delete states
  const [deleteId,      setDeleteId]      = useState(null);   // single log id
  const [deletingAll,   setDeletingAll]   = useState(false);  // confirm clear-all modal
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch logs ──────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/activity-logs", {
        params: {
          page,
          category: tabToCategory[activeTab] ?? "all",
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      });

      const resData = res.data;
      if (resData.status === "success") {
        setGrouped(resData.data.grouped ?? {});
        setPagination(resData.data.pagination ?? null);
      }
    } catch (err) {
      setError(err.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  // Re-fetch on filter / tab / page change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  // ── Delete single log ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/activity-logs/${deleteId}`);
      setDeleteId(null);
      fetchLogs();
    } catch (err) {
      alert(`Delete failed: ${err.response?.data?.message ?? err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete all (filtered by category) ──────────────────────────────────────
  const handleDeleteAll = async () => {
    setActionLoading(true);
    try {
      const category = tabToCategory[activeTab] ?? "all";
      await api.delete(`/admin/activity-logs`, { params: { category } });
      setDeletingAll(false);
      fetchLogs();
    } catch (err) {
      alert(`Clear failed: ${err.response?.data?.message ?? err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const totalLogs = Object.values(grouped).reduce((a, arr) => a + arr.length, 0);

  return (
    <>
      <style>{`
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn   { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div className="flex min-h-screen bg-[#F0F7F2] font-sans text-slate-900">
        <AdminNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 min-w-0 px-7 py-7 pb-12 overflow-x-hidden max-md:px-4 max-md:py-5">

          {/* ── Top Bar ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3.5">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden bg-white border border-gray-200 text-base cursor-pointer text-slate-500 px-2.5 py-1.5 rounded-md shadow-sm hover:bg-gray-50 hover:text-slate-900 transition-all"
              >
                ☰
              </button>
              <h1 className="text-xl font-bold text-slate-900 m-0 tracking-tight">Activity Log</h1>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Activity..."
                  className="py-2 pl-8 pr-4 rounded-lg border border-gray-200 text-sm font-[inherit] text-slate-900 outline-none bg-white w-60 shadow-sm placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/8 transition-all max-md:w-40"
                />
              </div>

              {/* Clear All button */}
              <button
                onClick={() => setDeletingAll(true)}
                className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-sm font-semibold text-red-500 cursor-pointer whitespace-nowrap hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
              >
                🗑 Clear {activeTab !== "All" ? activeTab : "All"}
              </button>
            </div>
          </div>

          {/* ── Tabs ────────────────────────────────────────────────────────── */}
          <div className="flex gap-2 flex-wrap mb-7">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg border text-sm font-[inherit] cursor-pointer shadow-sm transition-all
                  ${activeTab === tab
                    ? "bg-slate-900 text-white border-slate-900 font-semibold"
                    : "bg-white text-slate-500 border-gray-200 font-medium hover:bg-gray-50 hover:text-slate-900 hover:border-slate-300"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── States: loading / error / empty ─────────────────────────────── */}
          {loading && (
            <div className="text-center text-slate-400 text-sm py-16 animate-pulse">
              Loading activity logs…
            </div>
          )}

          {!loading && error && (
            <div className="text-center text-red-400 text-sm py-16">
              ⚠️ {error}
              <button
                onClick={fetchLogs}
                className="ml-3 underline text-blue-500 hover:text-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && totalLogs === 0 && (
            <div className="text-center text-slate-400 text-sm py-16">
              No activity found.
            </div>
          )}

          {/* ── Grouped Logs ─────────────────────────────────────────────────── */}
          {!loading && !error && totalLogs > 0 && (
            <div className="flex flex-col gap-6">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  {/* Date Divider */}
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <span className="text-sm font-semibold text-slate-500 whitespace-nowrap tracking-tight">
                      {group}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Log Items */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {items.map((log) => {
                      const cat       = log.category ?? "other";
                      const badge     = buildBadge(log);
                      const badgeStyle = badgeMap[cat] ?? badgeMap.other;
                      const icon      = iconMap[cat]  ?? "📋";
                      const amountStr = log.amount ? ` · $${Number(log.amount).toFixed(2)}` : "";

                      return (
                        <div
                          key={log.id}
                          className="flex items-start justify-between px-5 py-4 border-b border-slate-50 last:border-b-0 hover:bg-[#F8FBFF] transition-colors gap-4 max-md:flex-col max-md:gap-3"
                        >
                          {/* Left */}
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {/* Icon */}
                            <div className="w-[38px] h-[38px] rounded-lg bg-gray-50 border border-slate-100 flex items-center justify-center text-lg shrink-0">
                              {icon}
                            </div>

                            {/* Info */}
                            <div className="flex flex-col gap-1 min-w-0">
                              {/* Top row */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">{log.user_name}</span>
                                <span className="text-xs text-slate-400 font-medium capitalize">
                                  ({log.role ?? "user"})
                                </span>
                                <span className="text-sm text-slate-500">{log.action}</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono border ${badgeStyle}`}>
                                  {badge}{amountStr}
                                </span>
                                {log.mode_of_payment && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-slate-50 text-slate-500 border-slate-200">
                                    via {log.mode_of_payment}
                                  </span>
                                )}
                              </div>

                              {/* Description */}
                              {log.description && (
                                <div className="text-xs text-slate-500">{log.description}</div>
                              )}

                              {/* Meta */}
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-slate-400 font-mono">{log.logged_at}</span>
                                <span className="inline-flex items-center px-2 py-px rounded bg-gray-50 border border-gray-200 text-[10px] font-bold text-slate-400 tracking-wide uppercase">
                                  {cat}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right */}
                          <div className="flex flex-col items-end gap-2.5 shrink-0 max-md:flex-row max-md:items-center max-md:w-full max-md:justify-between">
                            <span className="text-xs font-medium text-slate-400 font-mono whitespace-nowrap">
                              {log.logged_at_time}
                            </span>
                            <button
                              onClick={() => setDeleteId(log.id)}
                              className="px-3.5 py-1 rounded-md border border-red-200 bg-red-50 text-xs font-semibold text-red-500 cursor-pointer whitespace-nowrap hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* ── Pagination ─────────────────────────────────────────────── */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-slate-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-slate-400 font-mono">
                    {pagination.current_page} / {pagination.last_page}
                  </span>
                  <button
                    disabled={page >= pagination.last_page}
                    onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                    className="px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-slate-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Delete Single Confirm Modal ─────────────────────────────────────── */}
      {deleteId && (
        <div
          onClick={() => !actionLoading && setDeleteId(null)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-5"
          style={{ animation: "overlayIn 0.2s ease" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[18px] p-8 w-full max-w-[360px] text-center shadow-[0_16px_48px_rgba(15,23,42,0.14),0_4px_16px_rgba(15,23,42,0.06)] border border-slate-100"
            style={{ animation: "modalIn 0.2s ease" }}
          >
            <span className="text-[40px] block mb-3.5">🗑️</span>
            <h3 className="text-base font-bold text-slate-900 m-0 mb-2 tracking-tight">
              Delete this activity?
            </h3>
            <p className="text-sm text-slate-400 m-0 mb-6 leading-relaxed">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-slate-500 cursor-pointer hover:bg-gray-50 hover:text-slate-900 transition-colors font-[inherit] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg border-none bg-red-500 text-sm font-semibold text-white cursor-pointer shadow-[0_2px_8px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(239,68,68,0.4)] transition-all font-[inherit] disabled:opacity-50"
              >
                {actionLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear All Confirm Modal ─────────────────────────────────────────── */}
      {deletingAll && (
        <div
          onClick={() => !actionLoading && setDeletingAll(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-5"
          style={{ animation: "overlayIn 0.2s ease" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[18px] p-8 w-full max-w-[380px] text-center shadow-[0_16px_48px_rgba(15,23,42,0.14),0_4px_16px_rgba(15,23,42,0.06)] border border-slate-100"
            style={{ animation: "modalIn 0.2s ease" }}
          >
            <span className="text-[40px] block mb-3.5">⚠️</span>
            <h3 className="text-base font-bold text-slate-900 m-0 mb-2 tracking-tight">
              Clear {activeTab !== "All" ? activeTab : "all"} logs?
            </h3>
            <p className="text-sm text-slate-400 m-0 mb-6 leading-relaxed">
              This will permanently delete{" "}
              <strong className="text-slate-600">
                {activeTab === "All" ? "every activity log" : `all ${activeTab} logs`}
              </strong>
              . This cannot be undone.
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => setDeletingAll(false)}
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-slate-500 cursor-pointer hover:bg-gray-50 hover:text-slate-900 transition-colors font-[inherit] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg border-none bg-red-500 text-sm font-semibold text-white cursor-pointer shadow-[0_2px_8px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(239,68,68,0.4)] transition-all font-[inherit] disabled:opacity-50"
              >
                {actionLoading ? "Clearing…" : "Yes, Clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}