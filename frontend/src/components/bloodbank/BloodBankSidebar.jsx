import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Bell, Package, ArrowUpRight,
    Users, Droplets, HeartPulse, Inbox,
    CreditCard, User, Settings, LogOut,
} from 'lucide-react';
import { getDashboard, getBloodBank } from '../../api/bloodBankApi';
import { useAuth } from '../../auth/AuthContext';

export default function BloodBankSidebar() {
    const navigate = useNavigate();
    const { user, loading, signOut } = useAuth();
    const [totalUnits, setTotalUnits] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [emergencyCount, setEmergencyCount] = useState(0);
    const [eligibleDonors, setEligibleDonors] = useState(0);
    const [lowStock, setLowStock] = useState(0);
    const [bankName, setBankName] = useState(user?.name || 'Blood Bank');
    const [city, setCity] = useState(user?.city || 'Kerala');
    const [nacoNumber, setNacoNumber] = useState(user?.contact_no || '');

    useEffect(() => {
        if (!loading && user) {
            getDashboard().then(data => {
                setTotalUnits((data.stock || []).reduce((s, b) => s + b.available_units, 0));
                setPendingRequests((data.requests || []).filter(r => r.status === 'Pending').length);
                setEmergencyCount((data.requests || []).filter(r => r.priority === 'Emergency' && r.status === 'Pending').length);
                setEligibleDonors((data.donorStats || []).find(d => d.status === 'active')?.count || 0);
                setLowStock((data.stock || []).filter(s => (s.available_units / (s.capacity || 200)) <= 0.3).length);
            }).catch(() => { });
            getBloodBank().then(bank => {
                setBankName(bank.bank_name);
                setCity(bank.city);
                setNacoNumber(bank.contact_no || '');
            }).catch(() => { });
        }
    }, [user, loading]);

    const NAV = [
        {
            section: 'OVERVIEW', items: [
                { to: '/bloodbank/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { to: '/bloodbank/notifications', icon: Bell, label: 'Notifications', badge: emergencyCount > 0 ? `${emergencyCount} emergency` : null },
            ]
        },
        {
            section: 'BLOOD STOCK', items: [
                { to: '/bloodbank/inventory', icon: Package, label: 'Inventory', badge: lowStock > 0 ? `${lowStock} Low` : null, badgeColor: '#f59e0b' },
                { to: '/bloodbank/issues', icon: ArrowUpRight, label: 'Blood Issues' },
            ]
        },
        {
            section: 'DONORS', items: [
                { to: '/bloodbank/donors', icon: Users, label: 'Donors', badge: eligibleDonors > 0 ? `${eligibleDonors} Eligible` : null, badgeColor: '#22c55e' },
                { to: '/bloodbank/donations', icon: Droplets, label: 'Donations' },
                { to: '/bloodbank/health-checks', icon: HeartPulse, label: 'Health Checks' },
            ]
        },
        {
            section: 'REQUESTS', items: [
                { to: '/bloodbank/requests', icon: Inbox, label: 'Incoming Requests', badge: pendingRequests > 0 ? `${pendingRequests} Pending` : null },
            ]
        },
        {
            section: 'FINANCE', items: [
                { to: '/bloodbank/payments', icon: CreditCard, label: 'Payments' },
            ]
        },
        {
            section: 'ACCOUNT', items: [
                { to: '/bloodbank/profile', icon: User, label: 'Profile' },
                { to: '/bloodbank/profile', icon: Settings, label: 'Settings' },
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
                <NavLink to="/bloodbank/dashboard" style={{ textDecoration: 'none' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.2em', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                        HEM<span style={{ color: 'var(--red)' }}>∆</span>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block', marginLeft: 4 }} />
                    </div>
                </NavLink>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.15em', marginTop: 4 }}>BLOOD MANAGEMENT NETWORK</div>
            </div>

            {/* Bank Profile Card */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Droplets size={20} color="var(--red)" />
                </div>
                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 3 }}>{bankName}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginBottom: 6, letterSpacing: '0.05em' }}>BLOOD BANK · ADMIN</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>{city}, Kerala</div>
                <span style={{ display: 'inline-block', background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 100, padding: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)' }}>
                    {totalUnits} Units In Stock
                </span>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                {NAV.map(({ section, items }) => (
                    <div key={section} style={{ marginBottom: 20 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0 12px', marginBottom: 8 }}>{section}</div>
                        {items.map(({ to, icon: Icon, label, badge, badgeColor }) => (
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
                                            <span style={{ background: 'rgba(217,0,37,0.12)', border: `1px solid rgba(217,0,37,0.3)`, borderRadius: 100, padding: '1px 6px', fontFamily: 'var(--font-mono)', fontSize: 9, color: badgeColor || 'var(--red)' }}>
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
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>NACO REG</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff' }}>{nacoNumber}</div>
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
