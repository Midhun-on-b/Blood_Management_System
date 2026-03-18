import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FadeUp, MonoLabel } from '../components/UI';
import { Search, ArrowRight, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Blood Banking', 'Compliance', 'Technology', 'Kerala Health', 'Case Studies', 'Guides'];

const catColors = {
    'Blood Banking': { bg: 'rgba(217,0,37,0.15)', color: 'var(--red)', border: 'rgba(217,0,37,0.3)' },
    'Compliance': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    'Technology': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
    'Kerala Health': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    'Case Studies': { bg: 'rgba(217,0,37,0.08)', color: 'var(--red)', border: 'rgba(217,0,37,0.2)' },
    'Guides': { bg: 'rgba(168,85,247,0.12)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
};

// Unsplash images mapped per category — dark, dramatic, medical
const catImages = {
    'Blood Banking': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=75&fit=crop',
    'Compliance': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=75&fit=crop',
    'Technology': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=75&fit=crop',
    'Kerala Health': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=75&fit=crop',
    'Case Studies': 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&q=75&fit=crop',
    'Guides': 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=75&fit=crop',
};

const posts = [
    { title: "The O-Negative Crisis: Kerala's Hidden Emergency", cat: 'Blood Banking', date: 'Jan 12, 2025', read: '6 min', excerpt: 'Why O-negative is always the scarcest blood type in Kerala and how HEM∆ tracks demand spikes before they turn critical.' },
    { title: 'Understanding NACO Blood Bank Compliance in 2025', cat: 'Compliance', date: 'Jan 8, 2025', read: '12 min', excerpt: 'A complete breakdown of the new NACO guidelines and what they mean for every blood bank operating in India.' },
    { title: 'AI Demand Forecasting in Blood Banking: A Practical Guide', cat: 'Technology', date: 'Jan 5, 2025', read: '9 min', excerpt: 'How machine learning models trained on Kerala district data predict shortages weeks before they happen.' },
    { title: 'Monsoon Season & Blood Shortages: How to Prepare', cat: 'Kerala Health', date: 'Dec 28, 2024', read: '7 min', excerpt: "Monsoon brings floods and accidents — and blood demand surges. Here's how to stock correctly every June." },
    { title: "From Paper to Digital: A Medical Officer's Transition Guide", cat: 'Guides', date: 'Dec 20, 2024', read: '11 min', excerpt: 'Step-by-step guidance for blood bank teams switching from paper registers to a digital management platform.' },
    { title: 'RFID Tracking in Blood Banks: Implementation Checklist', cat: 'Technology', date: 'Dec 15, 2024', read: '8 min', excerpt: 'Everything your IT team needs to deploy RFID tracking across a multi-facility blood bank network.' },
    { title: 'District Hospital Thrissur: A 90-Day HEM∆ Review', cat: 'Case Studies', date: 'Dec 10, 2024', read: '10 min', excerpt: 'How a mid-size district hospital cut emergency response time by 74% after deploying HEM∆ in 2024.' },
    { title: 'Blood Type Shortage Patterns in Kerala: 3-Year Analysis', cat: 'Blood Banking', date: 'Dec 5, 2024', read: '14 min', excerpt: 'Data from 340+ facilities reveals predictable patterns in O-negative and AB-negative supply across all 14 districts.' },
    { title: 'The Complete Guide to Blood Bank Staff Training', cat: 'Guides', date: 'Nov 28, 2024', read: '16 min', excerpt: 'How to train clinical and administrative staff to get the most from a modern blood management platform.' },
];

function CatBadge({ cat }) {
    const s = catColors[cat] || catColors['Blood Banking'];
    return (
        <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, padding: '4px 10px', borderRadius: 100,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block',
            flexShrink: 0,
        }}>{cat}</span>
    );
}

