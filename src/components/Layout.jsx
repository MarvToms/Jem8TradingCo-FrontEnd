import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Logo from '../assets/Logo — Jem 8 Circle Trading Co (1).png';
import api from "../api/axios";

/* ══════════════════════════════════
   HEADER
══════════════════════════════════ */
export function Header() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const { totalItems }                  = useCart();
  const [isLog, setIsLog]               = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [userRole, setUserRole]         = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => setProfileImage(e.detail.url);
    window.addEventListener("profile-photo-updated", handler);
    return () => window.removeEventListener("profile-photo-updated", handler);
  }, []);

<<<<<<< HEAD
  const checkLogin = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/me", { withCredentials: true });
      setIsLog(true);
      setProfileImage(res.data?.profile_image ?? res.data?.data?.profile_image ?? null);
      setUserRole(res.data?.role ?? res.data?.data?.role ?? null);
    } catch {
=======
  // Function to check login status
const checkLogin = async () => {
  console.log("checkLogin called");
  console.log("token in localStorage:", localStorage.getItem("token"));
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("NO TOKEN — bailing out");
>>>>>>> 1874805e4635cf5e0040a0867db727c33bfc46f9
      setIsLog(false);
      setLoading(false);
      return;
    }
    const res = await api.get("/me");
    console.log("=== /me response ===", res.data);
    
    setIsLog(true);
    // handle both response shapes: { data: {...} } or flat { role, profile_image }
    const userData = res.data?.data ?? res.data;
    setProfileImage(userData?.profile_image ?? null);
    setUserRole(userData?.role ?? null);
  } catch (err) {
    console.log("/me error:", err);
    setIsLog(false);
    setProfileImage(null);
    setUserRole(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    checkLogin();

    const handleLogout = () => {
      setIsLog(false);
      setProfileImage(null);
      setUserRole(null);
    };

<<<<<<< HEAD
    const handleLogin = () => { checkLogin(); };

    const handlePhotoUpdate = (e) => { setProfileImage(e.detail.url); };
=======
    const handleLogin = () => {
      checkLogin();
    };

    const handlePhotoUpdate = (e) => {
      setProfileImage(e.detail.url);
    };
>>>>>>> 1874805e4635cf5e0040a0867db727c33bfc46f9

    window.addEventListener("auth-logout", handleLogout);
    window.addEventListener("auth-login", handleLogin);
    window.addEventListener("profile-photo-updated", handlePhotoUpdate);
    return () => {
      window.removeEventListener("auth-logout",           handleLogout);
      window.removeEventListener("auth-login",            handleLogin);
      window.removeEventListener("profile-photo-updated", handlePhotoUpdate);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isAdmin  = userRole === "admin" || userRole === "administrator" || userRole === "Admin";

  const NAV_LINKS = [
    { to: "/",         label: "Home"      },
    { to: "/products", label: "Products"  },
    { to: "/blog",     label: "Blog"      },
    { to: "/about",    label: "About"     },
    { to: "/contact",  label: "Contact"   },
    { to: "/orders",   label: "My Orders" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] bg-white border-b border-[#e8ede9] transition-shadow duration-300 ${
          scrolled ? "shadow-[0_2px_24px_rgba(0,0,0,0.10)]" : "shadow-none"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-5 h-[68px] flex items-center gap-5">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 no-underline">
            <img
              src={Logo}
              alt="JEM 8 Circle Trading Co."
              className="h-[52px] w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextSibling) e.target.nextSibling.style.display = "block";
              }}
            />
            <span className="hidden font-bold text-[18px] text-[#2e6b45]">JEM 8 Circle</span>
          </Link>

          {/* Desktop nav */}
          <nav className="items-center hidden gap-1 ml-auto md:flex">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg no-underline text-sm transition-all duration-150
                  ${isActive(to)
                    ? "font-bold text-[#2e6b45] bg-[#e8f5ed]"
                    : "font-medium text-gray-700 hover:bg-[#e8f5ed] hover:text-[#2e6b45]"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center flex-shrink-0 gap-2 ml-auto md:ml-0">

            {/* Search (desktop only) */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 gap-1.5 h-9">
              <span className="text-sm">🔍</span>
              <input
                type="text"
                className="border-none bg-transparent outline-none text-[13px] w-[140px] text-gray-700 placeholder-gray-400"
                placeholder="Search products..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    window.location.href = "/products";
                  }
                }}
              />
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative bg-transparent border-none cursor-pointer text-xl p-1.5 rounded-lg flex items-center justify-center no-underline text-inherit hover:bg-gray-100 transition-colors"
              aria-label="View cart"
            >
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center leading-none">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {/* Admin icon (desktop only) */}
            {isLog && isAdmin && (
              <Link
                to="/adminDashboard"
                className="hidden md:flex relative bg-transparent border-none cursor-pointer text-xl p-1.5 rounded-lg items-center justify-center no-underline text-inherit hover:bg-gray-100 transition-colors"
                aria-label="Admin"
                title="Admin"
              >
                🛠️
              </Link>
            )}

            {/* Contact (desktop only) */}
            <Link
              to="/contact"
              className="hidden md:inline-block px-4 py-[7px] border-[1.5px] border-[#2e6b45] rounded-full text-[#2e6b45] font-semibold text-[13px] no-underline whitespace-nowrap hover:bg-[#e8f5ed] transition-colors"
            >
              Contact Us
            </Link>

            {/* Login / Avatar */}
            {!isLog ? (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-[7px] rounded-full bg-[#2e6b45] text-white border-none cursor-pointer font-semibold text-[13px] whitespace-nowrap hover:bg-[#245537] transition-colors"
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => navigate("/Profilepersonal")}
                aria-label="My Profile"
                title="My Profile"
                className="w-9 h-9 rounded-full bg-[#2e6b45] border-2 border-[#2e6b4530] cursor-pointer flex items-center justify-center p-0 flex-shrink-0 shadow-[0_2px_8px_#2e6b4530] text-white font-bold text-sm overflow-hidden hover:opacity-90 transition-opacity"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  "J"
                )}
              </button>
            )}

            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden flex flex-col justify-center gap-[5px] bg-transparent border-none cursor-pointer p-2 rounded-lg z-[1100] flex-shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-6 h-[2.5px] bg-[#2e6b45] rounded-sm" />
              <span className="block w-6 h-[2.5px] bg-[#2e6b45] rounded-sm" />
              <span className="block w-6 h-[2.5px] bg-[#2e6b45] rounded-sm" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/45 transition-opacity duration-250 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[78%] max-w-[320px] bg-white z-[9999] overflow-y-auto flex flex-col px-5 pt-6 pb-8 shadow-[-4px_0_32px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button
          className="self-end bg-transparent border-none text-[22px] cursor-pointer text-gray-500 p-1 leading-none mb-3 hover:text-gray-800 transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="font-extrabold text-xl text-[#2e6b45] mb-6 pb-4 border-b border-[#e8ede9]">
          JEM 8 Circle
        </div>

        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`block px-4 py-3 rounded-xl no-underline text-[15px] mb-0.5 transition-colors ${
              isActive(to)
                ? "font-bold text-[#2e6b45] bg-[#e8f5ed]"
                : "font-medium text-gray-700 hover:bg-[#e8f5ed] hover:text-[#2e6b45]"
            }`}
          >
            {label}
          </Link>
        ))}

        <Link
          to="/Profilepersonal"
          className={`block px-4 py-3 rounded-xl no-underline text-[15px] mb-0.5 transition-colors ${
            isActive("/Profilepersonal")
              ? "font-bold text-[#2e6b45] bg-[#e8f5ed]"
              : "font-medium text-gray-700 hover:bg-[#e8f5ed] hover:text-[#2e6b45]"
          }`}
        >
          👤 My Profile
        </Link>

        {isLog && isAdmin && (
          <Link
            to="/adminDashboard"
            className={`block px-4 py-3 rounded-xl no-underline text-[15px] mb-0.5 transition-colors ${
              isActive("/adminDashboard")
                ? "font-bold text-[#2e6b45] bg-[#e8f5ed]"
                : "font-medium text-gray-700 hover:bg-[#e8f5ed] hover:text-[#2e6b45]"
            }`}
          >
            🛠️ Admin Dashboard
          </Link>
        )}

        <div className="pt-6 mt-auto">
          <Link
            to="/contact"
            className="flex items-center justify-center px-5 py-3 bg-[#2e6b45] text-white rounded-xl font-bold text-[15px] no-underline hover:bg-[#245537] transition-colors"
          >
            Get a Quote →
          </Link>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════
   FOOTER
