import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header, Footer } from "./components/Layout";
<<<<<<< HEAD
import { me } from "./api/auth";
=======
import { useState, useEffect } from "react";
import axios from "axios";
>>>>>>> 3cf4e316729ac027f06986d6239a126bb5609430

const img = (w, h, label = "") =>
  `https://placehold.co/${w}x${h}/edf4f0/4d7b65?text=${encodeURIComponent(label)}`;

const PRODUCT_CARDS = [
  {
    id: 1,
    imgSrc: img(800, 500, "Office Supplies"),
    title: "Office Supplies, Stationery & Equipment",
    desc: "A complete range of office essentials — pens, paper, folders, printers, and equipment. Everything your workplace needs, sourced from one trusted supplier.",
  },
  {
    id: 2,
    imgSrc: img(800, 500, "Personal & Home Care"),
    title: "Personal & Home Care Products",
    desc: "From personal hygiene products to home care essentials and everyday consumer goods — we supply both businesses and households with quality brands.",
  },
  {
    id: 3,
    imgSrc: img(800, 500, "Pantry Supplies"),
    title: "Pantry Supplies",
    desc: "Keep your team fueled and happy. We supply coffee, beverages, snacks, and all the pantry essentials that make the office feel like a second home.",
  },
  {
    id: 4,
    imgSrc: img(800, 500, "Giveaways"),
    title: "Customized Items for Giveaways",
    desc: "Boost your brand with custom merchandise and giveaways. We also offer in-house embroidery services to personalize uniforms, caps, bags, and corporate gifts.",
  },
  {
    id: 5,
    imgSrc: img(800, 500, "Janitorial Supplies"),
    title: "Janitorial Supplies",
    desc: "Maintain a clean and safe workplace with our full line of janitorial products — cleaning agents, tools, sanitation supplies, and more.",
  },
  {
    id: 6,
    imgSrc: img(800, 500, "Health & Wellness"),
    title: "Health & Wellness Products",
    desc: "We proudly carry IAM Amazing Pure Organic Barley — a premium wellness product packed with nutrients to support a healthier lifestyle for you and your family.",
  },
];

const WHY_ITEMS = [
  { num: "1", title: "Quality at the Right Price",    desc: "High-standard products at competitive prices — no compromises." },
  { num: "2", title: "One-Stop Shop Convenience",     desc: "Six product categories, one supplier. Save time and simplify procurement." },
  { num: "3", title: "Dedicated & Professional Team", desc: "Every order, big or small, gets the same level of care and commitment." },
];

const FALLBACK_TESTIMONIALS = [
  { name: "Sarah Johnson",   review_text: "Absolutely fantastic service! The team went above and beyond to ensure everything was perfect. Highly recommend to anyone looking for a reliable supplier.", rating: 5 },
  { name: "Michael Chen",    review_text: "Great experience from start to finish. The product quality exceeded my expectations and delivery was super fast. Will definitely order again.", rating: 5 },
  { name: "Emily Rodriguez", review_text: "Outstanding quality and customer care. This is exactly what I was looking for. Will definitely be a returning customer — the giveaways were a hit!", rating: 5 },
];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api",
  withCredentials: true,
  headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
});