function PostCard({ post, index }) {
    const [hovered, setHovered] = useState(false);
    const img = catImages[post.cat] || catImages['Blood Banking'];
    const accentColor = (catColors[post.cat] || catColors['Blood Banking']).color;

    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{
                cursor: 'pointer',
                borderRadius: 20,
                overflow: 'hidden',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.3s, box-shadow 0.3s',
                borderColor: hovered ? accentColor.replace('var(--red)', 'rgba(217,0,37,0.5)') : 'var(--border)',
                boxShadow: hovered ? `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor === 'var(--red)' ? 'rgba(217,0,37,0.2)' : accentColor + '33'}` : 'none',
            }}
        >
            {/* Image */}
            <div style={{ position: 'relative', height: 180, overflow: 'hidden', flexShrink: 0 }}>
                <motion.img
                    src={img}
                    alt={post.title}
                    loading="lazy"
                    animate={{ scale: hovered ? 1.06 : 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        filter: 'grayscale(20%) brightness(0.5)',
                        display: 'block',
                    }}
                />
                {/* Red tint overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(160deg, rgba(217,0,37,0.12) 0%, rgba(7,7,11,0.65) 100%)',
                }} />
                {/* Bottom fade */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                    background: 'linear-gradient(to top, var(--card) 0%, transparent 100%)',
                }} />
                {/* Badge sits on the image */}
                <div style={{ position: 'absolute', top: 16, left: 16 }}>
                    <CatBadge cat={post.cat} />
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <h3 style={{
                    fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 17, lineHeight: 1.35,
                    transition: 'color 0.2s',
                    color: hovered ? '#fff' : 'var(--text)',
                }}>
                    {post.title}
                </h3>
                <p style={{
                    fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13,
                    color: 'var(--text2)', lineHeight: 1.7, flex: 1,
                }}>
                    {post.excerpt}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                            <Calendar size={10} />{post.date}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                            <Clock size={10} />{post.read} read
                        </span>
                    </div>
                    <motion.div
                        animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.4 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ArrowRight size={15} color="var(--red)" />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// Stat ticker shown in the hero
function StatPill({ value, label }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '14px 24px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            backdropFilter: 'blur(8px)',
        }}>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 28, color: 'var(--red)', lineHeight: 1 }}>{value}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</span>
        </div>
    );
}

