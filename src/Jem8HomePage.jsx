import { Link } from "react-router-dom";
import { Header, Footer } from "./components/Layout";

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

const TESTIMONIALS = [
  { name: "Sarah Johnson",   role: "Business Owner", review: "Absolutely fantastic service! The team went above and beyond to ensure everything was perfect. Highly recommend to anyone looking for a reliable supplier." },
  { name: "Michael Chen",    role: "Office Manager", review: "Great experience from start to finish. The product quality exceeded my expectations and delivery was super fast. Will definitely order again." },
  { name: "Emily Rodriguez", role: "HR Director",    review: "Outstanding quality and customer care. This is exactly what I was looking for. Will definitely be a returning customer — the giveaways were a hit!" },
];

/* ── Product Card ── */
function ProductCard({ imgSrc, title, desc }) {
  return (
    <Link
      to="/products"
      className="group bg-white rounded-[16px] overflow-hidden border border-[#e2e8f0] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:-translate-y-[6px] hover:border-[#b8d9c8] no-underline text-inherit"
    >
      {/* Image */}
      <div className="w-full overflow-hidden bg-[#f1f5f9]" style={{ aspectRatio: "16/10" }}>
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-[1.06]"
        />
      </div>

      {/* Body */}
      <div className="px-[24px] py-[22px] flex-1 flex flex-col">
        <h3 className="text-[15px] font-bold text-[#1e293b] mb-[10px] leading-[1.4]">
          {title}
        </h3>
        <p className="text-[14px] text-[#64748b] leading-[1.65] flex-1 mb-[18px]">
          {desc}
        </p>
        <span className="inline-flex items-center gap-[7px] text-[14px] font-semibold text-[#4d7b65] transition-all duration-200 self-start group-hover:text-[#3a5e4e] group-hover:gap-[12px]">
          Shop Now
          <span className="transition-transform duration-200 group-hover:translate-x-[4px]">→</span>
        </span>
      </div>
    </Link>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section
      className="relative overflow-hidden flex items-center min-h-screen"
      style={{
        paddingTop: "var(--header-h)",
        background: "linear-gradient(135deg, #f9fdf9 0%, #fff 50%, #edf4f0 100%)",
      }}
    >
      {/* Decorative blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-160px", right: "-160px",
          width: "560px", height: "560px",
          background: "radial-gradient(circle, rgba(77,123,101,0.09) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative z-[1] max-w-[1200px] w-full mx-auto px-[24px] grid items-center gap-[60px] pt-[60px] pb-[80px]"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Left: content */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-[9px] bg-white border border-[#b8d9c8] rounded-full px-[18px] py-[7px] text-[13px] font-medium text-[#4d7b65] mb-[24px]">
            <span
              className="w-[6px] h-[6px] bg-[#4d7b65] rounded-full"
              style={{ animation: "pulse-dot 2s infinite" }}
            />
            Premium Business Supplies
          </div>

          <h1
            className="font-bold text-[#1e293b] leading-[1.15] mb-[20px]"
            style={{ fontSize: "clamp(36px, 4.5vw, 60px)", fontFamily: "var(--font-heading)" }}
          >
            Everything Your <span className="text-[#4d7b65]">Business</span> Needs
          </h1>

          <p
            className="text-[#64748b] leading-[1.8] mb-[40px] max-w-[480px]"
            style={{ fontSize: "clamp(14px, 1.5vw, 17px)" }}
          >
            Discover premium essentials, everyday must-haves, and exclusive finds — all in one
            place. JEM 8 brings quality, convenience, and curated products together for a smarter
            way to shop.
          </p>

          <div className="flex items-center gap-[16px] flex-wrap">
            <Link
              to="/products"
              className="inline-flex items-center gap-[8px] px-[28px] py-[13px] bg-[#4d7b65] text-white rounded-[10px] font-semibold text-[15px] shadow-[0_4px_16px_rgba(77,123,101,0.35)] transition-all duration-300 hover:bg-[#3a5e4e] hover:-translate-y-[2px] no-underline"
            >
              🛒 Shop Now
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-[8px] px-[28px] py-[13px] bg-transparent border-2 border-[#4d7b65] text-[#4d7b65] rounded-[10px] font-semibold text-[15px] transition-all duration-300 hover:bg-[#edf4f0] hover:-translate-y-[2px] no-underline"
            >
              Learn More →
            </Link>
          </div>
        </div>

        {/* Right: image */}
        <div
          className="relative rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
          style={{ aspectRatio: "1 / 0.88" }}
        >
          <img
            src={img(693, 612, "JEM 8 Products")}
            alt="JEM 8 Circle Trading products showcase"
            className="w-full h-full object-cover"
          />
          {/* Float badge */}
          <div className="absolute bottom-[24px] left-[24px] flex items-center gap-[12px] bg-white/95 backdrop-blur-[8px] rounded-[10px] px-[18px] py-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            <span className="text-[24px]">🏆</span>
            <div>
              <strong className="block text-[14px] font-bold text-[#1e293b]">Trusted Supplier</strong>
              <span className="text-[12px] text-[#64748b]">6 product categories</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </section>
  );
}

/* ── Products Section ── */
function ProductsSection() {
  return (
    <section
      className="bg-white"
      style={{ padding: "clamp(64px, 8vw, 120px) 0" }}
    >
      <div className="max-w-[1200px] mx-auto px-[24px]">
        {/* Header */}
        <div
          className="flex flex-col gap-[12px]"
          style={{ marginBottom: "clamp(40px, 6vw, 72px)" }}
        >
          <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase text-[#4d7b65] bg-[#edf4f0] border border-[#b8d9c8] rounded-full px-[14px] py-[5px] self-start">
            What We Offer
          </span>
          <h2
            className="font-bold text-[#1e293b] leading-[1.2]"
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px, 3.5vw, 42px)" }}
          >
            Products We Offer
          </h2>
          <p className="text-[16px] text-[#64748b]">
            Everything your office and home needs — sourced from one trusted supplier.
          </p>
        </div>

        {/* Grid */}
        <div
          className="grid gap-[28px]"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {PRODUCT_CARDS.map((card) => <ProductCard key={card.id} {...card} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Why Choose Us ── */
function WhyChooseUs() {
  return (
    <section
      className=""
      style={{
        padding: "clamp(64px, 8vw, 120px) 0",
        background: "linear-gradient(180deg, #edf4f0 0%, #fff 100%)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-[24px]">
        {/* Header */}
        <div
          className="flex flex-col gap-[12px]"
          style={{ marginBottom: "clamp(40px, 6vw, 72px)" }}
        >
          <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase text-[#4d7b65] bg-[#edf4f0] border border-[#b8d9c8] rounded-full px-[14px] py-[5px] self-start">
            Why JEM 8
          </span>
          <h2
            className="font-bold text-[#1e293b] leading-[1.2]"
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px, 3.5vw, 42px)" }}
          >
            Why Choose JEM 8 Circle Co.?
          </h2>
        </div>

        {/* Grid */}
        <div
          className="grid gap-[28px]"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {WHY_ITEMS.map((item) => (
            <div
              key={item.num}
              className="group bg-white rounded-[16px] border border-[#e2e8f0] shadow-sm transition-all duration-300 text-center hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:-translate-y-[5px] hover:border-[#b8d9c8]"
              style={{ padding: "clamp(32px, 4vw, 48px) clamp(24px, 3vw, 36px)" }}
            >
              {/* Number circle */}
              <div className="inline-flex items-center justify-center w-[56px] h-[56px] bg-[#edf4f0] border-2 border-[#b8d9c8] rounded-full text-[24px] font-bold text-[#4d7b65] mx-auto mb-[20px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {item.num}
              </div>
              <h3 className="text-[17px] font-bold text-[#1e293b] mb-[12px]">
                {item.title}
              </h3>
              <p className="text-[15px] text-[#64748b] leading-[1.7]">
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
function Testimonials() {
  return (
    <section
      className="bg-[#f1f5f9]"
      style={{ padding: "clamp(64px, 8vw, 120px) 0" }}
    >
      <div className="max-w-[1200px] mx-auto px-[24px]">
        {/* Header */}
        <div
          className="flex flex-col gap-[12px]"
          style={{ marginBottom: "clamp(40px, 6vw, 64px)" }}
        >
          <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase text-[#4d7b65] bg-[#edf4f0] border border-[#b8d9c8] rounded-full px-[14px] py-[5px] self-start">
            What Clients Say
          </span>
          <h2
            className="font-bold text-[#1e293b] leading-[1.2]"
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px, 3.5vw, 42px)" }}
          >
            Customer Feedback
          </h2>
        </div>

        {/* Grid */}
        <div
          className="grid gap-[24px]"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {TESTIMONIALS.map((fb) => (
            <div
              key={fb.name}
              className="bg-white rounded-[16px] px-[28px] py-[32px] border border-[#e2e8f0] shadow-sm transition-all duration-300 flex flex-col gap-[16px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:-translate-y-[4px] hover:border-[#b8d9c8]"
            >
              {/* Stars */}
              <div className="text-[#f5a623] text-[16px] tracking-[2px]">★★★★★</div>

              {/* Review */}
              <p className="text-[15px] text-[#555] leading-[1.75] italic flex-1">
                "{fb.review}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-[12px] pt-[16px] border-t border-[#e2e8f0]">
                <div className="w-[40px] h-[40px] rounded-full bg-[#edf4f0] border-2 border-[#b8d9c8] flex items-center justify-center text-[16px] font-bold text-[#4d7b65] flex-shrink-0"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {fb.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#1e293b]">{fb.name}</div>
                  <div className="text-[12px] text-[#64748b]">{fb.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ── */
function CtaBanner() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "#1e293b",
        padding: "clamp(64px, 8vw, 110px) 0",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-100px", left: "-100px", width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(77,123,101,0.2) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-100px", right: "-100px", width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(77,123,101,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-[1] max-w-[1200px] mx-auto px-[24px] text-center">
        <h2
          className="font-bold text-white leading-[1.25] mb-[16px] mx-auto"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(26px, 3.5vw, 46px)",
            maxWidth: "680px",
          }}
        >
          From Office to Essentials — A Partner That Will Last
        </h2>
        <p className="text-[16px] text-white/60 mb-[40px]">
          From Product to Purpose. Quality you can count on, service you can trust.
        </p>

        <div className="flex items-center justify-center gap-[16px] flex-wrap">
          <Link
            to="/products"
            className="inline-flex items-center gap-[10px] px-[32px] py-[14px] bg-[#4d7b65] text-white rounded-[10px] text-[15px] font-semibold border-2 border-[#4d7b65] shadow-[0_4px_16px_rgba(77,123,101,0.35)] transition-all duration-300 hover:bg-[#3a5e4e] hover:border-[#3a5e4e] hover:-translate-y-[2px] no-underline"
          >
            Start Shopping →
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-[10px] px-[32px] py-[14px] bg-transparent text-white/85 rounded-[10px] text-[15px] font-semibold border-2 border-white/30 transition-all duration-300 hover:border-white/70 hover:text-white hover:-translate-y-[2px] no-underline"
          >
            Learn About Us
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Page ── */
export default function Jem8HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductsSection />
        <WhyChooseUs />
        <Testimonials />
        <CtaBanner />
      </main>
    </>
  );
}