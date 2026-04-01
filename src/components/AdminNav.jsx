import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { me } from "../api/auth";

const mainNavItems = [
  { label: "Dashboard", icon: "⊞", href: "/adminDashboard" },
  { label: "Products", icon: "📦", href: "/adminProducts" },
  { label: "Orders", icon: "🛒", href: "/adminOrders" },
  { label: "Blog Post", icon: "📝", href: "/adminBlogpost" },
  { label: "Account Management", icon: "👤", href: "/adminAccountmanagement" },
  { label: "Customer Reports", icon: "📊", href: "/adminContact" },
  { label: "Leadership Management", icon: "🏆", href: "/adminLeadership" },
  { label: "Backup & Recovery", icon: "💾", href: "/adminBackup" },
  { label: "Reviews", icon: "⭐", href: "/adminReviews" },
  { label: "Messages", icon: "✉️", href: "/adminMessage" },
  { label: "Activity Log", icon: "📋", href: "/adminActivitylogs" },
];

const settingsItems = [
  { label: "Settings", icon: "⚙️", href: "/adminSettings" },
  { label: "Main Page", icon: "⬅️", href: "/" },
];

export default function AdminNav({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await me();
        if (response.status === 200 && response.data.status === "success") {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const getInitials = () => {
    if (!user) return "AD";
    const firstInitial = user.first_name?.[0] || "";
    const lastInitial = user.last_name?.[0] || "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "AD";
  };

  const NavLink = ({ item }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-[13px] font-medium transition-all duration-150 no-underline
          ${isActive
            ? "bg-[#155DFC] text-white font-semibold"
            : "text-gray-700 hover:bg-gray-100"
          }`}
      >
        <span className="text-[15px] w-5 text-center">{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    );
  };

  const NavContent = () => (
    <>
      {/* Logo Area */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <img
            src="/src/assets/Logo — Jem 8 Circle Trading Co (1).png"
            alt="JEM 8 CIRCLE"
            className="object-contain w-auto h-14"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-lg text-gray-500 transition-colors bg-transparent border-none cursor-pointer md:hidden hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 text-base font-bold text-gray-900">Admin Panel</div>
        <div className="text-[11px] text-gray-400 mt-0.5">Account Management System</div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}

        {/* Divider */}
        <div className="h-px my-3 bg-gray-200" />

        {/* Settings */}
        {settingsItems.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>

      {/* Profile */}
      <div className="p-4 border-t border-gray-200 flex items-center gap-2.5">
        {!loading && user?.profile_image ? (
          <img
            src={user.profile_image}
            alt="Profile"
            className="flex-shrink-0 object-cover rounded-full w-9 h-9"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2B7FFF] to-[#9810FA] flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0">
            {!loading && user ? getInitials() : "AD"}
          </div>
        )}

        <div>
          <div className="text-[13px] font-semibold text-gray-900">
            {!loading && user
              ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Admin User"
              : "Admin User"}
          </div>
          <div className="text-[11px] text-gray-400">
            {!loading && user ? user.email : "admin@company.com"}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 w-[242px] h-screen bg-white border-r border-gray-200 flex flex-col z-50 overflow-y-auto transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0 shadow-[4px_0_20px_rgba(0,0,0,0.15)]" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[242px] min-w-[242px] bg-white border-r border-gray-200 flex-col sticky top-0 h-screen overflow-y-auto">
        <NavContent />
      </aside>
    </>
  );
}