export default function BlogPage() {
    const [activeCat, setActiveCat] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = posts.filter(p =>
        (activeCat === 'All' || p.cat === activeCat) &&
        (search === '' || p.title.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Navbar />
            <div className="noise-overlay" />

            {/* ─── HERO ─── */}
            <section className="grid-bg" style={{ padding: '140px 5% 90px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} className="red-glow-tl" />

                <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
                    {/* Left — headline */}
                    <div>
                        <FadeUp><MonoLabel>KNOWLEDGE BASE · HEMA INSIGHTS</MonoLabel></FadeUp>
                        <FadeUp delay={0.1}>
                            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(52px,8vw,82px)', lineHeight: 0.92, letterSpacing: '0.02em', margin: '20px 0 24px' }}>
                                <span style={{ display: 'block', color: '#fff' }}>INSIGHTS</span>
                                <span style={{ display: 'block', color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.35)' }}>FOR</span>
                                <span style={{ display: 'block', color: 'var(--red)' }}>LEADERS.</span>
                            </h1>
                        </FadeUp>
                        <FadeUp delay={0.18}>
                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', maxWidth: 480, lineHeight: 1.8, marginBottom: 36 }}>
                                Research, case studies, and practical guides for blood bank managers, medical officers, and hospital administrators across Kerala.
                            </p>
                        </FadeUp>

                        {/* Search bar */}
                        <FadeUp delay={0.24}>
                            <div style={{ position: 'relative', maxWidth: 520 }}>
                                <Search size={15} color="var(--text3)" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search articles, case studies, guides…"
                                    style={{
                                        width: '100%', background: 'var(--card)',
                                        border: '1px solid var(--border)', borderRadius: 12,
                                        padding: '14px 20px 14px 46px',
                                        fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff',
                                        outline: 'none', transition: 'border-color 0.25s, box-shadow 0.25s',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--red)'; e.target.style.boxShadow = '0 0 0 3px rgba(217,0,37,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </FadeUp>

                        {/* Stats row */}
                        <FadeUp delay={0.32}>
                            <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                                <StatPill value="9+" label="Articles" />
                                <StatPill value="340+" label="Facilities" />
                                <StatPill value="2.4K" label="Subscribers" />
                            </div>
                        </FadeUp>
                    </div>

                    {/* Right — featured visual */}
                    <FadeUp delay={0.14}>
                        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', height: 420 }}>
                            <img
                                src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=900&q=80&fit=crop"
                                alt="Medical laboratory"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(25%) brightness(0.45)', display: 'block' }}
                            />
                            {/* Overlays */}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, rgba(217,0,37,0.22) 0%, rgba(7,7,11,0.7) 100%)' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)' }} />
                            {/* Scan lines */}
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)', pointerEvents: 'none' }} />

                            {/* Floating stat card */}
                            <div style={{
                                position: 'absolute', bottom: 32, left: 28,
                                background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(217,0,37,0.25)', borderRadius: 16,
                                padding: '18px 24px',
                            }}>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 42, color: 'var(--red)', lineHeight: 1 }}>67%</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13, color: '#fff', marginTop: 4 }}>Less Blood Wastage</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>ERNAKULAM · 90 DAYS</div>
                            </div>

                            {/* Live badge */}
                            <div style={{
                                position: 'absolute', top: 24, right: 24,
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'rgba(10,10,18,0.8)', backdropFilter: 'blur(12px)',
                                border: '1px solid var(--border)', borderRadius: 100,
                                padding: '6px 14px',
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.4s infinite', display: 'inline-block' }} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Data</span>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* ─── FEATURED POST ─── */}
            <section style={{ padding: '0 5% 72px' }}>
                <FadeUp>
                    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 3, height: 18, background: 'var(--red)', borderRadius: 2 }} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Featured Case Study</span>
                        </div>

                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 420px', gap: 0,
                            borderRadius: 24, overflow: 'hidden',
                            border: '1px solid var(--border)',
                            background: 'var(--card)',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                        }}>
                            {/* Left content */}
                            <div style={{ padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <CatBadge cat="Case Studies" />
                                    <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 'clamp(22px,3vw,34px)', lineHeight: 1.22, margin: '20px 0 18px', maxWidth: 520 }}>
                                        How Ernakulam District Reduced Blood Wastage by 67% in 90 Days
                                    </h2>
                                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 500, marginBottom: 28 }}>
                                        A deep dive into how three Ernakulam hospitals deployed HEM∆ and transformed their blood inventory management — cutting wastage, improving response times, and hitting full NACO compliance.
                                    </p>
                                </div>

                                <div>
                                    {/* Author */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>AK</div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14 }}>Dr. Anitha Krishnan</div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Jan 15, 2025 · 8 min read</div>
                                        </div>
                                    </div>

                                    {/* Metrics row */}
                                    <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
                                        {[['67%', 'Wastage Reduced'], ['74%', 'Faster Response'], ['94%', 'Compliance Score']].map(([v, l]) => (
                                            <div key={l}>
                                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, color: 'var(--red)', lineHeight: 1 }}>{v}</div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <a href="#" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 10,
                                        color: '#fff', background: 'var(--red)',
                                        fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 14,
                                        padding: '12px 24px', borderRadius: 100, textDecoration: 'none',
                                        transition: 'opacity 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >
                                        Read Full Case Study <ArrowRight size={15} />
                                    </a>
                                </div>
                            </div>

                            {/* Right image panel */}
                            <div style={{ position: 'relative', overflow: 'hidden', minHeight: 480 }}>
                                <img
                                    src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=700&q=80&fit=crop"
                                    alt="Ernakulam hospital case study"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%) brightness(0.45)', display: 'block' }}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, transparent 50%, var(--card) 100%)' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(217,0,37,0.18) 0%, rgba(7,7,11,0.5) 100%)' }} />
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    </div>
                </FadeUp>
            </section>

            {/* ─── CATEGORY FILTERS ─── */}
            <section style={{ padding: '0 5% 48px' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 4 }}>Filter:</span>
                        {CATEGORIES.map(cat => {
                            const isActive = activeCat === cat;
                            const s = catColors[cat];
                            return (
                                <motion.button
                                    key={cat}
                                    onClick={() => setActiveCat(cat)}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    style={{
                                        fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 12,
                                        padding: '7px 16px', borderRadius: 100, cursor: 'pointer',
                                        border: isActive
                                            ? (s ? `1px solid ${s.border}` : '1px solid rgba(217,0,37,0.4)')
                                            : '1px solid var(--border)',
                                        background: isActive
                                            ? (s ? s.bg : 'rgba(217,0,37,0.12)')
                                            : 'transparent',
                                        color: isActive
                                            ? (s ? s.color : 'var(--red)')
                                            : 'var(--text2)',
                                        transition: 'all 0.2s',
                                        letterSpacing: '0.03em',
                                        textTransform: 'uppercase',
                                        position: 'relative',
                                    }}
                                >
                                    {cat}
                                    {isActive && cat !== 'All' && (
                                        <motion.span
                                            layoutId="cat-indicator"
                                            style={{
                                                position: 'absolute', inset: 0,
                                                borderRadius: 100,
                                                border: `1px solid ${s ? s.color : 'var(--red)'}`,
                                                opacity: 0.4,
                                                pointerEvents: 'none',
                                            }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}

                        {/* Article count */}
                        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                            {filtered.length} article{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </section>

            {/* ─── POST GRID ─── */}
            <section style={{ padding: '0 5% var(--section-pad)' }}>
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <AnimatePresence mode="wait">
                        {filtered.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}
                            >
                                No articles found. Try a different search or category.
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeCat + search}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                    gap: 24,
                                }}
                            >
                                {filtered.map((post, i) => (
                                    <PostCard key={post.title} post={post} index={i} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* ─── NEWSLETTER ─── */}
            <section style={{ padding: '80px 5% 96px', background: '#0A0A12', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                {/* Background accent */}
                <div style={{
                    position: 'absolute', right: '-10%', top: '50%', transform: 'translateY(-50%)',
                    width: 600, height: 600, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(217,0,37,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <FadeUp>
                    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                        <MonoLabel style={{ marginBottom: 16 }}>WEEKLY NEWSLETTER</MonoLabel>
                        <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 'clamp(24px,4vw,38px)', marginBottom: 14 }}>
                            Stay Ahead of Healthcare
                        </h2>
                        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 36 }}>
                            Weekly insights on blood banking, Kerala health policy, and HEM∆ platform updates. No spam, unsubscribe anytime.
                        </p>

                        {/* Email input + CTA */}
                        <div style={{
                            display: 'flex', gap: 0, borderRadius: 14, overflow: 'hidden',
                            border: '1px solid var(--border)',
                            boxShadow: '0 0 0 1px transparent',
                            transition: 'box-shadow 0.2s',
                            maxWidth: 500, margin: '0 auto',
                        }}>
                            <input
                                placeholder="your@hospital.com"
                                style={{
                                    flex: 1, background: 'var(--card)', border: 'none',
                                    padding: '16px 20px',
                                    fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none',
                                }}
                            />
                            <button className="btn-primary" style={{ borderRadius: 0, padding: '16px 28px', fontSize: 14, whiteSpace: 'nowrap' }}>
                                Subscribe →
                            </button>
                        </div>

                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 20, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                            <span>◈ 2,400+ healthcare professionals</span>
                            <span>◈ Every Friday</span>
                            <span>◈ No spam</span>
                        </div>
                    </div>
                </FadeUp>
            </section>

            <Footer />
        </div>
    );
}