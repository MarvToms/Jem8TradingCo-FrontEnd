import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminNav from "../components/AdminNav";

// ── Axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  processing: { label: "Processing", background: "#EDE9FE", color: "#7C3AED", border: "1px solid #C4B5FD" },
  ready:      { label: "Ready",      background: "#DBEAFE", color: "#1D4ED8", border: "1px solid #93C5FD" },
  on_the_way: { label: "On the way", background: "#FEF3C7", color: "#D97706", border: "1px solid #FCD34D" },
  delivered:  { label: "Delivered",  background: "#D1FAE5", color: "#059669", border: "1px solid #6EE7B7" },
};

const getStatusStyle = (status) =>
  STATUS_MAP[status] ?? { label: status ?? "—", background: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" };

const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";

// ── Status Update Modal ────────────────────────────────────────────────────────
function StatusModal({ delivery, onClose, onUpdated }) {
  const [status, setStatus]   = useState(delivery.status ?? "processing");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await api.patch(`/deliveries/${delivery.delivery_id}/status`, { status });
      onUpdated(res.data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
    }}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "28px",
        width: "min(420px,90vw)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#111827" }}>
          Update Delivery Status
        </h2>
        <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#6B7280" }}>
          Order #{delivery.checkout_id}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
          {Object.entries(STATUS_MAP).map(([key, cfg]) => (
            <label key={key} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", borderRadius: "8px", cursor: "pointer",
              border: status === key ? `2px solid ${cfg.color}` : "1px solid #E5E7EB",
              background: status === key ? cfg.background : "#fff",
            }}>
              <input
                type="radio" name="status" value={key}
                checked={status === key}
                onChange={() => setStatus(key)}
                style={{ accentColor: cfg.color }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
            </label>
          ))}
        </div>

        {error && <p style={{ color: "#DC2626", fontSize: "12px", margin: "0 0 10px" }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button onClick={onClose} style={{
            padding: "7px 18px", borderRadius: "7px",
            border: "1px solid #D1D5DB", background: "#fff",
            color: "#374151", fontSize: "13px", cursor: "pointer",
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "7px 18px", borderRadius: "7px",
            border: "none", background: saving ? "#93C5FD" : "#155DFC",
            color: "#fff", fontSize: "13px", fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
          }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deliveries, setDeliveries]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [searchTerm, setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalTarget, setModalTarget] = useState(null);

  // ── Fetch deliveries, then resolve any missing users ───────────────────────
  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = statusFilter !== "All" ? { status: statusFilter } : {};
      const res = await api.get("/deliveries", { params });
      const rawDeliveries = res.data.deliveries ?? [];

      // Collect unique user_ids where user object is null/missing
      const missingUserIds = [
        ...new Set(
          rawDeliveries
            .filter((d) => !d.checkout?.user && d.checkout?.user_id)
            .map((d) => d.checkout.user_id)
        ),
      ];

      // Fetch all missing users in parallel
      const userMap = {};
      await Promise.all(
        missingUserIds.map(async (id) => {
          try {
            const userRes = await api.get(`/showUser/${id}`);
            console.log(userRes)
            // Handle both { user: {...} } and plain {...} response shapes
            userMap[id] = userRes.data.data.user ?? userRes.data.data;
          } catch {
            userMap[id] = null; // keep null on failure, don't crash
          }
        })
      );

      // Merge fetched users back into deliveries
      const enriched = rawDeliveries.map((d) => {
        if (!d.checkout?.user && d.checkout?.user_id) {
          return {
            ...d,
            checkout: {
              ...d.checkout,
              user: userMap[d.checkout.user_id] ?? null,
            },
          };
        }
        return d;
      });

      setDeliveries(enriched);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  // ── After status update, patch locally ─────────────────────────────────────
  const handleUpdated = (updated) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.delivery_id === updated.delivery_id ? { ...d, status: updated.status } : d
      )
    );
  };

  // ── Summary stats from live data ────────────────────────────────────────────
  const totalRevenue = deliveries.reduce((sum, d) => sum + Number(d.checkout?.paid_amount ?? 0), 0);
  const count = (s) => deliveries.filter((d) => d.status === s).length;

  const summaryStats = [
    { label: "Orders",     value: deliveries.length,       icon: "🛒", color: "#EFF6FF", accent: "#2563EB" },
    { label: "Processing", value: count("processing"),     icon: "⚙️", color: "#F5F3FF", accent: "#7C3AED" },
    { label: "Ready",      value: count("ready"),          icon: "📦", color: "#DBEAFE", accent: "#1D4ED8" },
    { label: "On the way", value: count("on_the_way"),     icon: "⏳", color: "#FEF3C7", accent: "#D97706" },
    { label: "Delivered",  value: count("delivered"),      icon: "✅", color: "#ECFDF5", accent: "#059669" },
    { label: "Revenue",    value: `₱${fmt(totalRevenue)}`, icon: "💰", color: "#FFF7ED", accent: "#EA580C" },
  ];

  // ── Client-side search filter ───────────────────────────────────────────────
  const filtered = deliveries.filter((d) => {
    const user = d.checkout?.user;
    const name = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.toLowerCase();
    const checkoutId = String(d.checkout?.checkout_id ?? d.checkout_id ?? "").toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || checkoutId.includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <style>{`
        @media (min-width: 900px) {
          .ao-burger { display: none !important; }
          .ao-stats  { grid-template-columns: repeat(6, 1fr) !important; }
        }
        @media (max-width: 899px) {
          .ao-burger { display: inline !important; }
          .ao-stats  { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .ao-stats  { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {modalTarget && (
        <StatusModal
          delivery={modalTarget}
          onClose={() => setModalTarget(null)}
          onUpdated={handleUpdated}
        />
      )}

      <div style={{ display: "flex", minHeight: "100vh", background: "#F0F7F2", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <AdminNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main style={{ flex: 1, padding: "24px 20px", overflowX: "hidden", minWidth: 0 }}>

          {/* ── Top bar ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                className="ao-burger"
                onClick={() => setSidebarOpen(true)}
                style={{ display: "none", background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#374151", padding: "4px 8px", borderRadius: "6px" }}
              >☰</button>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0 }}>Orders</h1>
                <p style={{ fontSize: "13px", color: "#6B7280", margin: "3px 0 0" }}>Manage deliveries and order statuses</p>
              </div>
            </div>
            <button
              onClick={fetchDeliveries}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 18px", border: "1px solid #D1D5DB", borderRadius: "8px",
                background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 500, cursor: "pointer",
              }}
            >↻ Refresh</button>
          </div>

          {/* ── Summary Stats ── */}
          <div className="ao-stats" style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
            {summaryStats.map((s) => (
              <div key={s.label} style={{
                background: "#fff", borderRadius: "12px", padding: "16px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: s.accent }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>{s.label}</div>
                </div>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px",
                }}>{s.icon}</div>
              </div>
            ))}
          </div>

          {/* ── Table Card ── */}
          <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>

            {/* Search & Filter */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                border: "1px solid #E5E7EB", borderRadius: "7px",
                padding: "7px 12px", background: "#F9FAFB",
                flex: "1", minWidth: "160px", maxWidth: "320px",
              }}>
                <span style={{ color: "#9CA3AF" }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: "12px", width: "100%", color: "#374151" }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ border: "1px solid #E5E7EB", borderRadius: "7px", padding: "7px 12px", background: "#F9FAFB", fontSize: "12px", color: "#374151", cursor: "pointer", outline: "none" }}
              >
                <option value="All">All Status</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="on_the_way">On the way</option>
                <option value="delivered">Delivered</option>
              </select>
              <button
                onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}
                style={{ border: "1px solid #E5E7EB", borderRadius: "7px", padding: "7px 12px", background: "#fff", fontSize: "12px", color: "#374151", cursor: "pointer" }}
              >✕ Clear</button>
            </div>

            {/* Loading / Error */}
            {loading && (
              <div style={{ padding: "48px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>
                Loading orders…
              </div>
            )}

            {error && !loading && (
              <div style={{ margin: "16px 18px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "12px 16px", color: "#DC2626", fontSize: "13px" }}>
                ⚠️ {error}
                <button onClick={fetchDeliveries} style={{ marginLeft: "10px", padding: "3px 10px", borderRadius: "6px", border: "1px solid #FCA5A5", background: "#fff", color: "#DC2626", fontSize: "12px", cursor: "pointer" }}>
                  Retry
                </button>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                      {["Order ID", "Client", "Contact", "Payment", "Shipping Fee", "Total Paid", "Status", "Date", "Action"].map((h) => (
                        <th key={h} style={{
                          padding: "12px 14px", textAlign: "left", fontWeight: 600,
                          color: "#374151", whiteSpace: "nowrap", fontSize: "11px",
                          textTransform: "uppercase", letterSpacing: "0.04em",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d, index) => {
                      const user     = d.checkout?.user;
                      const checkout = d.checkout;
                      const cfg      = getStatusStyle(d.status);
                      return (
                        <tr key={d.delivery_id} style={{
                          borderBottom: "1px solid #F3F4F6",
                          background: index % 2 === 0 ? "#fff" : "#FAFAFA",
                        }}>
                          {/* Order ID */}
                          <td style={{ padding: "14px 14px", color: "#155DFC", fontWeight: 600, whiteSpace: "nowrap" }}>
                            #{checkout?.checkout_id ?? "—"}
                          </td>
                          {/* Client */}
                          <td style={{ padding: "14px 14px", color: "#111827", whiteSpace: "nowrap" }}>
                            {user ? `${user.first_name} ${user.last_name}` : "—"}
                          </td>
                          {/* Contact */}
                          <td style={{ padding: "14px 14px", color: "#6B7280", lineHeight: "1.6" }}>
                            <div>{user?.email ?? "—"}</div>
                            <div>{user?.phone_number ?? ""}</div>
                          </td>
                          {/* Payment */}
                          <td style={{ padding: "14px 14px", color: "#374151", whiteSpace: "nowrap", textTransform: "capitalize" }}>
                            {checkout?.payment_method ?? "—"}
                          </td>
                          {/* Shipping fee */}
                          <td style={{ padding: "14px 14px", color: "#374151", whiteSpace: "nowrap" }}>
                            ₱{fmt(checkout?.shipping_fee)}
                          </td>
                          {/* Total paid */}
                          <td style={{ padding: "14px 14px", color: "#111827", fontWeight: 600, whiteSpace: "nowrap" }}>
                            ₱{fmt(checkout?.paid_amount)}
                          </td>
                          {/* Status */}
                          <td style={{ padding: "14px 14px" }}>
                            <span style={{
                              ...cfg,
                              padding: "4px 10px", borderRadius: "20px",
                              fontSize: "11px", fontWeight: 600,
                              display: "inline-block", whiteSpace: "nowrap",
                            }}>
                              {cfg.label}
                            </span>
                          </td>
                          {/* Date */}
                          <td style={{ padding: "14px 14px", color: "#6B7280", whiteSpace: "nowrap" }}>
                            {fmtDate(checkout?.created_at)}
                          </td>
                          {/* Action */}
                          <td style={{ padding: "14px 14px" }}>
                            <button
                              onClick={() => setModalTarget(d)}
                              style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                padding: "6px 14px", borderRadius: "6px",
                                border: "1px solid #D1D5DB", background: "#fff",
                                color: "#374151", fontSize: "12px", fontWeight: 500,
                                cursor: "pointer", whiteSpace: "nowrap",
                              }}
                            >✏️ Update</button>
                          </td>
                        </tr>
                      );
                    })}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            {!loading && !error && (
              <div style={{ padding: "14px 20px", borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#9CA3AF" }}>
                <span>Showing {filtered.length} of {deliveries.length} orders</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[1, 2, 3].map((p) => (
                    <button key={p} style={{
                      width: "28px", height: "28px", borderRadius: "6px",
                      border: p === 1 ? "none" : "1px solid #E5E7EB",
                      background: p === 1 ? "#155DFC" : "#fff",
                      color: p === 1 ? "#fff" : "#374151",
                      fontSize: "12px", cursor: "pointer", fontWeight: 500,
                    }}>{p}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </main>
      </div>
    </>
  );
}