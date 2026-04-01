// ─── Notification.jsx (Tailwind) ─────────────────────────────────────────────
import { useState } from "react";

const BellHeaderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const NOTIFICATIONS = [
  {
    key: "orderUpdates",
    title: "Order Updates",
    desc: "Get notified when your order status changes",
    default: true,
  },
  {
    key: "paymentConfirmation",
    title: "Payment Confirmation",
    desc: "Get notified when your payment has been processed",
    default: true,
  },
  {
    key: "deliveryNotification",
    title: "Delivery Notification",
    desc: "Get notified when your order is out for delivery",
    default: true,
  },
  {
    key: "promos",
    title: "Promos & Special Offers",
    desc: "Be the first to know about exclusive deals",
    default: false,
  },
  {
    key: "newArrivals",
    title: "New Product Arrivals",
    desc: "Get notified when new products are added",
    default: false,
  },
  {
    key: "blog",
    title: "Blog & Newsletter",
    desc: "Receive JEM8's latest articles & updates",
    default: false,
  },
];

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      type="button"
      aria-pressed={on}
      className={`
        relative flex-shrink-0 w-[46px] h-[26px] rounded-full border-none cursor-pointer p-0
        transition-colors duration-250 ease-in-out
        ${on ? "bg-emerald-500" : "bg-gray-200"}
      `}
    >
      <span
        className={`
          absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white
          shadow-[0_1px_4px_rgba(0,0,0,0.2)] block
          transition-transform duration-250 ease-in-out
          ${on ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

export default function Notification() {
  const [prefs, setPrefs] = useState(
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.key, n.default]))
  );

  const toggle = (key, val) => setPrefs((p) => ({ ...p, [key]: val }));

  return (
    <div className="p-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-sm font-medium text-gray-500">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
        Notification &nbsp;·&nbsp; Manage your alerts, updates, and communication preferences
      </div>

      {/* Header card */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">

        {/* Card header */}
        <div className="flex items-center gap-4 py-5 border-b border-gray-100 px-7">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
            <BellHeaderIcon />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">Notification Preference</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Manage your alerts, updates, and communication preferences
            </div>
          </div>
        </div>

        {/* Notification rows */}
        <div className="flex flex-col divide-y divide-gray-100">
          {NOTIFICATIONS.map(({ key, title, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-6 py-5 transition-colors duration-150 px-7 hover:bg-slate-50/60"
            >
              <div>
                <div className="mb-1 text-sm font-semibold text-gray-800">{title}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
              <Toggle on={prefs[key]} onChange={(val) => toggle(key, val)} />
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="flex justify-end py-5 border-t border-gray-100 px-7">
          <button
            type="button"
            className="
              inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
              bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
              text-white text-xs font-semibold
              transition-colors duration-150 cursor-pointer
              max-sm:w-full max-sm:justify-center
            "
          >
            <SaveIcon /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}