import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminNav from "../components/AdminNav";

// ── Axios base config ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/admin", // ← change to your Laravel API URL
  withCredentials: true,                 // sends cookies / session
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// ── Status display config ──────────────────────────────────────────────────────
const statusConfig = {
  pending: { bg: "#DAF5FF", border: "#B9CFF8", color: "#2563EB", label: "New" },
  read:    { bg: "#FAF1E3", border: "#F8E1BC", color: "#D97706", label: "Replied" },
  replied: { bg: "#E4F6F0", border: "#BAEADA", color: "#059669", label: "Resolved" },
};

const TAB_MAP = {
  All:      null,
  New:      "pending",
  Replied:  "read",
  Resolved: "replied",
  Live:     null,
};

// ── Reply Modal ────────────────────────────────────────────────────────────────
function ReplyModal({ contact, onClose, onReplied }) {
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  console.log(contact)

  const handleSend = async () => {
    if (!replyMessage.trim()) return;
    setSending(true);
    setError("");
    try {
      await api.post(`/contacts/${contact.message_id}/reply`, { reply_message: replyMessage });
      onReplied(contact.message_id);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
    }}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "28px 28px 24px",
        width: "min(520px,90vw)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#111827" }}>
          Reply to {contact.first_name} {contact.last_name}
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6B7280" }}>
          {contact.email}
        </p>

        {/* Original message */}
        <div style={{
          background: "#F9FAFB", border: "1px solid #E5E7EB",
          borderRadius: "8px", padding: "12px 14px", marginBottom: "14px",
          fontSize: "13px", color: "#374151",
        }}>
          <strong>Original:</strong> {contact.message}
        </div>

        <textarea
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Type your reply here…"
          rows={5}
          style={{
            width: "100%", boxSizing: "border-box", borderRadius: "8px",
            border: "1px solid #D1D5DB", padding: "10px 12px",
            fontSize: "13px", resize: "vertical", outline: "none",
            fontFamily: "inherit",
          }}
        />

        {error && (
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#DC2626" }}>{error}</p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "14px" }}>
          <button onClick={onClose} style={{
            padding: "7px 18px", borderRadius: "7px",
            border: "1px solid #D1D5DB", background: "#fff",
            color: "#374151", fontSize: "13px", cursor: "pointer",
          }}>Cancel</button>
          <button onClick={handleSend} disabled={sending || !replyMessage.trim()} style={{
            padding: "7px 18px", borderRadius: "7px",
            border: "none", background: sending ? "#93C5FD" : "#155DFC",
            color: "#fff", fontSize: "13px", fontWeight: 600, cursor: sending ? "not-allowed" : "pointer",
          }}>
            {sending ? "Sending…" : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminContactMessages() {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [activeTab, setActiveTab]       = useState("All");
  const [messages, setMessages]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [replyTarget, setReplyTarget]   = useState(null);
  const [deletingId, setDeletingId]     = useState(null);

  // ── Fetch all contacts ──────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/contacts");
      setMessages(res.data.data ?? []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/contacts/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── After reply sent, mark as replied locally ───────────────────────────────
  const handleReplied = (id) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "replied" } : m))
    );
  };

  // ── Tab counts ──────────────────────────────────────────────────────────────
  const countFor = (key) => {
    if (key === "All" || key === "Live") return messages.length;
    return messages.filter((m) => m.status === TAB_MAP[key]).length;
  };

  const tabs = ["All", "New", "Replied", "Resolved", "Live"].map((k) => ({
    key: k, label: k, count: k !== "Live" ? countFor(k) : null,
  }));

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered =
    activeTab === "All" || activeTab === "Live"
      ? messages
      : messages.filter((m) => m.status === TAB_MAP[activeTab]);

  return (
    <>
      <style>{`
        @media (min-width: 768px) { .acm-burger { display: none !important; } }
        @media (max-width: 767px)  { .acm-burger { display: inline !important; } }
      `}</style>

      {replyTarget && (
        <ReplyModal
          contact={replyTarget}
          onClose={() => setReplyTarget(null)}
          onReplied={handleReplied}
        />
      )}

      <div style={{
        display: "flex", minHeight: "100vh", background: "#EAF2ED",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <AdminNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main style={{ flex: 1, padding: "28px 24px", overflowX: "hidden", minWidth: 0 }}>

          {/* ── Top bar ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <button
              className="acm-burger"
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "none", background: "none", border: "none",
                fontSize: "22px", cursor: "pointer", color: "#374151",
                padding: "4px 8px", borderRadius: "6px",
              }}
            >☰</button>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0 }}>
                Contact Messages
              </h1>
              <p style={{ fontSize: "13px", color: "#6B6A6A", margin: "4px 0 0" }}>
                View and respond to messages from customers
              </p>
            </div>
            {/* Refresh button */}
            <button
              onClick={fetchMessages}
              style={{
                marginLeft: "auto", padding: "6px 14px", borderRadius: "8px",
                border: "1px solid #D1D5DB", background: "#fff",
                color: "#374151", fontSize: "12px", cursor: "pointer",
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {/* ── Filter Tabs ── */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "6px 14px", borderRadius: "20px",
                    border: isActive ? "1px solid #155DFC" : "1px solid #D1D5DB",
                    background: isActive ? "#155DFC" : "rgba(0,0,0,0.05)",
                    color: isActive ? "#fff" : "#374151",
                    fontSize: "13px", fontWeight: 500,
                    cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}{tab.count !== null ? ` (${tab.count})` : ""}
                </button>
              );
            })}
          </div>

          {/* ── Loading / Error ── */}
          {loading && (
            <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF", fontSize: "14px" }}>
              Loading messages…
            </div>
          )}

          {error && !loading && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FCA5A5",
              borderRadius: "10px", padding: "14px 18px",
              color: "#DC2626", fontSize: "13px", marginBottom: "16px",
            }}>
              ⚠️ {error}
              <button onClick={fetchMessages} style={{
                marginLeft: "12px", padding: "3px 10px", borderRadius: "6px",
                border: "1px solid #FCA5A5", background: "#fff",
                color: "#DC2626", fontSize: "12px", cursor: "pointer",
              }}>Retry</button>
            </div>
          )}

          {/* ── Message Cards ── */}
          {!loading && !error && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((msg) => {
                const cfg = statusConfig[msg.status] ?? statusConfig.pending;
                return (
                  <div
                    key={msg.id}
                    style={{
                      background: "#fff", borderRadius: "14px",
                      padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      display: "flex", alignItems: "flex-start", gap: "16px",
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "50%",
                      background: "#E8E8E8", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "20px", flexShrink: 0,
                    }}>✉️</div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: "flex", alignItems: "center",
                        gap: "8px", flexWrap: "wrap", marginBottom: "4px",
                      }}>
                        <span style={{ fontWeight: 600, fontSize: "14px", color: "#111827" }}>
                          {msg.first_name} {msg.last_name}
                        </span>
                        <span style={{ fontSize: "13px", color: "#787878" }}>
                          ({msg.email})
                        </span>
                        <span style={{
                          padding: "3px 10px", borderRadius: "20px",
                          fontSize: "12px", fontWeight: 600,
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          color: cfg.color, whiteSpace: "nowrap",
                        }}>
                          {cfg.label}
                        </span>
                      </div>

                      {msg.phone_number && (
                        <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "3px" }}>
                          📞 {msg.phone_number}
                        </div>
                      )}

                      <div style={{
                        fontSize: "13px", color: "#666565",
                        whiteSpace: "nowrap", overflow: "hidden",
                        textOverflow: "ellipsis", maxWidth: "600px",
                      }}>
                        {msg.message}
                      </div>
                    </div>

                    {/* Date + Actions */}
                    <div style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "flex-end", gap: "10px", flexShrink: 0,
                    }}>
                      <span style={{ fontSize: "12px", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setReplyTarget(msg)}
                          style={{
                            padding: "5px 14px", borderRadius: "6px",
                            border: "1px solid #D1D5DB", background: "#fff",
                            color: "#374151", fontSize: "12px", fontWeight: 500, cursor: "pointer",
                          }}
                        >Reply</button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          disabled={deletingId === msg.id}
                          style={{
                            padding: "5px 10px", borderRadius: "6px",
                            border: "1px solid #FCA5A5", background: "#FEF2F2",
                            color: "#DC2626", fontSize: "13px",
                            cursor: deletingId === msg.id ? "not-allowed" : "pointer",
                            opacity: deletingId === msg.id ? 0.6 : 1,
                          }}
                        >🗑</button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div style={{
                  background: "#fff", borderRadius: "14px", padding: "40px",
                  textAlign: "center", color: "#9CA3AF", fontSize: "14px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}>
                  No messages found.
                </div>
              )}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && !error && (
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginTop: "20px",
              fontSize: "12px", color: "#9CA3AF",
            }}>
              <span>
                Showing {filtered.length} message{filtered.length !== 1 ? "s" : ""}
              </span>
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

        </main>
      </div>
    </>
  );
}