══════════════════════════════════ */
export function Footer() {
  const QUICK_LINKS = [
    { to: "/",         label: "Home"     },
    { to: "/products", label: "Products" },
    { to: "/about",    label: "About Us" },
    { to: "/contact",  label: "Contact"  },
  ];

  const PRODUCT_LINKS = [
    { to: "/products?category=office",   label: "Office Supplies, Stationery & Equipment" },
    { to: "/products?category=pantry",   label: "Pantry Supplies"              },
    { to: "/products?category=janitor",  label: "Janitorial Supplies"          },
    { to: "/products?category=wellness", label: "Health & Wellness"            },
    { to: "/products?category=giveaway", label: "Giveaways & Merch"            },
    { to: "/products?category=personal", label: "Personal & Home Care Products"},
  ];

  return (
    <footer className="bg-[#f5f3ef] text-[#4a4a4a]">
      <div className="max-w-[1280px] mx-auto px-5 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand col */}
          <div>
            <img
              src={Logo}
              alt="JEM 8 Circle Trading Co."
              className="object-contain w-auto mb-3 h-14"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <span className="block font-bold text-lg text-[#1e3d2b] mb-3">
              JEM 8 Circle Trading Co.
            </span>
            <p className="text-[13px] leading-relaxed text-[#6b6b6b] mb-4">
              Supply products with quality at the best price. Your trusted one-stop supplier
              for office, pantry, janitorial, and wellness needs across Metro Manila and Laguna.
            </p>
            <div className="text-[12px] leading-relaxed text-[#6b6b6b] mb-5">
              📍 Unit 202P, Cityland 10 Tower 1, HV Dela Costa St., Makati City<br />
              📞 (02) 8805-1432 · (02) 8785-0587<br />
              📧 jem8circletrading@gmail.com
            </div>
            <div className="flex gap-2">
              {["📘", "📸", "🎵", "💬"].map((icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg bg-[#e8e4de] border border-[#d6d0c8] cursor-pointer text-base flex items-center justify-center hover:bg-[#2e6b45] hover:text-white transition-colors"
                  aria-label="Social media"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="font-bold text-[#1e3d2b] text-sm uppercase tracking-wider mb-4">
              Quick Links
            </div>
            <ul className="p-0 m-0 space-y-2 list-none">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-[13px] text-[#6b6b6b] no-underline hover:text-[#2e6b45] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <div className="font-bold text-[#1e3d2b] text-sm uppercase tracking-wider mb-4">
              Our Products
            </div>
            <ul className="p-0 m-0 space-y-2 list-none">
              {PRODUCT_LINKS.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-[13px] text-[#6b6b6b] no-underline hover:text-[#2e6b45] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <div className="font-bold text-[#1e3d2b] text-sm uppercase tracking-wider mb-4">
              Stay Updated
            </div>
            <p className="text-[13px] text-[#6b6b6b] leading-relaxed mb-4">
              Get the latest product updates, promotions, and supply tips delivered to your inbox.
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#d6d0c8] text-[13px] text-[#4a4a4a] placeholder-[#b0a99e] outline-none focus:border-[#2e6b45] transition-colors"
                placeholder="your@email.com"
              />
              <button className="px-4 py-2 rounded-lg bg-[#2e6b45] text-white border-none cursor-pointer text-[13px] font-semibold whitespace-nowrap hover:bg-[#245537] transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-[11px] text-[#9e9890]">
              We won't spam. Read our{" "}
              <Link to="/contact" className="text-[#2e6b45] no-underline hover:underline">
                email policy
              </Link>.
            </p>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#d6d0c8]" />

      {/* Bottom bar */}
      <div className="max-w-[1280px] mx-auto px-5 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-[12px] text-[#9e9890] m-0">
          © 2026 JEM 8 Circle Trading Co. All rights reserved.
        </p>
        <div className="flex gap-5">
          {["Privacy Policy", "Terms & Conditions", "Cookie Policy"].map((label) => (
            <Link
              key={label}
              to="/contact"
              className="text-[12px] text-[#9e9890] no-underline hover:text-[#2e6b45] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}