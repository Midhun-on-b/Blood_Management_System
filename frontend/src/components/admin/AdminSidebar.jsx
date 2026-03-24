import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Bell, Clock, Users, Building2, Droplets,
    Package, FileText, Heart, HeartPulse, ArrowUpRight,
    CreditCard, UserCog, BarChart2, ScrollText, Settings,
    Shield, LogOut,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useState, useEffect } from 'react';
import { apiFetch } from '../../services/http';



export default function AdminSidebar() {
    const navigate = useNavigate();
    const { user, loading, signOut } = useAuth();
    const [stats, setStats] = useState({
        total_donors: 0,
        total_hospitals: 0,
        total_blood_banks: 0,
        pending_approvals: 0
    });

    useEffect(() => {
        if (!loading && user) {
            apiFetch('/admin/dashboard')
                .then(res => res.json())
                .then(data => setStats(prev => ({ ...prev, ...data })))
                .catch(() => { });

            apiFetch('/auth/pending-accounts')
                .then(res => res.json())
                .then(data => setStats(prev => ({ ...prev, pending_approvals: data.length })))
                .catch(() => { });
        }
    }, [user, loading]);

    const NAV = [
        {
            section: 'OVERVIEW', items: [
                { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { to: '/admin/notifications', icon: Bell, label: 'Notifications', badge: '5 alerts' },
            ]
        },
        {
            section: 'APPROVALS', items: [
                { to: '/admin/approvals', icon: Clock, label: 'Pending Approvals', badge: `${stats.pending_approvals} PENDING`, badgeColor: 'var(--red)', pulse: true },
            ]
        },
        {
            section: 'MANAGEMENT', items: [
                { to: '/admin/donors', icon: Users, label: 'Donors', badge: stats.total_donors.toLocaleString(), badgeColor: 'var(--text3)' },
                { to: '/admin/hospitals', icon: Building2, label: 'Hospitals', badge: String(stats.total_hospitals), badgeColor: 'var(--text3)' },
                { to: '/admin/blood-banks', icon: Droplets, label: 'Blood Banks', badge: String(stats.total_blood_banks), badgeColor: 'var(--text3)' },
            ]
        },
        {
            section: 'BLOOD OPERATIONS', items: [
                { to: '/admin/inventory', icon: Package, label: 'Inventory' },
                { to: '/admin/requests', icon: FileText, label: 'Blood Requests' },
                { to: '/admin/donations', icon: Heart, label: 'Donations' },
                { to: '/admin/health-checks', icon: HeartPulse, label: 'Health Checks' },
                { to: '/admin/issues', icon: ArrowUpRight, label: 'Blood Issues' },
            ]
        },
        {
            section: 'FINANCE', items: [
                { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
            ]
        },
        {
            section: 'SYSTEM', items: [
                { to: '/admin/users', icon: UserCog, label: 'Users & Roles' },
                { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
                { to: '/admin/audit', icon: ScrollText, label: 'Audit Logs' },
                { to: '/admin/settings', icon: Settings, label: 'Settings' },
            ]
        },
    ];

    if (loading || !user) return null;
    return (
        <motion.aside
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, background: '#0A0A12', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 40, overflowY: 'auto' }}
        >
            {/* Logo */}
            <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <NavLink to="/admin/dashboard" style={{ textDecoration: 'none' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.2em', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                        HEM<span style={{ color: 'var(--red)' }}>∆</span>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block', marginLeft: 4 }} />
                    </div>
                </NavLink>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', marginTop: 4 }}>BLOOD MANAGEMENT NETWORK</div>
            </div>

            {/* Admin Profile Card */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#D90025,#8B0010)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Shield size={20} color="#fff" />
                </div>
                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 3 }}>{user.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginBottom: 6, letterSpacing: '0.05em' }}>SUPER ADMIN</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>HEM∆ System · Kerala</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 100, padding: '2px 10px' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e' }}>ALL SYSTEMS OPERATIONAL</span>
                </span>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                {NAV.map(({ section, items }) => (
                    <div key={section} style={{ marginBottom: 20 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0 12px', marginBottom: 8 }}>{section}</div>
                        {items.map(({ to, icon: Icon, label, badge, badgeColor, pulse }) => (
                            <NavLink key={label + to} to={to} end style={{ textDecoration: 'none' }}>
                                {({ isActive }) => (
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, marginBottom: 2, cursor: 'pointer', background: isActive ? 'rgba(217,0,37,0.1)' : 'transparent', borderLeft: isActive ? '3px solid #D90025' : '3px solid transparent', transition: 'all 0.15s' }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Icon size={16} color={isActive ? 'var(--red)' : 'rgba(255,255,255,0.4)'} />
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: isActive ? '#fff' : 'var(--text2)', flex: 1 }}>{label}</span>
                                        {badge && (
                                            <span style={{ background: pulse ? 'rgba(217,0,37,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${pulse ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '1px 6px', fontFamily: 'var(--font-mono)', fontSize: 9, color: badgeColor || 'var(--red)', animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none' }}>
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
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>HEM∆ SYSTEM</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff', marginBottom: 4 }}>v2.5.1 · Production</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e' }}>All services online</span>
                    </div>
                </div>
                <button onClick={async () => { await signOut(); navigate('/login'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                >
                    <LogOut size={14} /> Log Out
                </button>
            </div>
        </motion.aside>
    );
}
