// ─── OrdersOverview.jsx ────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../style/OrdersOverview.css";

const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const MessageIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);

const TABS = ["All", "Completed", "Pending", "Delivered", "Cancelled"];

const STATUS_STYLE = {
  Completed: { bg: "#e8f4fd", color: "#2196f3", dot: "#2196f3" },
  Pending:   { bg: "#fff8e1", color: "#f59e0b", dot: "#f59e0b" },
  Processing: { bg: "#fff8e1", color: "#f59e0b", dot: "#f59e0b" },
  Delivered: { bg: "#e8f4fd", color: "#2196f3", dot: "#2196f3" },
  Cancelled: { bg: "#fde8e8", color: "#ef4444", dot: "#ef4444" },
  Shipped: { bg: "#e8f5e9", color: "#4caf50", dot: "#4caf50" },
};

const TRACKER_STEPS = ["Ordered", "Confirmed", "Packed", "Delivered"];

function getActiveTrackerStep(statusOrStep) {
  // If backend provided a numeric step (1..4), convert to 0-based index
  if (typeof statusOrStep === "number") {
    const idx = Math.max(0, Math.min(TRACKER_STEPS.length - 1, statusOrStep - 1));
    return idx;
  }

  // Map of raw backend status keys to tracker step labels (matches backend PHP map)
  const STATUS_TO_TRACKER_LABEL = {
    pending: 'Ordered',
    processing: 'Confirmed',
    ready: 'Packed',
    on_the_way: 'Packed',
    shipped: 'Packed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const s = (statusOrStep || "").toString().trim();
  const key = s.toLowerCase();

  // If the backend already supplied a tracker label like "Ordered"/"Confirmed" use it
  const asTrackerLabel = STATUS_TO_TRACKER_LABEL[key] ||
    // sometimes backend gives friendly words (Ordered, Confirmed, Packed, Delivered)
    (TRACKER_STEPS.find(step => step.toLowerCase() === key) || null);

  if (!asTrackerLabel) return -1;
  if (asTrackerLabel === 'Cancelled') return -1;

  const idx = TRACKER_STEPS.indexOf(asTrackerLabel);
  return idx >= 0 ? idx : -1;
}

function OrderTracker({ status }) {
  const activeStep = getActiveTrackerStep(status);
  
  if (activeStep === -1) return null;
  
  return (
    <div className="order-tracker">
      {TRACKER_STEPS.map((step, i) => (
        <div key={step} className="order-tracker__step">
          <div className={`order-tracker__node${i <= activeStep ? " done" : ""}`} />
          {i < TRACKER_STEPS.length - 1 && (
            <div className={`order-tracker__line${i < activeStep ? " done" : ""}`} />
          )}
          <span className="order-tracker__label">{step}</span>
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order }) {
  // Get status from delivery if available
  // Prefer backend-provided human-friendly label and step when available
  const backendStep = order.delivery?.status_step ?? null;
  const backendLabel = order.delivery?.status_label || order.delivery?.status || order.status || "Processing";
  const normalizedLabel = String(backendLabel).charAt(0).toUpperCase() + String(backendLabel).slice(1).toLowerCase();
  const s = STATUS_STYLE[normalizedLabel] || { bg: "#f3f4f6", color: "#6b7280", dot: "#6b7280" };
  const canReorder = normalizedLabel === "Delivered" || normalizedLabel === "Completed";
  
  // Get items from cart
  const items = order.cart || [];
  
  return (
    <div className="order-card">
      <div className="order-card__top">
        <div className="order-card__id-wrap">
          <span className="order-card__id">Order #{order.checkout_id}</span>
          <span className="order-card__date">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
        </div>
        <span
          className="order-card__status-badge"
          style={{ background: s.bg, color: s.color }}
        >
          <span className="order-card__status-dot" style={{ background: s.dot }} />
          {normalizedLabel}
        </span>
      </div>

      <div className="order-card__items">
        {items.length > 0 ? (
          items.slice(0, 3).map((item, i) => (
            <span key={i} className="order-card__item-tag">
              {item.product?.name || "Product"} x{item.quantity}
            </span>
          ))
        ) : (
          <span className="order-card__item-tag">No items</span>
        )}
        {items.length > 3 && (
          <span className="order-card__item-tag">+{items.length - 3} More</span>
        )}
      </div>

      {getActiveTrackerStep(backendStep ?? backendLabel) !== -1 && (
        <OrderTracker status={backendStep ?? backendLabel} />
      )}

      <div className="order-card__bottom">
          <span className="order-card__total">
          TOTAL: <strong>₱{Number(order.paid_amount).toLocaleString()}</strong>
          <span className="order-card__payment"> · {order.payment_method === "cod" ? "Cash on Delivery" : 
            order.payment_method === "gcash" ? "GCash" :
            order.payment_method === "maya" ? "Maya" :
            order.payment_method === "bank_transfer" ? "Bank Transfer" : "Check"}</span>
        </span>
        <div className="order-card__actions">
          <button className="btn-order-outline" onClick={() => window.location.href = `/orders/${order.checkout_id}`}>
            <EyeIcon /> View Details
          </button>
          {canReorder ? (
            <button className="btn-order-dark" onClick={() => window.location.href = `/products?reorder=${order.checkout_id}`}>
              <RefreshIcon /> Re Order
            </button>
          ) : (
            <button className="btn-order-outline" onClick={() => window.location.href = "/contact"}>
              <MessageIcon /> Contact Us
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api",
  withCredentials: true,
  headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
});

export default function OrdersOverview({ userId }) {
  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    delivered: 0,
    pending: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log("Fetching orders...");
        
        // Use the checkout endpoint from your CheckoutController
        const response = await api.get("/checkout");
        
        if (response.status === 200) {
          let ordersData = response.data;
          
          // If it's not an array, wrap it
          if (!Array.isArray(ordersData)) {
            ordersData = [ordersData];
          }
          
          console.log("Orders fetched:", ordersData);
          setOrders(ordersData);
          
          // Calculate stats based on delivery status (prefer status_label when available)
          const total = ordersData.length;
          const normalize = (o) => {
            const label = o.delivery?.status_label || o.delivery?.status || o.status || "";
            const str = String(label);
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
          };

          const completed = ordersData.filter(o => {
            const s = normalize(o);
            return s === "Delivered" || s === "Completed";
          }).length;
          const delivered = ordersData.filter(o => normalize(o) === "Delivered").length;
          const pending = ordersData.filter(o => {
            const s = normalize(o);
            return s === "Processing" || s === "Pending" || s === "Confirmed";
          }).length;

          setStats({ total, completed, delivered, pending });
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          toast.error("Failed to load your orders");
        }
        
        setOrders([]);
        setStats({ total: 0, completed: 0, delivered: 0, pending: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const filtered = activeTab === "All"
    ? orders
    : orders.filter(o => {
        const label = o.delivery?.status_label || o.delivery?.status || o.status || "";
        const normalized = String(label).charAt(0).toUpperCase() + String(label).slice(1).toLowerCase();
        return normalized === activeTab;
      });

  const STAT_CARDS = [
    { label: "TOTAL ORDERS", value: stats.total },
    { label: "COMPLETED",    value: stats.completed },
    { label: "DELIVERED",    value: stats.delivered },
    { label: "PENDING",      value: stats.pending },
  ];

  if (loading) {
    return (
      <div className="profile-main">
        <div className="orders-loading">
          <div className="orders-loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
        <style>{`
          .orders-loading {
            text-align: center;
            padding: 60px 20px;
          }
          .orders-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f0f0f0;
            border-top-color: #1a1a1a;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="profile-main">

      {/* Stat cards */}
      <div className="orders-stats">
        {STAT_CARDS.map(({ label, value }) => (
          <div key={label} className="orders-stat-card">
            <div className="orders-stat-card__value">{value}</div>
            <div className="orders-stat-card__label">{label}</div>
          </div>
        ))}
      </div>

      {/* Orders card */}
      <div className="profile-card">
        <div className="profile-card__header">
          <div className="profile-card__header-left">
            <div className="profile-card__icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
              </svg>
            </div>
            <div>
              <div className="profile-card__title">My Orders</div>
              <div className="profile-card__subtitle">Track and manage all your purchases</div>
            </div>
          </div>
          <span className="orders-total-badge">{stats.total} Total Orders</span>
        </div>

        {/* Tabs */}
        <div className="orders-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`orders-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Order list */}
        {filtered.length === 0 ? (
          <div className="orders-empty-state">
            <div className="orders-empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>You don't have any {activeTab !== "All" ? activeTab.toLowerCase() : ""} orders yet.</p>
            <button className="orders-shop-btn" onClick={() => navigate("/products")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filtered.map((order) => (
              <OrderCard key={order.checkout_id} order={order} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .orders-empty-state {
          text-align: center;
          padding: 60px 20px;
        }
        .orders-empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .orders-empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        .orders-empty-state p {
          color: #666;
          margin-bottom: 24px;
        }
        .orders-shop-btn {
          padding: 10px 24px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .orders-shop-btn:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}