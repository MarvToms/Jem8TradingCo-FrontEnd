import { useEffect, useRef, useState } from "react";
import AdminNav from "../components/AdminNav";
import axios from "axios";

const BASE = "http://127.0.0.1:8000";

const CATEGORIES = ["All", "Announcement", "Travel Blog", "Business Trips", "Product Updates"];

const categoryMap = {
  All: "All Posts",
  Announcement: "Announcements",
  "Travel Blog": "Travel Blog",
  "Business Trips": "Business Trips",
  "Product Updates": "Product Updates",
};

// ─────────────────────────────────────────────────────────────
// Shared sub-components (matching AdminProducts style)
// ─────────────────────────────────────────────────────────────
const labelStyle = {
  display: "block", fontSize: "11px", fontWeight: 600, color: "#374151",
  marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em",
};
const inputStyle = {
  width: "100%", padding: "9px 11px", border: "1px solid #E2E8F0", borderRadius: "8px",
  fontSize: "13px", color: "#0F172A", background: "#fff", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};

function Overlay({ children, onClose, wide }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 1000, padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", width: "100%", maxWidth: wide ? "820px" : "580px",
          borderRadius: "16px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          maxHeight: "94vh", overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{
      padding: "20px 24px 16px", borderBottom: "1px solid #F1F5F9",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, background: "#fff", zIndex: 10,
      borderRadius: "16px 16px 0 0",
    }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0F172A" }}>{title}</h2>
        {subtitle && <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94A3B8" }}>{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        style={{
          width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #E2E8F0",
          background: "#F8FAFC", color: "#64748B", fontSize: "18px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
        }}
      >×</button>
    </div>
  );
}

function ImageUploadZone({ id, onChange, preview, onRemove, label }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ ...labelStyle, marginBottom: "8px" }}>{label ?? "Cover Image"}</label>
      <label
        htmlFor={id}
        style={{
          display: "block", border: "2px dashed #CBD5E1", borderRadius: "10px",
          padding: "18px", textAlign: "center", cursor: "pointer",
          background: "#F8FAFC", transition: "border-color 0.2s",
          marginBottom: preview ? "10px" : "0",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#155DFC")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#CBD5E1")}
      >
        {preview ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={preview}
              alt="preview"
              style={{ maxHeight: "160px", maxWidth: "100%", borderRadius: "8px", objectFit: "cover" }}
            />
          </div>
        ) : (
          <>
            <div style={{ fontSize: "26px", marginBottom: "4px" }}>🖼️</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Click to upload image</div>
            <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>PNG, JPG, WEBP</div>
          </>
        )}
        <input id={id} type="file" accept="image/*" onChange={onChange} style={{ display: "none" }} />
      </label>
      {preview && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            fontSize: "12px", color: "#DC2626", background: "none", border: "none",
            cursor: "pointer", padding: "0", fontWeight: 500,
          }}
        >
          ✕ Remove image
        </button>
      )}
    </div>
  );
}

