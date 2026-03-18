import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FadeUp, MonoLabel } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, ChevronDown, CheckCircle, Zap, Clock, Shield, Radio } from 'lucide-react';

const roles = ['Medical Officer', 'Hospital Administrator', 'Blood Bank Director', 'IT Manager', 'Government Official', 'Other'];
const interests = ['Request a Demo', 'Pricing Information', 'Technical Integration', 'Partnership', 'Press / Media', 'Support'];

const faqItems = [
    { q: 'How quickly can HEM∆ be deployed at our hospital?', a: 'Basic deployment takes 2–3 hours. Full data migration, training, and go-live is typically completed within 3–5 business days.' },
    { q: 'Do you offer on-site training in Malayalam?', a: 'Yes. Our Kerala-based team delivers on-site training in both English and Malayalam for clinical and administrative staff.' },
    { q: 'Is there a government procurement option?', a: 'Yes. HEM∆ is available through GEM (Government e-Marketplace) and supports Kerala Government procurement frameworks.' },
    { q: 'Can we migrate data from our existing system?', a: 'Yes. We provide free data migration support for CSV, Excel, and most major blood bank management systems.' },
    { q: 'What support do you offer after onboarding?', a: 'All plans include email support. Hospital and Enterprise plans include 24/7 priority support and a dedicated account manager.' },
];

const responseTimeFeatures = [
    { icon: <Zap size={14} />, label: '4hr response', sub: 'Business hours' },
    { icon: <Clock size={14} />, label: '24/7 emergency', sub: 'Critical line' },
    { icon: <Shield size={14} />, label: 'SSL encrypted', sub: 'End-to-end' },
    { icon: <Radio size={14} />, label: 'Kerala-based', sub: 'Local team' },
];

// ─── GEOGRAPHICALLY ACCURATE district nodes ───
// Mapped from real lat/lon → SVG viewport (100 wide × 240 tall)
// lat range: 8.18°N (south) → 12.80°N (north)
// lon range: 74.85°E (west) → 77.42°E (east)
const districtNodes = [
    { name: 'Thiruvananthapuram', x: 81.2, y: 222.1, hq: true },
    { name: 'Kollam', x: 67.7, y: 203.3 },
    { name: 'Pathanamthitta', x: 75.4, y: 183.7 },
    { name: 'Alappuzha', x: 57.9, y: 171.5 },
    { name: 'Kottayam', x: 65.1, y: 166.7 },
    { name: 'Idukki', x: 82.6, y: 153.3 },
    { name: 'Ernakulam', x: 56.4, y: 146.3 },
    { name: 'Thrissur', x: 53.1, y: 118.1 },
    { name: 'Palakkad', x: 70.2, y: 105.1 },
    { name: 'Malappuram', x: 47.6, y: 91.4 },
    { name: 'Kozhikode', x: 36.2, y: 80.1 },
    { name: 'Wayanad', x: 49.9, y: 57.9 },
    { name: 'Kannur', x: 20.2, y: 48.1 },
    { name: 'Kasaragod', x: 5.4, y: 15.7 },
];

// Accurate Kerala outline path (svg 100×240)
const KERALA_PATH =
    "M 91.44,240 L 97.28,236.36 L 94.55,228.57 L 88.33,220.78 " +
    "L 93.39,211.43 L 89.88,197.4 L 87.55,181.82 L 99.22,166.23 " +
    "L 95.33,150.65 L 91.44,140.26 L 85.6,129.87 L 81.71,119.48 " +
    "L 82.88,103.9 L 70.04,88.31 L 66.15,72.73 L 60.31,59.74 " +
    "L 48.64,46.75 L 42.8,36.36 L 29.18,25.97 L 17.51,15.58 " +
    "L 3.89,0 L 1.95,12.99 L 3.11,25.97 L 5.06,41.56 " +
    "L 7.78,54.55 L 15.56,67.53 L 31.13,80.52 L 36.96,93.51 " +
    "L 43.97,106.49 L 44.75,119.48 L 51.75,135.06 L 46.69,150.65 " +
    "L 52.53,166.23 L 52.53,181.82 L 58.37,197.4 L 66.15,212.99 " +
    "L 77.82,228.57 L 83.66,238.96 Z";

