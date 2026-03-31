// ─── OrdersOverview.jsx ────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

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
  Completed:  { bg: "#e8f4fd", color: "#2196f3", dot: "#2196f3" },
  Pending:    { bg: "#fff8e1", color: "#f59e0b", dot: "#f59e0b" },
  Processing: { bg: "#fff8e1", color: "#f59e0b", dot: "#f59e0b" },
  Delivered:  { bg: "#e8f4fd", color: "#2196f3", dot: "#2196f3" },
  Cancelled:  { bg: "#fde8e8", color: "#ef4444", dot: "#ef4444" },
  Shipped:    { bg: "#e8f5e9", color: "#4caf50", dot: "#4caf50" },
};

const TRACKER_STEPS = ["Ordered", "Confirmed", "Packed", "Delivered"];

function getActiveTrackerStep(status) {
  switch (status?.toLowerCase()) {
    case "pending":    return 0;
    case "processing": return 1;
    case "shipped":    return 2;
    case "delivered":  return 3;
    case "completed":  return 3;
    default:           return -1;
  }
}

function OrderTracker({ status }) {
  const activeStep = getActiveTrackerStep(status);
  if (activeStep === -1) return null;

  return (
    <div className="relative flex items-start my-3">
      {TRACKER_STEPS.map((step, i) => (
        <div key={step} className="relative flex flex-col items-center flex-1">
          {/* Node */}
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 z-10 flex-shrink-0 transition-colors ${
              i <= activeStep
                ? "bg-gray-900 border-gray-900"
                : "bg-gray-200 border-gray-200"
            }`}
          />
          {/* Connector line */}
          {i < TRACKER_STEPS.length - 1 && (
            <div
              className={`absolute top-[6px] left-1/2 w-full h-0.5 z-0 transition-colors ${
                i < activeStep ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          )}
          <span className="text-[10px] text-gray-400 mt-1.5 whitespace-nowrap">{step}</span>
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order }) {
  const orderStatus = order.delivery?.status || order.status || "Processing";
  const s = STATUS_STYLE[orderStatus] || { bg: "#f3f4f6", color: "#6b7280", dot: "#6b7280" };
  const canReorder = orderStatus === "Delivered" || orderStatus === "Completed";
  const items = order.cart || [];

  const paymentLabel =
    order.payment_method === "cod"           ? "Cash on Delivery" :
    order.payment_method === "gcash"         ? "GCash" :
    order.payment_method === "maya"          ? "Maya" :
    order.payment_method === "bank_transfer" ? "Bank Transfer" : "Check";

  return (
    <div className="px-7 py-5 border-b border-gray-100 last:border-b-0 hover:bg-[#fafffe] transition-colors">

      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-gray-900">Order #{order.checkout_id}</span>
          <span className="text-xs text-gray-400">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: s.bg, color: s.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
          {orderStatus}
        </span>
      </div>

      {/* Item tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {items.length > 0 ? (
          items.slice(0, 3).map((item, i) => (
            <span
              key={i}
              className="bg-[#f0f7f2] border border-[#c3ddd0] rounded-full px-2.5 py-0.5 text-[11px] text-[#2e6b45]"
            >
              {item.product?.name || "Product"} x{item.quantity}
            </span>
          ))
        ) : (
          <span className="bg-[#f0f7f2] border border-[#c3ddd0] rounded-full px-2.5 py-0.5 text-[11px] text-[#2e6b45]">
            No items
          </span>
        )}
        {items.length > 3 && (
          <span className="bg-[#f0f7f2] border border-[#c3ddd0] rounded-full px-2.5 py-0.5 text-[11px] text-[#2e6b45]">
            +{items.length - 3} More
          </span>
        )}
      </div>

      {/* Tracker */}
      {orderStatus !== "Cancelled" && orderStatus !== "Completed" && (
        <OrderTracker status={orderStatus} />
      )}

      {/* Bottom row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
        <span className="text-[13px] text-gray-800">
          TOTAL: <strong className="font-bold">₱{Number(order.paid_amount).toLocaleString()}</strong>
          <span className="text-xs text-gray-400"> · {paymentLabel}</span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = `/orders/${order.checkout_id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 cursor-pointer hover:border-[#c3ddd0] hover:text-[#2e6b45] hover:-translate-y-px transition-all"
          >
            <EyeIcon /> View Details
          </button>
          {canReorder ? (
            <button
              onClick={() => window.location.href = `/products?reorder=${order.checkout_id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-900 border border-gray-900 rounded-lg text-xs font-semibold text-white cursor-pointer hover:bg-[#2e6b45] hover:border-[#2e6b45] hover:-translate-y-px transition-all"
            >
              <RefreshIcon /> Re Order
            </button>
          ) : (
            <button
              onClick={() => window.location.href = "/contact"}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 cursor-pointer hover:border-[#c3ddd0] hover:text-[#2e6b45] hover:-translate-y-px transition-all"
            >
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
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState({ total: 0, completed: 0, delivered: 0, pending: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/checkout");
        if (response.status === 200) {
          let ordersData = response.data;
          if (!Array.isArray(ordersData)) ordersData = [ordersData];
          setOrders(ordersData);
          setStats({
            total:     ordersData.length,
            completed: ordersData.filter(o => o.delivery?.status === "Delivered" || o.delivery?.status === "Completed").length,
            delivered: ordersData.filter(o => o.delivery?.status === "Delivered").length,
            pending:   ordersData.filter(o => o.delivery?.status === "Processing" || o.delivery?.status === "Pending").length,
          });
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
    : orders.filter(o => (o.delivery?.status || o.status) === activeTab);

  const STAT_CARDS = [
    { label: "TOTAL ORDERS", value: stats.total     },
    { label: "COMPLETED",    value: stats.completed  },
    { label: "DELIVERED",    value: stats.delivered  },
    { label: "PENDING",      value: stats.pending    },
  ];

  // ── Loading state ──
  if (loading) {
    return (
      <div className="p-6 py-16 text-center">
        <div className="w-10 h-10 border-[3px] border-gray-100 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-400">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-[74px] mb-5">
        {STAT_CARDS.map(({ label, value }) => (
          <div
            key={label}
            className="bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm min-h-[70px] hover:shadow-md hover:border-[#c3ddd0] hover:-translate-y-[3px] transition-all duration-200"
          >
            <div className="text-[26px] font-bold text-gray-900 leading-none mb-1.5">{value}</div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.07em]">{label}</div>
          </div>
        ))}
      </div>

      {/* Orders card */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">

        {/* Card header */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-5 border-b border-gray-100 px-7">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#f0f7f2] flex items-center justify-center text-[#4d7b65] flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
              </svg>
            </div>
            <div>
              <div className="text-[15px] font-semibold text-gray-900">My Orders</div>
              <div className="text-[13px] text-gray-400 mt-0.5">Track and manage all your purchases</div>
            </div>
          </div>
          <span className="bg-[#f0f7f2] border border-[#c3ddd0] rounded-full px-3.5 py-1 text-xs font-semibold text-[#2e6b45] whitespace-nowrap">
            {stats.total} Total Orders
          </span>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 py-4 border-b border-gray-100 px-7">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full border text-[13px] font-medium cursor-pointer transition-all duration-150
                ${activeTab === tab
                  ? "bg-gray-900 border-gray-900 text-white font-semibold"
                  : "bg-white border-gray-200 text-gray-500 hover:border-[#c3ddd0] hover:text-[#2e6b45]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Order list / Empty state */}
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mb-5 text-6xl">📦</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No orders found</h3>
            <p className="mb-6 text-gray-500">
              You don't have any {activeTab !== "All" ? activeTab.toLowerCase() : ""} orders yet.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-2.5 bg-gray-900 text-white border-none rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((order) => (
              <OrderCard key={order.checkout_id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}