function CategorySelect({ name, value, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        style={{
          ...inputStyle, appearance: "none", WebkitAppearance: "none",
          paddingRight: "32px", cursor: "pointer",
          color: value ? "#0F172A" : "#9CA3AF",
        }}
      >
        <option value="" disabled>Select a category</option>
        {CATEGORIES.filter((c) => c !== "All").map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <div style={{
        position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
        pointerEvents: "none", color: "#94A3B8", fontSize: "11px",
      }}>▾</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Field wrapper — must live OUTSIDE the main component
// so it is never recreated on render (avoids input unfocus)
// ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function AdminBlogpost() {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [posts, setPosts]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch]             = useState("");

  // ── Modal states ──
  const [showAddModal, setShowAddModal]     = useState(false);
  const [showViewModal, setShowViewModal]   = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activePost, setActivePost]         = useState(null);

  // ── Submitting flags ──
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);

  // ── Error state ──
  const [error, setError] = useState(null);

  // ── Add form ──
  const emptyForm = { title: "", description: "", category: "", date: "", content: "" };
  const [addForm, setAddForm]     = useState(emptyForm);
  const [addPreview, setAddPreview] = useState(null);
  const [addFile, setAddFile]     = useState(null);

  // ── Edit form ──
  const [editForm, setEditForm]       = useState(emptyForm);
  const [editPreview, setEditPreview] = useState(null);
  const [editFile, setEditFile]       = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  // ─────────────────────────────────
  // API helpers
  // ─────────────────────────────────
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await axios.get(`${BASE}/api/blogs`, { withCredentials: true, headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } });
      const data = res.data?.data ?? res.data?.posts ?? res.data;
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Failed to load posts. Check API connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // ─────────────────────────────────
  // Derived data
  // ─────────────────────────────────
  const filtered = posts.filter((p) => {
    const matchCat    = activeCategory === "All" || (p.category ?? p.category_name) === activeCategory;
    const matchSearch = (p.title ?? "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const counts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === "All"
      ? posts.length
      : posts.filter((p) => (p.category ?? p.category_name) === cat).length;
    return acc;
  }, {});

  const resolveImg = (post) => {
    if (!post) return null;
    if (post.image_path) return `${BASE}/storage/${post.image_path}`;
    if (post.image)      return post.image.startsWith("http") ? post.image : `${BASE}/storage/${post.image}`;
    return null;
  };

  // ─────────────────────────────────
  // Open modal helpers
  // ─────────────────────────────────
  const openView = (post) => { setActivePost(post); setShowViewModal(true); };

  const toInputDate = (val) => {
    if (!val) return "";
    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    // Try parsing any other format
    const d = new Date(val);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  };

  const openEdit = (post) => {
    setActivePost(post);
    setEditForm({
      title:       post.title       ?? "",
      description: post.description ?? post.excerpt ?? "",
      category:    post.category    ?? post.category_name ?? "",
      date:        toInputDate(post.date ?? post.published_at ?? ""),
      content:     post.content     ?? post.body          ?? "",
    });
    setEditPreview(resolveImg(post));
    setEditFile(null);
    setRemoveImage(false);
    setShowEditModal(true);
  };

  const openDelete = (post) => { setActivePost(post); setShowDeleteModal(true); };

  // ─────────────────────────────────
  // Form handlers
  // ─────────────────────────────────
  const handleAddChange  = (e) => setAddForm((f)  => ({ ...f, [e.target.name]: e.target.value }));
  const handleEditChange = (e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAddFile(file);
    setAddPreview(URL.createObjectURL(file));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditFile(file);
    setEditPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  // ─────────────────────────────────
  // Submit: Add
  // ─────────────────────────────────
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(addForm).forEach(([k, v]) => fd.append(k, v));
      if (addFile) fd.append("image", addFile);

      await axios.post(`${BASE}/api/blogs`, fd, {
        withCredentials: true,
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", "Content-Type": "multipart/form-data" },
      });
      setShowAddModal(false);
      setAddForm(emptyForm);
      setAddPreview(null);
      setAddFile(null);
      fetchPosts();
    } catch (err) {
      console.error("Add failed:", err);
      alert(err.response?.data?.message ?? "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────
  // Submit: Edit
  // ─────────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activePost) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
      if (editFile)       fd.append("image", editFile);
      if (removeImage)    fd.append("remove_image", "1");
      fd.append("_method", "PUT"); // Laravel method spoofing

      const postId = activePost.id ?? activePost.post_id;
      await axios.post(`${BASE}/api/blogs/${postId}`, fd, {
        withCredentials: true,
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", "Content-Type": "multipart/form-data" },
      });
      setShowEditModal(false);
      fetchPosts();
    } catch (err) {
      console.error("Edit failed:", err);
      alert(err.response?.data?.message ?? "Failed to update post.");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────
  // Submit: Delete
  // ─────────────────────────────────
  const handleDelete = async () => {
    if (!activePost) return;
    setDeleting(true);
    try {
      const postId = activePost.id ?? activePost.post_id;
      await axios.delete(`${BASE}/api/blogs${postId}`, {
        withCredentials: true,
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      });
      setShowDeleteModal(false);
      setActivePost(null);
      fetchPosts();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message ?? "Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .abp-burger { display: inline !important; }
          .abp-stats  { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (min-width: 768px) {
          .abp-burger { display: none !important; }
          .abp-stats  { grid-template-columns: repeat(5,1fr) !important; }
        }
        .abp-row:hover td { background: #F8FAFF !important; }
        .abp-act-btn:hover { opacity: 0.75; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#F0F7F2", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <AdminNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* ═══════════════════════════════════
            ADD MODAL
        ═══════════════════════════════════ */}
        {showAddModal && (
          <Overlay onClose={() => setShowAddModal(false)}>
            <ModalHeader title="New Blog Post" subtitle="Fill in the details to publish a new post" onClose={() => setShowAddModal(false)} />
            <form onSubmit={handleAddSubmit} style={{ padding: "20px 24px 24px" }}>
              <ImageUploadZone id="addImg" onChange={handleAddImageChange} preview={addPreview} onRemove={() => { setAddPreview(null); setAddFile(null); }} />

              <Field label="Title">
                <input name="title" value={addForm.title} onChange={handleAddChange} required placeholder="e.g. Jem 8 at MSME Expo 2025" style={inputStyle} />
              </Field>

              <Field label="Description / Excerpt">
                <textarea name="description" value={addForm.description} onChange={handleAddChange} placeholder="Short summary shown on cards…" style={{ ...inputStyle, height: "72px", resize: "vertical" }} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Category">
                  <CategorySelect name="category" value={addForm.category} onChange={handleAddChange} />
                </Field>
                <Field label="Date">
                  <input type="date" name="date" value={addForm.date} onChange={handleAddChange} style={inputStyle} />
                </Field>
              </div>

              <Field label="Content (optional)">
                <textarea name="content" value={addForm.content} onChange={handleAddChange} placeholder="Full post content…" style={{ ...inputStyle, height: "120px", resize: "vertical" }} />
              </Field>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "10px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: submitting ? "#93C5FD" : "#155DFC", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Publishing…" : "Publish Post"}
                </button>
              </div>
            </form>
          </Overlay>
        )}

        {/* ═══════════════════════════════════
            VIEW MODAL
        ═══════════════════════════════════ */}
        {showViewModal && activePost && (() => {
          const imgSrc = resolveImg(activePost);
          return (
            <Overlay wide onClose={() => setShowViewModal(false)}>
              <ModalHeader
                title="Post Details"
                subtitle={activePost.title}
                onClose={() => setShowViewModal(false)}
              />
              <div style={{ padding: "24px" }}>
                {/* Cover image */}
                {imgSrc && (
                  <div style={{ marginBottom: "20px", borderRadius: "12px", overflow: "hidden", maxHeight: "280px" }}>
                    <img src={imgSrc} alt={activePost.title} style={{ width: "100%", objectFit: "cover", display: "block", maxHeight: "280px" }} />
                  </div>
                )}

                {/* Meta row */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", padding: "4px 12px", background: "#EFF6FF", color: "#1D4ED8", borderRadius: "20px", fontWeight: 600, border: "1px solid #BFDBFE" }}>
                    {activePost.category ?? activePost.category_name ?? "Uncategorized"}
                  </span>
                  {(activePost.date ?? activePost.published_at) && (
                    <span style={{ fontSize: "12px", padding: "4px 12px", background: "#F8FAFC", color: "#64748B", borderRadius: "20px", border: "1px solid #E2E8F0" }}>
                      📅 {activePost.date ?? activePost.published_at}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 style={{ margin: "0 0 10px", fontSize: "20px", fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>
                  {activePost.title}
                </h2>

                {/* Description */}
                {(activePost.description ?? activePost.excerpt) && (
                  <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>
                    {activePost.description ?? activePost.excerpt}
                  </p>
                )}

                {/* Divider */}
                {(activePost.content ?? activePost.body) && (
                  <>
                    <div style={{ height: "1px", background: "#F1F5F9", margin: "16px 0" }} />
                    <div style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {activePost.content ?? activePost.body}
                    </div>
                  </>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                  <button
                    onClick={() => { setShowViewModal(false); openEdit(activePost); }}
                    style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#155DFC", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                  >
                    ✏️ Edit Post
                  </button>
                  <button
                    onClick={() => { setShowViewModal(false); openDelete(activePost); }}
                    style={{ flex: 1, padding: "10px", border: "1px solid #FECACA", borderRadius: "8px", background: "#FEF2F2", color: "#DC2626", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                  >
                    🗑️ Delete Post
                  </button>
                </div>
              </div>
            </Overlay>
          );
        })()}

        {/* ═══════════════════════════════════
            EDIT MODAL
        ═══════════════════════════════════ */}
        {showEditModal && activePost && (
          <Overlay onClose={() => setShowEditModal(false)}>
            <ModalHeader
              title="Edit Post"
              subtitle={`Editing: ${activePost.title}`}
              onClose={() => setShowEditModal(false)}
            />
            <form onSubmit={handleEditSubmit} style={{ padding: "20px 24px 24px" }}>
              <ImageUploadZone
                id="editImg"
                onChange={handleEditImageChange}
                preview={editPreview}
                onRemove={() => { setEditPreview(null); setEditFile(null); setRemoveImage(true); }}
              />

              <Field label="Title">
                <input name="title" value={editForm.title} onChange={handleEditChange} required style={inputStyle} />
              </Field>

              <Field label="Description / Excerpt">
                <textarea name="description" value={editForm.description} onChange={handleEditChange} style={{ ...inputStyle, height: "72px", resize: "vertical" }} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Category">
                  <CategorySelect name="category" value={editForm.category} onChange={handleEditChange} />
                </Field>
                <Field label="Date">
                  <input type="date" name="date" value={editForm.date} onChange={handleEditChange} style={inputStyle} />
                </Field>
              </div>

              <Field label="Content">
                <textarea name="content" value={editForm.content} onChange={handleEditChange} placeholder="Full post content…" style={{ ...inputStyle, height: "120px", resize: "vertical" }} />
              </Field>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: "10px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: saving ? "#93C5FD" : "#155DFC", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </Overlay>
        )}

        {/* ═══════════════════════════════════
            DELETE CONFIRM MODAL
        ═══════════════════════════════════ */}
        {showDeleteModal && activePost && (
          <Overlay onClose={() => setShowDeleteModal(false)}>
            <div style={{ padding: "32px 28px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗑️</div>
              <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#0F172A" }}>Delete Post?</h3>
              <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#64748B" }}>
                "<strong>{activePost.title}</strong>"
              </p>
              <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#94A3B8" }}>This action cannot be undone.</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: "10px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: deleting ? "#FCA5A5" : "#DC2626", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer" }}>
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </Overlay>
        )}

        {/* ═══════════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════════ */}
        <main style={{ flex: 1, padding: "0 0 40px", overflowX: "hidden" }}>

          {/* Top Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px 0", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                className="abp-burger"
                onClick={() => setSidebarOpen(true)}
                style={{ display: "none", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#374151" }}
              >☰</button>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0F172A" }}>Blog Post</h1>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#94A3B8" }}>🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts…"
                  style={{ ...inputStyle, paddingLeft: "30px", width: "220px", background: "#fff" }}
                />
              </div>
              <button
                onClick={() => { setAddForm(emptyForm); setAddPreview(null); setAddFile(null); setShowAddModal(true); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", border: "none", borderRadius: "8px", background: "#155DFC", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                + New Post
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div
            className="abp-stats"
            style={{ display: "grid", gap: "14px", padding: "20px 28px", gridTemplateColumns: "repeat(5,1fr)" }}
          >
            {CATEGORIES.map((cat) => (
              <div key={cat} style={{ background: "#fff", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  {categoryMap[cat]}
                </div>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
                  {loading ? "—" : counts[cat]}
                </div>
                {cat === "All" && <div style={{ fontSize: "10px", color: "#94A3B8", marginTop: "3px", fontWeight: 600, letterSpacing: "0.05em" }}>TOTAL</div>}
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div style={{ padding: "0 28px 16px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "6px 14px", borderRadius: "20px", border: "1px solid",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                  background:    activeCategory === cat ? "#155DFC" : "#fff",
                  color:         activeCategory === cat ? "#fff"    : "#64748B",
                  borderColor:   activeCategory === cat ? "#155DFC" : "#E2E8F0",
                }}
              >
                {cat}
                <span style={{ marginLeft: "5px", fontSize: "11px", opacity: 0.75 }}>({counts[cat]})</span>
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ margin: "0 28px 16px", padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", color: "#DC2626", fontSize: "13px" }}>
              ⚠️ {error}
              <button onClick={fetchPosts} style={{ marginLeft: "10px", fontSize: "12px", color: "#155DFC", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Retry</button>
            </div>
          )}

          {/* Table */}
          <div style={{ margin: "0 28px", background: "#fff", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                    {["IMAGE", "TITLE & DESCRIPTION", "CATEGORY", "DATE", "ACTION"].map((h) => (
                      <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {[80, 260, 120, 100, 140].map((w, j) => (
                          <td key={j} style={{ padding: "14px 16px" }}>
                            <div style={{ height: j === 1 ? "36px" : "16px", width: `${Math.min(w, 140)}px`, background: "#F1F5F9", borderRadius: "6px",
                              backgroundImage: "linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)",
                              backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "#94A3B8", fontSize: "14px" }}>
                        {search ? `No posts matching "${search}"` : "No posts found."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((post) => {
                      const imgSrc = resolveImg(post);
                      const cat    = post.category ?? post.category_name ?? "—";
                      const date   = post.date ?? post.published_at ?? "—";
                      return (
                        <tr key={post.id ?? post.post_id} className="abp-row">
                          <td style={{ padding: "12px 16px" }}>
                            {imgSrc ? (
                              <img src={imgSrc} alt={post.title} style={{ width: "64px", height: "48px", borderRadius: "8px", objectFit: "cover", display: "block", border: "1px solid #F1F5F9" }} onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                              <div style={{ width: "64px", height: "48px", borderRadius: "8px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "#CBD5E1" }}>🖼</div>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", maxWidth: "300px" }}>
                            <div style={{ fontWeight: 600, color: "#0F172A", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</div>
                            <div style={{ fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {post.description ?? post.excerpt ?? ""}
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px", background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", whiteSpace: "nowrap" }}>
                              {cat}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#64748B", whiteSpace: "nowrap", fontSize: "12px" }}>{date}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="abp-act-btn"
                                onClick={() => openView(post)}
                                style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#374151", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                              >View</button>
                              <button
                                className="abp-act-btn"
                                onClick={() => openEdit(post)}
                                style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid #BFDBFE", background: "#EFF6FF", color: "#1D4ED8", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                              >Edit</button>
                              <button
                                className="abp-act-btn"
                                onClick={() => openDelete(post)}
                                style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Count footer */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: "10px 28px 0", fontSize: "12px", color: "#94A3B8" }}>
              Showing {filtered.length} of {posts.length} post{posts.length !== 1 ? "s" : ""}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    </>
  );
}