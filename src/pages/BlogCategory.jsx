import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getBlogs } from '../api/blogs';

const BASE = 'http://127.0.0.1:8000';

/* ─── Slug → display config ───────────────────────────────── */
const CAT_CONFIG = {
  announcement:      { name: 'Announcement',   emoji: '📣', color: 'bg-violet-100 text-violet-700 border-violet-300', dot: 'bg-violet-500' },
  travelblog:        { name: 'Travel Blog',     emoji: '✈️', color: 'bg-sky-100 text-sky-700 border-sky-300',         dot: 'bg-sky-500'    },
  business:          { name: 'Business Trips',  emoji: '💼', color: 'bg-amber-100 text-amber-700 border-amber-300',   dot: 'bg-amber-500'  },
  'product-updates': { name: 'Product Updates', emoji: '📦', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
};

/* ─── Helpers ─────────────────────────────────────────────── */
const resolveImg = (post) => {
  if (!post) return null;
  const imgs = post.images;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const path = imgs[0].url;
    if (!path) return null;
    return path.startsWith('http') ? path : `${BASE}/storage/${path}`;
  }
  return null;
};

const excerpt = (text, n = 160) =>
  text ? (text.length > n ? text.slice(0, n).trim() + '…' : text) : '';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

/**
 * Matches by category_name string — no hardcoded IDs.
 * Works regardless of what ID the DB assigned to each category.
 */
function postMatchesSlug(post, slug) {
  const cfg     = CAT_CONFIG[slug];
  const catName = cfg?.name ?? '';

  // 1. Eager-loaded relation (most reliable)
  if (post.category?.category_name) {
    return post.category.category_name.trim().toLowerCase() === catName.toLowerCase();
  }

  // 2. Flat string field fallback
  if (post.category_name) {
    return post.category_name.trim().toLowerCase() === catName.toLowerCase();
  }

  return false;
}

/* ─── Skeleton ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-slate-200" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 w-24 bg-slate-200 rounded-full" />
        <div className="h-5 w-3/4 bg-slate-200 rounded" />
        <div className="h-3 w-full bg-slate-200 rounded" />
        <div className="h-3 w-5/6 bg-slate-200 rounded" />
        <div className="h-8 w-28 bg-slate-200 rounded-xl mt-1" />
      </div>
    </div>
  );
}

/* ─── Post Card ───────────────────────────────────────────── */
function PostCard({ post, slug }) {
  const imgSrc = resolveImg(post);
  return (
    <Link
      to={`/blog/${slug}/${post.blog_id}`}
      className="bg-white rounded-2xl border border-[#e8f0eb] overflow-hidden flex flex-col no-underline group hover:border-[#4d7b65] hover:shadow-[0_8px_24px_rgba(77,123,101,0.12)] transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-52 bg-[#f3f8f5] overflow-hidden flex-shrink-0">
        {imgSrc ? (
          <img src={imgSrc} alt={post.blog_title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20">📄</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border
            ${post.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
            {post.status ?? 'published'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {post.created_at && (
          <div className="text-[11px] text-slate-400 mb-2">{fmtDate(post.created_at)}</div>
        )}
        <h3 className="text-base font-bold text-[#1a2e22] leading-snug mb-2 line-clamp-2 group-hover:text-[#4d7b65] transition-colors" style={{ fontFamily: "'Georgia', serif" }}>
          {post.blog_title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">
          {excerpt(post.blog_text, 140)}
        </p>
        <span className="self-start flex items-center gap-1.5 px-4 py-2 bg-[#4d7b65] text-white text-xs font-bold rounded-xl group-hover:bg-[#3d6552] transition-colors">
          Read Post <span>→</span>
        </span>
      </div>
    </Link>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export default function BlogCategory() {
  const { category } = useParams();
  const navigate     = useNavigate();
  const cfg          = CAT_CONFIG[category];

  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');

  // Redirect unknown slugs
  useEffect(() => {
    if (!cfg) navigate('/blog', { replace: true });
  }, [cfg, navigate]);

  useEffect(() => {
    if (!cfg) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    getBlogs()
      .then((data) => {
        if (!mounted) return;
        const rows = Array.isArray(data) ? data : (data?.data ?? data?.posts ?? []);

        const matched = rows.filter((p) => postMatchesSlug(p, category));
        console.log(`[BlogCategory] slug="${category}" → ${matched.length} / ${rows.length} posts matched`);

        setPosts(matched);
      })
      .catch((err) => { if (mounted) setError(err?.message || 'Failed to load posts'); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [category, cfg]);

  if (!cfg) return null;

  const filtered = posts.filter((p) =>
    (p.blog_title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8faf9]">

      {/* ── Breadcrumb ── */}
      <div className="bg-[#f8faf9] border-b border-[#e8f0eb] mt-[75px]">
        <div className="container mx-auto px-4 flex items-center gap-3 py-3 text-xs text-[#6b7c70] flex-wrap">
          <Link to="/" className="text-[#4d7b65] no-underline hover:underline">Home</Link>
          <span className="text-gray-300">›</span>
          <Link to="/blog" className="text-[#4d7b65] no-underline hover:underline">Blog</Link>
          <span className="text-gray-300">›</span>
          <span>{cfg.name}</span>
        </div>
      </div>

      {/* ── Hero header ── */}
      <div className="bg-gradient-to-br from-[#1a2e22] to-[#2d5a42] text-white py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{cfg.emoji}</span>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${cfg.color}`}>
              {cfg.name}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Georgia', serif" }}>
            {cfg.name}
          </h1>
          <p className="text-sm text-white/60">
            {loading ? '...' : `${posts.length} post${posts.length !== 1 ? 's' : ''} in this category`}
          </p>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap py-5">
          <Link
            to="/blog"
            className="flex items-center gap-1.5 text-sm text-[#4d7b65] font-semibold no-underline hover:underline"
          >
            ← Back to All Blogs
          </Link>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="pl-8 pr-4 py-2 rounded-xl border border-[#e8f0eb] bg-white text-sm text-slate-700 outline-none w-56 placeholder-slate-400 focus:border-[#4d7b65] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <section className="container mx-auto px-4 pb-20">

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-[#4d7b65] text-white rounded-xl text-sm font-bold cursor-pointer border-none"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-[#1a2e22] mb-2">No posts found</h3>
            <p className="text-sm text-slate-400">
              {search ? `No results for "${search}"` : `No posts in ${cfg.name} yet.`}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 px-4 py-1.5 rounded-xl border border-[#e8f0eb] bg-white text-sm text-slate-600 cursor-pointer hover:border-[#4d7b65] transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs text-slate-400 mb-5">
              Showing {filtered.length} post{filtered.length !== 1 ? 's' : ''}
              {search && <> matching "<strong className="text-slate-600">{search}</strong>"</>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((post) => (
                <PostCard key={post.blog_id} post={post} slug={category} />
              ))}
            </div>
          </>
        )}

      </section>

    </div>
  );
}