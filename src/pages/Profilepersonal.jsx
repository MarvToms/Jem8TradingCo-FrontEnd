import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, me, updateProfile } from "../api/auth";
import '../style/Profilepersonal.css';
import "../style/OrdersOverview.css";
import '../style/PasswordSecurity.css';
import '../style/Notification.css';
import OrdersOverview from './OrdersOverview';
import PasswordSecurity from './PasswordSecurity';
import Notification     from './Notification';
import { toast } from "react-toastify";
import { getUserAddresses, addAddress as apiAddAddress, updateAddress as apiUpdateAddress, deleteAddress as apiDeleteAddress } from "../api/address"; 
// ─── Icons ───────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const PersonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const OrderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const BellIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="7" y1="1" x2="7" y2="13" />
    <line x1="1" y1="7" x2="13" y2="7" />
  </svg>
);
const EditSmallIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const InfoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

// ─── Address Modal ────────────────────────────────────────────────────────────
function AddressModal({ onClose, onSave, editingAddress }) {
  const [form, setForm] = useState(
    editingAddress || { label: "", street: "", city: "", province: "", zip: "", country: "" }
  );

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.street || !form.city) return;
    onSave(form);
    onClose();
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.box} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div style={modalStyles.title}>
            <MapPinIcon />
            <span>{editingAddress ? "Edit Address" : "Add New Address"}</span>
          </div>
          <button style={modalStyles.closeBtn} onClick={onClose}><XIcon /></button>
        </div>

        <div style={modalStyles.body}>
          <div style={modalStyles.fieldRow}>
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>
                Label <span style={{ color: "#aaa", fontWeight: 400 }}>(e.g. Home, Office)</span>
              </label>
              <input
                style={modalStyles.input}
                name="label"
                value={form.label}
                onChange={handleChange}
                placeholder="Home"
              />
            </div>
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Street Address</label>
            <input
              style={modalStyles.input}
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="123 Main St, Apt 4B"
            />
          </div>

          <div style={modalStyles.fieldRow}>
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>City</label>
              <input
                style={modalStyles.input}
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Antipolo"
              />
            </div>
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Province</label>
              <input
                style={modalStyles.input}
                name="province"
                value={form.province}
                onChange={handleChange}
                placeholder="Rizal"
              />
            </div>
          </div>

          <div style={modalStyles.fieldRow}>
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>ZIP Code</label>
              <input
                style={modalStyles.input}
                name="zip"
                value={form.zip}
                onChange={handleChange}
                placeholder="1870"
              />
            </div>
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Country</label>
              <input
                style={modalStyles.input}
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Philippines"
              />
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.btnGhost} onClick={onClose}>Cancel</button>
          <button style={modalStyles.btnPrimary} onClick={handleSubmit}>
            <CheckIcon /> {editingAddress ? "Save Changes" : "Add Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Editable Field ───────────────────────────────────────────────────────────
function EditableField({ label, value, name, isEditing, onChange }) {
  return (
    <div className="profile-field">
      <span className="profile-field__label">{label}</span>
      {isEditing ? (
        <input
          style={editableStyles.input}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={label}
        />
      ) : (
        <div className="profile-field__input" style={editableStyles.display}>
          {value || <span style={{ color: "#bbb" }}>—</span>}
        </div>
      )}
    </div>
  );
}

// ─── Personal Information Tab ─────────────────────────────────────────────────
function PersonalInformation({ user, onUserUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    first_name:    user?.first_name    || "",
    last_name:     user?.last_name     || "",
    email:         user?.email         || "",
    phone_number:  user?.phone_number  || "",
    company:       user?.company       || "",
    position:      user?.position      || "",
    business_type: user?.business_type || "",
  });

  const [addresses, setAddresses]       = useState([]);
  const [showModal, setShowModal]       = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (onUserUpdate) onUserUpdate(form);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm({
      first_name:    user?.first_name    || "",
      last_name:     user?.last_name     || "",
      email:         user?.email         || "",
      phone_number:  user?.phone_number  || "",
      company:       user?.company       || "",
      position:      user?.position      || "",
      business_type: user?.business_type || "",
    });
    setIsEditing(false);
  };

  const handleAddAddress = async (addr) => {
    try {
      if (editingIndex !== null) {
        // Update existing address
        const addrId = addresses[editingIndex].id;
        const res = await apiUpdateAddress(addrId, addr);

        const updated = [...addresses];
        updated[editingIndex] = res.data; // assume API returns updated address
        setAddresses(updated);
        toast.success("Address updated successfully");
      } else {
        // Add new address
        const res = await apiAddAddress(addr);
        setAddresses([...addresses, res.data]); // add returned address
        toast.success("Address added successfully");
      }
    } catch (error) {
      console.error("Address save failed:", error);
    } finally {
      setEditingAddress(null);
      setEditingIndex(null);
      setShowModal(false);
    }
  };

  const handleEditAddress = (idx) => {
    setEditingAddress(addresses[idx]);
    setEditingIndex(idx);
    setShowModal(true);
  };

  const handleDeleteAddress = async (idx) => {
    try {
      const addrId = addresses[idx].id;
      await apiDeleteAddress(addrId);
      setAddresses(addresses.filter((_, i) => i !== idx));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setEditingIndex(null);
    setShowModal(true);
  };

  return (
    <div className="profile-main">
      {showModal && (
        <AddressModal
          onClose={() => { setShowModal(false); setEditingAddress(null); setEditingIndex(null); }}
          onSave={handleAddAddress}
          editingAddress={editingAddress}
        />
      )}

      <div className="profile-breadcrumb">
        <span className="profile-breadcrumb__dot" />
        Personal Information &nbsp;·&nbsp; Manage your profile and contact details
      </div>

      {/* Profile Details Card */}
      <div className="profile-card">
        <div className="profile-card__header">
          <div className="profile-card__header-left">
            <div className="profile-card__icon-box"><InfoIcon /></div>
            <div>
              <div className="profile-card__title">Profile Details</div>
              <div className="profile-card__subtitle">Your personal and business information</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {isEditing ? (
              <>
                <button className="btn-profile-outline" onClick={handleCancel} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <XIcon /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{ display:"flex", alignItems:"center", gap:5, background:"#1a1a1a", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer" }}
                >
                  <CheckIcon /> Save
                </button>
              </>
            ) : (
              <button className="btn-profile-outline" onClick={() => setIsEditing(true)}>
                <EditSmallIcon /> Edit
              </button>
            )}
          </div>
        </div>

        <div className="profile-card__user-strip">
          <div className="profile-card__user-avatar"><UserIcon /></div>
          <div>
            <div className="profile-card__user-name">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="profile-card__user-meta">{user?.email}</div>
            <div className="profile-card__user-meta">{user?.phone_number || "No phone number"}</div>
          </div>
        </div>

        <div className="profile-card__fields">
          <EditableField label="First Name"                   name="first_name"    value={form.first_name}    isEditing={isEditing} onChange={handleChange} />
          <EditableField label="Last Name"                    name="last_name"     value={form.last_name}     isEditing={isEditing} onChange={handleChange} />
          <EditableField label="Email Address"                name="email"         value={form.email}         isEditing={isEditing} onChange={handleChange} />
          <EditableField label="Phone / Mobile Number"        name="phone_number"  value={form.phone_number}  isEditing={isEditing} onChange={handleChange} />
          <EditableField label="Company Name (Optional)"      name="company"       value={form.company}       isEditing={isEditing} onChange={handleChange} />
          <EditableField label="Position / Title (Optional)"  name="position"      value={form.position}      isEditing={isEditing} onChange={handleChange} />
          <div className="profile-field--full">
            <EditableField label="Business Type (Optional)"   name="business_type" value={form.business_type} isEditing={isEditing} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Addresses Card */}
      <div className="profile-card">
        <div className="profile-card__header">
          <div className="profile-card__header-left">
            <div className="profile-card__icon-box"><MapPinIcon /></div>
            <div>
              <div className="profile-card__title">Addresses</div>
              <div className="profile-card__subtitle">Manage your saved delivery addresses</div>
            </div>
          </div>
          <button className="btn-profile-primary" onClick={openAddModal}>
            <PlusIcon /> Add New
          </button>
        </div>

        <div className="profile-addresses__grid">
          {addresses.length === 0 ? (
            <>
              <div className="profile-address-empty">
                <div className="profile-address-empty__icon"><PlusIcon /></div>
                <span>No address saved yet</span>
                <button className="btn-profile-ghost" onClick={openAddModal}><PlusIcon /> Add Address</button>
              </div>
              <div className="profile-address-empty">
                <div className="profile-address-empty__icon"><PlusIcon /></div>
                <span>No address saved yet</span>
                <button className="btn-profile-ghost" onClick={openAddModal}><PlusIcon /> Add Address</button>
              </div>
            </>
          ) : (
            <>
              {addresses.map((addr, idx) => (
                <div key={idx} style={addressStyles.card}>
                  <div style={addressStyles.cardHeader}>
                    <span style={addressStyles.label}>{addr.label || "Address"}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={addressStyles.actionBtn} onClick={() => handleEditAddress(idx)}>
                        <EditSmallIcon />
                      </button>
                      <button style={{ ...addressStyles.actionBtn, color: "#e57373" }} onClick={() => handleDeleteAddress(idx)}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                  <div style={addressStyles.line}>{addr.street}</div>
                  <div style={addressStyles.line}>{[addr.city, addr.province, addr.zip].filter(Boolean).join(", ")}</div>
                  <div style={addressStyles.line}>{addr.country}</div>
                </div>
              ))}
              <div className="profile-address-empty">
                <div className="profile-address-empty__icon"><PlusIcon /></div>
                <span>Add another address</span>
                <button className="btn-profile-ghost" onClick={openAddModal}><PlusIcon /> Add Address</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Style Objects ────────────────────────────────────────────────────────────
const modalStyles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(3px)",
  },
  box: {
    background: "#fff", borderRadius: 14, width: "100%", maxWidth: 520,
    boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden",
    animation: "addrModalIn 0.22s cubic-bezier(.4,0,.2,1)",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 24px", borderBottom: "1px solid #f0f0f0",
  },
  title: { display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: "#1a1a1a" },
  closeBtn: {
    background: "#f4f4f4", border: "none", borderRadius: 6,
    width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#666",
  },
  body: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 },
  fieldRow: { display: "flex", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 5, flex: 1 },
  label: { fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" },
  input: {
    border: "1.5px solid #e8e8e8", borderRadius: 8, padding: "9px 12px",
    fontSize: 14, color: "#1a1a1a", outline: "none", background: "#fafafa",
    width: "100%", boxSizing: "border-box",
  },
  footer: {
    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10,
    padding: "14px 24px", borderTop: "1px solid #f0f0f0", background: "#fafafa",
  },
  btnGhost: {
    background: "none", border: "1.5px solid #e0e0e0", borderRadius: 8,
    padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#666",
  },
  btnPrimary: {
    background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8,
    padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 6,
  },
};

const editableStyles = {
  input: {
    border: "1.5px solid #1a1a1a", borderRadius: 8, padding: "9px 12px",
    fontSize: 14, color: "#1a1a1a", outline: "none", background: "#f9f9f9",
    width: "100%", boxSizing: "border-box",
  },
  display: {
    fontSize: 14, color: "#1a1a1a", padding: "9px 0",
    borderBottom: "1px solid #f0f0f0", minHeight: 36,
  },
};

const addressStyles = {
  card: {
    border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "14px 16px",
    background: "#fafafa", display: "flex", flexDirection: "column", gap: 4,
  },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#555" },
  actionBtn: {
    background: "#f0f0f0", border: "none", borderRadius: 6,
    width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#444",
  },
  line: { fontSize: 13, color: "#444", lineHeight: 1.6 },
};

// ─── Menu Items ───────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { key: "personal", label: "Personal Information", Icon: PersonIcon },
  { key: "orders",   label: "My Orders",            Icon: OrderIcon, badge: 12 },
  { key: "password", label: "Password & Security",  Icon: LockIcon },
  { key: "notif",    label: "Notification",         Icon: BellIcon },
];

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ProfilePersonal() {
  const [activeMenu, setActiveMenu] = useState("personal");
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const navigate = useNavigate();

  console.log(user)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await me();
        if (response.status === 200 && response.data.status === "success") {
          setUser(response.data.data);
          
          // Fetch addresses
          const addrRes = await getUserAddresses();
          if (addrRes.status === 200) {
            setAddresses(addrRes.data); // set fetched addresses
          }
        } else {
          // navigate("/login");
        }
      } catch (error) {
        console.error(error);
        // navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleUserUpdate = async (updatedFields) => {
    // Merge updated fields with current user
    const updatedUser = { ...user, ...updatedFields };

    // Update state immediately
    setUser(updatedUser);

    try {
      // Send the updated data to API
      const res = await updateProfile(updatedUser);

      // Optionally, if API returns the updated user, sync it back:
      if (res.user) {
        setUser(res.user);
      }

    } catch (error) {
      // Errors already handled inside updateProfile toast
      console.error("Update failed:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user)   return <p>User not found or unauthenticated.</p>;

  const renderContent = () => {
    switch (activeMenu) {
      case "orders":   return <OrdersOverview />;
      case "password": return <PasswordSecurity />;
      case "notif":    return <Notification />;
      default: return <PersonalInformation user={user} onUserUpdate={handleUserUpdate} />;
    }
  };

  const Logout = async () => {
    const data = await logout();
    if (data) navigate("/login");
  };

  return (
    <>
      <style>{`
        @keyframes addrModalIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="profile-page">
        <div className="profile-page__inner">

          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-sidebar__avatar-wrap">
              <div className="profile-sidebar__avatar"><UserIcon /></div>
              <span className="profile-sidebar__name">{user.first_name} {user.last_name}</span>
              <span className="profile-sidebar__email">{user.email}</span>
              <span className="profile-sidebar__phone">{user.phone_number || "—"}</span>
            </div>

            <nav className="profile-sidebar__nav">
              <span className="profile-sidebar__nav-label">Overview</span>
              {MENU_ITEMS.map(({ key, label, Icon, badge }) => (
                <button
                  key={key}
                  className={`profile-sidebar__item${activeMenu === key ? " active" : ""}`}
                  onClick={() => setActiveMenu(key)}
                >
                  <Icon />{label}
                  {badge && <span className="profile-sidebar__badge">{badge}</span>}
                </button>
              ))}
            </nav>

            <div className="profile-sidebar__divider" />

            <div className="profile-sidebar__logout-wrap">
              <button className="profile-sidebar__item danger" onClick={Logout}>
                <LogoutIcon /> Logout
              </button>
            </div>
          </aside>

          {/* Tab Content */}
          {renderContent()}
        </div>
      </div>
    </>
  );
}