/* ── Product Card ── */
function ProductCard({ imgSrc, title, desc }) {
  return (
    <Link
      to="/products"
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col no-underline text-inherit transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#b8d9c8]"
    >
      <div className="w-full overflow-hidden bg-slate-100 aspect-[16/10]">
        <img
          src={imgSrc}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col flex-1 px-6 py-5">
        <h3 className="text-[15px] font-bold text-slate-800 mb-2.5 leading-snug">
          {title}
        </h3>
        <p className="flex-1 mb-4 text-sm leading-relaxed text-slate-500">
          {desc}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4d7b65] self-start transition-all duration-200 group-hover:gap-3 group-hover:text-[#3a5e4e]">
          Shop Now
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="relative flex items-center min-h-screen overflow-hidden bg-gradient-to-br from-[#f9fdf9] via-white to-[#edf4f0]" style={{ paddingTop: "var(--header-h, 80px)" }}>
      {/* Decorative blob */}
      <div className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full bg-[#4d7b65]/5 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[320px] h-[320px] rounded-full bg-[#4d7b65]/4 pointer-events-none" />

      <div className="relative z-10 max-w-[1200px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-14 pt-16 pb-20">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white border border-[#b8d9c8] rounded-full px-4 py-1.5 text-[13px] font-medium text-[#4d7b65] mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 bg-[#4d7b65] rounded-full animate-pulse" />
            Premium Business Supplies
          </div>

          <h1 className="mb-5 text-4xl font-bold leading-tight text-slate-800 sm:text-5xl lg:text-6xl">
            Everything Your{" "}
            <span className="text-[#4d7b65]">Business</span> Needs
          </h1>

          <p className="text-slate-500 leading-[1.8] mb-10 max-w-lg text-base lg:text-lg">
            Discover premium essentials, everyday must-haves, and exclusive finds — all in one
            place. JEM 8 brings quality, convenience, and curated products together for a smarter
            way to shop.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#4d7b65] text-white rounded-xl font-semibold text-[15px] shadow-lg shadow-[#4d7b65]/30 transition-all duration-300 hover:bg-[#3a5e4e] hover:-translate-y-0.5 no-underline"
            >
              🛒 Shop Now
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent border-2 border-[#4d7b65] text-[#4d7b65] rounded-xl font-semibold text-[15px] transition-all duration-300 hover:bg-[#edf4f0] hover:-translate-y-0.5 no-underline"
            >
              Learn More →
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[16/14]">
          <img
            src={img(693, 612, "JEM 8 Products")}
            alt="JEM 8 Circle Trading products showcase"
            className="object-cover w-full h-full"
          />
          {/* Badge overlay */}
          <div className="absolute flex items-center gap-3 px-4 py-3 shadow-lg bottom-6 left-6 bg-white/95 backdrop-blur-md rounded-xl">
            <span className="text-2xl">🏆</span>
            <div>
              <strong className="block text-sm font-bold text-slate-800">Trusted Supplier</strong>
              <span className="text-xs text-slate-500">6 product categories</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Products Section ── */
function ProductsSection() {
  return (
    <section className="py-20 bg-white lg:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase text-[#4d7b65] bg-[#edf4f0] border border-[#b8d9c8] rounded-full px-3.5 py-1 self-start">
            What We Offer
          </span>
          <h2 className="text-3xl font-bold leading-tight text-slate-800 lg:text-4xl">
            Products We Offer
          </h2>
          <p className="text-base text-slate-500">
            Everything your office and home needs — sourced from one trusted supplier.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {PRODUCT_CARDS.map((card) => (
            <ProductCard key={card.id} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Why Choose Us ── */
function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-[#edf4f0] to-white">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase text-[#4d7b65] bg-[#edf4f0] border border-[#b8d9c8] rounded-full px-3.5 py-1 self-start">
            Why JEM 8
          </span>
          <h2 className="text-3xl font-bold leading-tight text-slate-800 lg:text-4xl">
            Why Choose JEM 8 Circle Co.?
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
          {WHY_ITEMS.map((item) => (
            <div
              key={item.num}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm text-center px-8 py-10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#b8d9c8]"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#edf4f0] border-2 border-[#b8d9c8] rounded-full text-2xl font-bold text-[#4d7b65] mx-auto mb-5">
                {item.num}
              </div>
              <h3 className="text-[17px] font-bold text-slate-800 mb-3">
                {item.title}
              </h3>
              <p className="text-[15px] text-slate-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function Testimonials({ reviews }) {
  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-base ${i < rating ? "text-amber-400" : "text-slate-200"}`}>★</span>
      ))}
    </div>
  );

  return (
    <section className="py-20 bg-slate-50 lg:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase text-[#4d7b65] bg-[#edf4f0] border border-[#b8d9c8] rounded-full px-3.5 py-1 self-start">
            What Clients Say
          </span>
          <h2 className="text-3xl font-bold leading-tight text-slate-800 lg:text-4xl">
            Customer Feedback
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mb-5 text-5xl">📝</div>
            <p className="text-base text-slate-500">No reviews yet. Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <div
                key={review.review_id || index}
                className="bg-white rounded-2xl px-7 py-8 border border-slate-200 shadow-sm flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-[#b8d9c8]"
              >
                {/* Stars */}
                {renderStars(review.rating)}

                {/* Text */}
                <p className="text-[15px] text-slate-600 leading-relaxed italic flex-1">
                  "{review.review_text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-[#edf4f0] border-2 border-[#b8d9c8] flex items-center justify-center text-base font-bold text-[#4d7b65] flex-shrink-0">
                    {review.user?.first_name?.[0] || review.name?.[0] || "C"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {review.user
                        ? `${review.user.first_name} ${review.user.last_name}`
                        : review.name || "Customer"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : "Recent"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── CTA Banner ── */
function CtaBanner() {
  return (
    <section className="relative py-20 overflow-hidden bg-slate-800 lg:py-28">
      {/* Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#4d7b65]/20 pointer-events-none blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#4d7b65]/15 pointer-events-none blur-3xl" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
        <h2 className="max-w-2xl mx-auto mb-4 text-3xl font-bold leading-tight text-white lg:text-5xl">
          From Office to Essentials — A Partner That Will Last
        </h2>
        <p className="mb-10 text-base text-white/60">
          From Product to Purpose. Quality you can count on, service you can trust.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#4d7b65] text-white rounded-xl text-[15px] font-semibold border-2 border-[#4d7b65] shadow-lg shadow-[#4d7b65]/30 transition-all duration-300 hover:bg-[#3a5e4e] hover:border-[#3a5e4e] hover:-translate-y-0.5 no-underline"
          >
            Start Shopping →
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-transparent text-white/85 rounded-xl text-[15px] font-semibold border-2 border-white/30 transition-all duration-300 hover:border-white/70 hover:text-white hover:-translate-y-0.5 no-underline"
          >
            Learn About Us
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Loading Spinner ── */
function ReviewsLoading() {
  return (
    <section className="py-20 bg-slate-50 lg:py-28">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#4d7b65] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading reviews...</p>
      </div>
    </section>
  );
}

/* ── Page ── */
export default function Jem8HomePage() {
<<<<<<< HEAD
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  const checkProfile = async () => {
    try {
      const res = await me();
      if (res.status === 200 && res.data.status === "success") {
        const user = res.data.data;
        if (!user.first_name || !user.phone_number) {
          setShowModal(true);
        }
      }
    } catch (err) {
      
    }
  };
  checkProfile();
}, []);
=======
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get("/reviews/latest");
        if (response.data.status === "success") {
          setReviews(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setReviews(FALLBACK_TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);
>>>>>>> 3cf4e316729ac027f06986d6239a126bb5609430

  return (
    <>
      {/* ── Complete Profile Pop-up ── */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.55)", // solid, hindi blur
          zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 20,
            width: "100%", maxWidth: 420,
            boxShadow: "0 40px 100px rgba(0,0,0,0.25)",
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#f0faf4", color: "#2f9e44",
                fontSize: 11, fontWeight: 700,
                padding: "4px 10px", borderRadius: 20,
                marginBottom: 12,
              }}>
                ✦ Complete Profile
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 6 }}>
                Complete your profile
              </div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                You signed in with Google. Please complete your profile details to continue using your account.
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "20px 28px 24px",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <button
                onClick={() => { setShowModal(false); navigate("/Profilepersonal"); }}
                style={{
                  background: "#1a1a1a", color: "#fff", border: "none",
                  borderRadius: 10, padding: "13px 28px",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", width: "100%",
                }}
              >
                Go to Profile →
              </button>
            </div>
          </div>
        </div>
      )}

      <Header />
      <main>
        <Hero />
        <ProductsSection />
        <WhyChooseUs />
        {loading ? <ReviewsLoading /> : <Testimonials reviews={reviews} />}
        <CtaBanner />
      </main>
    </>
  );
}