// ─── Kerala Network Map Component ───
function KeralaNetworkMap() {
    const [activeNode, setActiveNode] = useState(null);
    const [pulseIdx, setPulseIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setPulseIdx(p => (p + 1) % districtNodes.length), 900);
        return () => clearInterval(t);
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Card header */}
            <div style={{
                borderBottom: '1px solid var(--border)',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    KERALA NETWORK · LIVE
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    14 nodes online
                </span>
            </div>

            {/* Map */}
            <div style={{ padding: '20px 16px 28px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <svg
                    viewBox="0 0 100 240"
                    style={{ width: '100%', maxWidth: 200, overflow: 'visible' }}
                    aria-label="Kerala district map"
                >
                    {/* ── Kerala outline fill ── */}
                    <path
                        d={KERALA_PATH}
                        fill="rgba(217,0,37,0.06)"
                        stroke="rgba(217,0,37,0.25)"
                        strokeWidth="0.6"
                        strokeLinejoin="round"
                    />

                    {/* ── Subtle grid lines inside shape ── */}
                    {[60, 90, 120, 150, 180, 210].map(y => (
                        <line key={y} x1={0} y1={y} x2={100} y2={y}
                            stroke="rgba(217,0,37,0.05)" strokeWidth="0.3" strokeDasharray="2 3" />
                    ))}

                    {/* ── Connection lines between adjacent nodes ── */}
                    {[
                        [0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5],
                        [4, 6], [3, 6], [6, 7], [5, 8], [7, 8], [7, 9],
                        [8, 9], [9, 10], [9, 11], [10, 12], [11, 12],
                        [12, 13],
                    ].map(([a, b], i) => {
                        const na = districtNodes[a], nb = districtNodes[b];
                        return (
                            <line key={i}
                                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                                stroke="rgba(217,0,37,0.2)"
                                strokeWidth="0.35"
                                strokeDasharray="1.5 2"
                            />
                        );
                    })}

                    {/* ── District nodes ── */}
                    {districtNodes.map((node, i) => {
                        const isActive = activeNode === node.name;
                        const isPulse = pulseIdx === i;
                        return (
                            <g
                                key={node.name}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setActiveNode(node.name)}
                                onMouseLeave={() => setActiveNode(null)}
                            >
                                {/* Travelling pulse ring */}
                                {isPulse && (
                                    <motion.circle
                                        cx={node.x} cy={node.y}
                                        r={2}
                                        fill="none"
                                        stroke="rgba(217,0,37,0.7)"
                                        strokeWidth="0.5"
                                        initial={{ r: 1.5, opacity: 1 }}
                                        animate={{ r: 6, opacity: 0 }}
                                        transition={{ duration: 1.1, ease: 'easeOut' }}
                                    />
                                )}
                                {/* Hover ring */}
                                {isActive && (
                                    <motion.circle
                                        cx={node.x} cy={node.y}
                                        r={4}
                                        fill="rgba(217,0,37,0.12)"
                                        stroke="rgba(217,0,37,0.5)"
                                        strokeWidth="0.5"
                                        initial={{ r: 0, opacity: 0 }}
                                        animate={{ r: 4, opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                                {/* HQ star (Thiruvananthapuram) */}
                                {node.hq ? (
                                    <polygon
                                        points={`${node.x},${node.y - 3.2} ${node.x + 1.2},${node.y - 1} ${node.x + 3},${node.y - 1} ${node.x + 1.5},${node.y + 0.8} ${node.x + 2},${node.y + 3} ${node.x},${node.y + 1.8} ${node.x - 2},${node.y + 3} ${node.x - 1.5},${node.y + 0.8} ${node.x - 3},${node.y - 1} ${node.x - 1.2},${node.y - 1}`}
                                        fill="var(--red)"
                                        opacity={0.9}
                                    />
                                ) : (
                                    <circle
                                        cx={node.x} cy={node.y}
                                        r={isActive ? 2.2 : 1.6}
                                        fill={isActive ? '#fff' : 'rgba(217,0,37,0.85)'}
                                        style={{ transition: 'r 0.15s, fill 0.15s' }}
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* ── Label for hovered node ── */}
                    {activeNode && (() => {
                        const node = districtNodes.find(n => n.name === activeNode);
                        if (!node) return null;
                        const labelX = node.x > 60 ? node.x - 3 : node.x + 3;
                        const anchor = node.x > 60 ? 'end' : 'start';
                        return (
                            <text
                                x={labelX} y={node.y - 4}
                                textAnchor={anchor}
                                fill="#fff"
                                fontSize="5.5"
                                fontFamily="var(--font-mono)"
                                fontWeight="600"
                                style={{ pointerEvents: 'none', letterSpacing: '0.03em' }}
                            >
                                {node.name}
                            </text>
                        );
                    })()}
                </svg>
            </div>

            {/* Legend */}
            <div style={{
                padding: '10px 20px 16px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: 20,
                flexWrap: 'wrap',
            }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--red)', fontSize: 11 }}>★</span> Headquarters
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(217,0,37,0.85)', display: 'inline-block' }} /> District Office
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'rgba(217,0,37,0.5)', fontSize: 10 }}>╌</span> Network Link
                </span>
            </div>
        </div>
    );
}

// ─── Status Ticker ───
function StatusTicker() {
    const messages = [
        '● SYSTEM ONLINE · 340+ FACILITIES ACTIVE',
        '● RESPONSE TIME: 3.2 HRS AVG',
        '● 14 DISTRICTS · ALL NODES CONNECTED',
        '● ENCRYPTED CHANNEL · END-TO-END SECURE',
    ];
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setCurrent(c => (c + 1) % messages.length), 3200);
        return () => clearInterval(t);
    }, []);
    return (
        <div style={{
            background: 'rgba(217,0,37,0.06)', border: '1px solid rgba(217,0,37,0.18)',
            borderRadius: 8, padding: '8px 16px', overflow: 'hidden', marginBottom: 28,
        }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.08em' }}
                >
                    {messages[current]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ─── Form helpers ───
const inputBase = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
    padding: '13px 16px', fontFamily: 'var(--font-body)', fontSize: 14,
    color: '#fff', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    boxSizing: 'border-box',
};

function Field({ label, required, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 4 }}>
                {required && <span style={{ color: 'var(--red)', fontSize: 11 }}>▸</span>}
                {label}{required && ' *'}
            </label>
            {children}
        </div>
    );
}

function SmartInput({ type = 'text', placeholder }) {
    const [focused, setFocused] = useState(false);
    return (
        <input type={type} placeholder={placeholder}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...inputBase, borderColor: focused ? 'rgba(217,0,37,0.6)' : 'rgba(255,255,255,0.08)', boxShadow: focused ? '0 0 0 3px rgba(217,0,37,0.08)' : 'none', background: focused ? 'rgba(217,0,37,0.03)' : 'rgba(255,255,255,0.03)' }}
        />
    );
}

function SmartTextarea({ placeholder, rows = 5 }) {
    const [focused, setFocused] = useState(false);
    return (
        <textarea rows={rows} placeholder={placeholder}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...inputBase, resize: 'vertical', lineHeight: 1.7, borderColor: focused ? 'rgba(217,0,37,0.6)' : 'rgba(255,255,255,0.08)', boxShadow: focused ? '0 0 0 3px rgba(217,0,37,0.08)' : 'none', background: focused ? 'rgba(217,0,37,0.03)' : 'rgba(255,255,255,0.03)' }}
        />
    );
}

function SmartSelect({ options }) {
    const [focused, setFocused] = useState(false);
    return (
        <select onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...inputBase, cursor: 'pointer', borderColor: focused ? 'rgba(217,0,37,0.6)' : 'rgba(255,255,255,0.08)', boxShadow: focused ? '0 0 0 3px rgba(217,0,37,0.08)' : 'none', background: '#0a0a14', appearance: 'none', WebkitAppearance: 'none' }}
        >
            <option value="" style={{ background: '#0a0a14' }}>Select your role</option>
            {options.map(r => <option key={r} value={r} style={{ background: '#0a0a14' }}>{r}</option>)}
        </select>
    );
}

