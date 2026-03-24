import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Bell, Droplets, Building2,
    Users, CreditCard, User, Settings, LogOut,
} from 'lucide-react';
import { mockBloodRequests } from '../../data/hospitalMockData';
import { useAuth } from '../../auth/AuthContext';

import { apiFetch } from '../../services/http';


export default function HospitalSidebar() {
    const navigate = useNavigate();
    const { user, loading, signOut } = useAuth();
    const [counts, setCounts] = useState({
        requests: 0,
        patients: 0,
        emergency: 0
    });

    useEffect(() => {
        if (!loading && user?.entity_id) {
            apiFetch(`/hospital-dashboard/${user.entity_id}/stats`)
                .then(res => res.json())
                .then(data => {
                    setCounts({
                        requests: data.requests || 0,
                        patients: data.patients || 0,
                        emergency: data.emergency || 0
                    });
                })
                .catch(() => { });
        }
    }, [user, loading]);

    if (loading || !user) return null;

    const NAV_SECTIONS = [
        {
            label: 'OVERVIEW', items: [
                { to: '/hospital/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { to: '/hospital/notifications', icon: Bell, label: 'Notifications', badge: counts.emergency > 0 ? String(counts.emergency) : null },
            ],
        },
        {
            label: 'BLOOD MANAGEMENT', items: [
                { to: '/hospital/requests', icon: Droplets, label: 'Blood Requests', badge: counts.requests > 0 ? `${counts.requests} Pending` : null },
                { to: '/hospital/blood-banks', icon: Building2, label: 'Blood Banks' },
            ],
        },
        {
            label: 'PATIENTS', items: [
                { to: '/hospital/patients', icon: Users, label: 'Patients', badge: counts.patients > 0 ? `${counts.patients} Active` : null },
            ],
        },
        {
            label: 'FINANCE', items: [
                { to: '/hospital/payments', icon: CreditCard, label: 'Payments' },
            ],
        },
        {
            label: 'ACCOUNT', items: [
                { to: '/hospital/profile', icon: User, label: 'Profile' },
                { to: '/hospital/profile', icon: Settings, label: 'Settings' },
            ],
        },
    ];

    return (
        <motion.aside
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
                background: '#0A0A12', borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', zIndex: 40, overflowY: 'auto',
            }}
        >
            {/* Logo */}
            <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <NavLink to="/hospital/dashboard" style={{ textDecoration: 'none' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.2em', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                        HEM<span style={{ color: 'var(--red)' }}>∆</span>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block', marginLeft: 4 }} />
                    </div>
                </NavLink>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', marginTop: 4 }}>BLOOD MANAGEMENT NETWORK</div>
            </div>

            {/* Hospital Profile Card */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                }}>
                    <Building2 size={20} color="var(--red)" />
                </div>
                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 3 }}>
                    {user.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginBottom: 6, letterSpacing: '0.05em' }}>
                    HOSPITAL · ADMIN
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                    {user.city}, Kerala
                </div>
                {counts.requests > 0 && (
                    <span style={{
                        display: 'inline-block',
                        background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)',
                        borderRadius: 100, padding: '2px 10px',
                        fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)',
                    }}>
                        {counts.requests} Active Requests
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                {NAV_SECTIONS.map(section => (
                    <div key={section.label} style={{ marginBottom: 20 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0 12px', marginBottom: 8 }}>
                            {section.label}
                        </div>
                        {section.items.map(({ to, icon: Icon, label, badge }) => (
                            <NavLink key={label + to} to={to} end style={{ textDecoration: 'none' }}>
                                {({ isActive }) => (
                                    <div
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                                            cursor: 'pointer',
                                            background: isActive ? 'rgba(217,0,37,0.1)' : 'transparent',
                                            borderLeft: isActive ? '3px solid #D90025' : '3px solid transparent',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Icon size={16} color={isActive ? 'var(--red)' : 'rgba(255,255,255,0.4)'} />
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: isActive ? '#fff' : 'var(--text2)', fontWeight: isActive ? 500 : 400, flex: 1 }}>
                                            {label}
                                        </span>
                                        {badge && (
                                            <span style={{ background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.3)', color: 'var(--red)', borderRadius: 100, padding: '1px 6px', fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                                                {badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Bottom */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>HOSPITAL ID</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff' }}>{user.entity_id}</div>
                </div>
                <button
                    onClick={async () => { await signOut(); navigate('/login'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', padding: 0, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                >
                    <LogOut size={14} /> Log Out
                </button>
            </div>
        </motion.aside>
    );
}