function FAQItem({ q, a, index }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${open ? 'rgba(217,0,37,0.3)' : 'var(--border)'}`, background: open ? 'rgba(217,0,37,0.04)' : 'var(--card)', transition: 'border-color 0.25s, background 0.25s', cursor: 'pointer' }}
            onClick={() => setOpen(o => !o)}
        >
            <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', flexShrink: 0 }}>{String(index + 1).padStart(2, '0')}</span>
                    <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 15 }}>{q}</span>
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ color: open ? 'var(--red)' : 'var(--text3)', flexShrink: 0 }}>
                    <ChevronDown size={16} />
                </motion.div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 24px 20px 52px' }}>
                            <div style={{ width: '100%', height: 1, background: 'rgba(217,0,37,0.15)', marginBottom: 14 }} />
                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>{a}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Main Page ───
export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [checked, setChecked] = useState([]);
    const [formProgress, setFormProgress] = useState(0);

    const toggleInterest = i => setChecked(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i]);
    useEffect(() => { setFormProgress(Math.min(100, checked.length * 17)); }, [checked]);

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <Navbar />
            <div className="noise-overlay" />

            {/* ─── HERO ─── */}
            <section className="grid-bg" style={{ padding: '140px 5% 60px', position: 'relative', overflow: 'hidden', minHeight: '52vh', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} className="red-glow-l" />
                {/* Concentric radar rings */}
                <div style={{ position: 'absolute', right: '6%', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.13 }}>
                    {[160, 240, 320, 400].map((r, i) => (
                        <div key={r} style={{ position: 'absolute', width: r, height: r, borderRadius: '50%', border: '1px solid var(--red)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: `pulse ${2.5 + i * 0.6}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }} />
                    ))}
                    <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'var(--red)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', boxShadow: '0 0 20px rgba(217,0,37,0.8)' }} />
                </div>

                <div style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
                    <FadeUp><StatusTicker /><MonoLabel>TRANSMISSION CHANNEL · OPEN</MonoLabel></FadeUp>
                    <FadeUp delay={0.1}>
                        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(60px,10vw,100px)', lineHeight: 0.88, letterSpacing: '0.03em', margin: '20px 0 28px' }}>
                            <span style={{ display: 'block', color: '#fff' }}>INITIATE</span>
                            <span style={{ display: 'block', color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>CONTACT</span>
                            <span style={{ display: 'block', color: 'var(--red)' }}>PROTOCOL<span style={{ opacity: 0.45 }}>.</span></span>
                        </h1>
                    </FadeUp>
                    <FadeUp delay={0.2}>
                        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, color: 'var(--text2)', maxWidth: 460, lineHeight: 1.8 }}>
                            Whether you're a hospital administrator, blood bank director, or Kerala Health Department official — our team is standing by.
                        </p>
                    </FadeUp>
                </div>
            </section>

            {/* ─── MAIN: FORM + INFO ─── */}
            <section style={{ padding: '64px 5% var(--section-pad)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, alignItems: 'start' }}>

                    {/* LEFT — FORM */}
                    <FadeUp>
                        <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--card)' }}>
                            {/* Terminal top bar */}
                            <div style={{ background: 'rgba(217,0,37,0.06)', borderBottom: '1px solid rgba(217,0,37,0.15)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        HEM∆ · SECURE CHANNEL · REQUEST TRANSMISSION
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 72, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                        <motion.div style={{ height: '100%', background: 'var(--red)', borderRadius: 2 }} animate={{ width: `${formProgress}%` }} transition={{ duration: 0.4 }} />
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{formProgress}%</span>
                                </div>
                            </div>

                            <div style={{ padding: '40px 40px 44px' }}>
                                <AnimatePresence mode="wait">
                                    {!submitted ? (
                                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
                                            <div style={{ marginBottom: 28 }}>
                                                <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 26, marginBottom: 6 }}>Send a Message</h2>
                                                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14, color: 'var(--text2)' }}>
                                                    Fields marked <span style={{ color: 'var(--red)' }}>▸</span> are required. We respond within 4 hours.
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                    <Field label="Full Name" required><SmartInput placeholder="Dr. / Mr. / Ms." /></Field>
                                                    <Field label="Email Address" required><SmartInput type="email" placeholder="you@hospital.com" /></Field>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                    <Field label="Phone Number"><SmartInput type="tel" placeholder="+91" /></Field>
                                                    <Field label="Organization" required><SmartInput placeholder="Hospital / Clinic" /></Field>
                                                </div>
                                                <Field label="Your Role"><SmartSelect options={roles} /></Field>
                                                <Field label="I'm interested in">
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                                                        {interests.map(i => {
                                                            const active = checked.includes(i);
                                                            return (
                                                                <motion.label key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                                    style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: active ? '#fff' : 'var(--text2)', background: active ? 'rgba(217,0,37,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? 'rgba(217,0,37,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, padding: '8px 14px', transition: 'all 0.2s' }}
                                                                    onClick={() => toggleInterest(i)}
                                                                >
                                                                    {active && <span style={{ color: 'var(--red)', fontSize: 10 }}>◈</span>}
                                                                    {i}
                                                                </motion.label>
                                                            );
                                                        })}
                                                    </div>
                                                </Field>
                                                <Field label="Message" required>
                                                    <SmartTextarea placeholder="Describe your facility and how we can help…" />
                                                </Field>
                                                <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                    onClick={() => setSubmitted(true)}
                                                    style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '15px', borderRadius: 12, letterSpacing: '0.04em' }}
                                                >
                                                    Transmit Message →
                                                </motion.button>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textAlign: 'center', letterSpacing: '0.06em' }}>
                                                    ◈ ENCRYPTED · ◈ GDPR COMPLIANT · ◈ RESPONSE IN 4 HRS
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="success" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: 'center', padding: '60px 20px' }}>
                                            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 28px' }}>
                                                {[80, 104, 128].map((s, i) => (
                                                    <motion.div key={s} style={{ position: 'absolute', width: s, height: s, borderRadius: '50%', border: '1px solid rgba(34,197,94,0.3)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.1 }} />
                                                ))}
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CheckCircle size={48} color="#22c55e" />
                                                </motion.div>
                                            </div>
                                            <h3 style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 28, marginBottom: 12 }}>Transmission Received</h3>
                                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 24 }}>Our Kerala team will get back to you within 4 business hours.</p>
                                            <div style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', background: 'rgba(217,0,37,0.08)', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 8, padding: '8px 18px', letterSpacing: '0.06em' }}>
                                                REF: #HEM-2025-{Math.floor(Math.random() * 9000 + 1000)}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </FadeUp>

                    {/* RIGHT — INFO STACK */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Quick stats 2×2 */}
                        <FadeUp delay={0.08}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {responseTimeFeatures.map(({ icon, label, sub }) => (
                                    <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
                                        <span style={{ color: 'var(--red)', flexShrink: 0 }}>{icon}</span>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13 }}>{label}</div>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FadeUp>

                        {/* Emergency line */}
                        <FadeUp delay={0.12}>
                            <div style={{ position: 'relative', padding: '24px', borderRadius: 18, background: 'rgba(217,0,37,0.07)', border: '1px solid rgba(217,0,37,0.3)', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: -28, right: -28, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,0,37,0.18) 0%, transparent 70%)' }} />
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(217,0,37,0.8)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', marginRight: 8, animation: 'pulse 1.2s infinite', verticalAlign: 'middle' }} />
                                    24/7 EMERGENCY LINE
                                </div>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: 30, color: 'var(--red)', lineHeight: 1, letterSpacing: '0.04em', marginBottom: 6 }}>1800-XXX-BLOOD</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--text2)' }}>Critical blood supply emergencies only</div>
                            </div>
                        </FadeUp>

                        {/* Office + contacts */}
                        <FadeUp delay={0.16}>
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
                                <div style={{ borderBottom: '1px solid var(--border)', padding: '13px 20px' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>HEADQUARTERS</span>
                                </div>
                                <div style={{ padding: '18px 20px' }}>
                                    <div style={{ display: 'flex', gap: 11, marginBottom: 18 }}>
                                        <MapPin size={14} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Thiruvananthapuram</div>
                                            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                                                HEM∆ Technologies Pvt. Ltd.<br />Technopark Campus, Phase III<br />Kerala — 695581
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 11, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                                        {[
                                            { Icon: Phone, val: '+91 471 XXX XXXX', sub: 'Mon–Sat · 9am–6pm IST' },
                                            { Icon: Mail, val: 'hello@hema.health', sub: 'Replies within 4 hours' },
                                        ].map(({ Icon, val, sub }) => (
                                            <div key={val} style={{ display: 'flex', gap: 10 }}>
                                                <Icon size={13} color="var(--red)" style={{ flexShrink: 0, marginTop: 3 }} />
                                                <div>
                                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14 }}>{val}</div>
                                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{sub}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FadeUp>

                        {/* ── KERALA NETWORK MAP ── */}
                        <FadeUp delay={0.22}>
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
                                <KeralaNetworkMap />
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section style={{ padding: '80px 5% 96px', background: '#0A0A12', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(217,0,37,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(217,0,37,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)' }} />
                <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
                    <FadeUp>
                        <div style={{ textAlign: 'center', marginBottom: 52 }}>
                            <MonoLabel>DIAGNOSTIC READOUT</MonoLabel>
                            <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 'clamp(28px,4vw,42px)', marginTop: 10 }}>Quick Answers</h2>
                        </div>
                    </FadeUp>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {faqItems.map((f, i) => <FAQItem key={f.q} {...f} index={i} />)}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section style={{ padding: '100px 5%', background: 'var(--bg)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,0,37,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
                <FadeUp>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>SKIP THE FORM</span>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(52px,8vw,80px)', letterSpacing: '0.03em', margin: '16px 0 20px', lineHeight: 0.9 }}>READY TO<br />GET STARTED?</h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, color: 'var(--text2)', marginBottom: 40, maxWidth: 420, margin: '0 auto 40px' }}>
                        Book a 30-minute live demo with our Kerala team — no commitment required.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.button className="btn-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>Book a Demo</motion.button>
                        <motion.button className="btn-ghost" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>View Pricing</motion.button>
                    </div>
                </FadeUp>
            </section>

            <Footer />
        </div>
    );
}