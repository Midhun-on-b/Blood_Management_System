import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Building, ShieldCheck, CheckCircle } from 'lucide-react';
import AuthLayout from '../auth/AuthLayout';
import AuthInput from '../auth/AuthInput';
import AuthButton from '../auth/AuthButton';
import CheckboxField from '../auth/CheckboxField';
import { useAuth } from '../auth/AuthContext';
import { getDefaultRouteByRole } from '../auth/session';

// ── Role Definitions ──────────────────────────────────────────
const ROLES = [
    {
        id: 'donor',
        label: 'Donor',
        icon: '🩸',
        tagline: ['WELCOME', 'BACK', 'DONOR'],
        subtitle: 'Access your donor profile and donation history',
        badge: '🩸 Donor Login',
    },
    {
        id: 'hospital',
        label: 'Hospital',
        icon: '🏥',
        tagline: ['HOSPITAL', 'STAFF', 'LOGIN'],
        subtitle: 'Access the HEM∆ hospital management dashboard',
        badge: '🏥 Hospital Login',
    },
    {
        id: 'blood_bank',
        label: 'Blood Bank',
        icon: '🔬',
        tagline: ['BLOOD', 'BANK', 'LOGIN'],
        subtitle: 'Access blood bank operations and inventory',
        badge: '🔬 Blood Bank Login',
    },
    {
        id: 'admin',
        label: 'Admin',
        icon: '🛡️',
        tagline: ['ADMIN', 'PORTAL', 'ACCESS'],
        subtitle: 'Restricted system administrator access',
        badge: '🛡️ Admin Login',
    },
];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay },
});

export default function Login() {
    const navigate = useNavigate();
    const { search } = useLocation();
    const { signIn } = useAuth();
    const queryRole = new URLSearchParams(search).get('role');

    const [selectedRole, setSelectedRole] = useState(ROLES[0]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [authError, setAuthError] = useState('');
    const [resolvedRole, setResolvedRole] = useState('');

    // Set role from query if present
    useEffect(() => {
        if (queryRole) {
            const role = ROLES.find(r => r.id === queryRole);
            if (role) setSelectedRole(role);
        }
    }, [queryRole]);

    const handleLogin = async () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

        setErrors({});
        setAuthError('');
        setLoading(true);

        try {
            const user = await signIn({
                email,
                password,
                role: selectedRole.id,
            });
            setResolvedRole(user.role);
            setSuccess(true);
        } catch (error) {
            const message = error?.message || 'Login failed';
            if (message.toLowerCase().includes('pending') || message.toLowerCase().includes('rejected')) {
                navigate('/pending-approval');
                return;
            }
            setAuthError(message);
        } finally {
            setLoading(false);
        }
    };

    // Actual redirection logic
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate(getDefaultRouteByRole(resolvedRole || selectedRole.id));
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [success, selectedRole, navigate, resolvedRole]);

    if (success) {
        return (
            <AuthLayout tagline={selectedRole.tagline} subtitle={selectedRole.subtitle} backTo="/" backLabel="Back to home">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', padding: '60px 0' }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                        style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px',
                        }}
                    >
                        <CheckCircle size={40} color="#22c55e" />
                    </motion.div>
                    <h2 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 28, marginBottom: 12 }}>Welcome Back!</h2>
                    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text2)', marginBottom: 8 }}>Redirecting to your {selectedRole.label.toLowerCase()} dashboard...</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>◈ AUTHENTICATING AS {selectedRole.label.toUpperCase()}</p>
                </motion.div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout tagline={selectedRole.tagline} subtitle={selectedRole.subtitle} backTo="/" backLabel="Back to home">
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 100, padding: '6px 14px',
                        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)',
                        letterSpacing: '0.08em',
                    }}>
                        {selectedRole.badge.toUpperCase()}
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                        {ROLES.map(r => (
                            <button
                                key={r.id}
                                onClick={() => setSelectedRole(r)}
                                style={{
                                    background: selectedRole.id === r.id ? 'var(--red)' : 'rgba(255,255,255,0.05)',
                                    border: 'none', cursor: 'pointer', width: 32, height: 32,
                                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s',
                                }}
                                title={`Login as ${r.label}`}
                            >
                                <span style={{ fontSize: 14 }}>{r.icon}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <motion.div {...fadeUp(0)}>
                    <h1 style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 30, marginBottom: 6 }}>Sign In</h1>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15, color: 'var(--text2)' }}>Access your HEM∆ dashboard</p>
                </motion.div>
            </div>

            <motion.div {...fadeUp(0.08)}>
                <AuthInput label="EMAIL ADDRESS" type="email"
                    placeholder="you@email.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    icon={Mail} required error={errors.email}
                />
                <AuthInput label="PASSWORD" type="password"
                    placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    icon={Lock} required error={errors.password}
                />
            </motion.div>

            <motion.div {...fadeUp(0.14)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <CheckboxField label="Remember me" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <Link to="/forgot-password" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)', textDecoration: 'none' }}>Forgot password?</Link>
            </motion.div>

            <motion.div {...fadeUp(0.18)} style={{ marginBottom: 20 }}>
                <AuthButton variant="primary" fullWidth loading={loading} onClick={handleLogin}>
                    Sign In →
                </AuthButton>
            </motion.div>

            {authError && (
                <motion.div {...fadeUp(0.2)} style={{
                    marginBottom: 14,
                    border: '1px solid rgba(248,113,113,0.35)',
                    background: 'rgba(248,113,113,0.08)',
                    borderRadius: 10,
                    color: '#f87171',
                    padding: '10px 12px',
                    fontSize: 13,
                }}>
                    {authError}
                </motion.div>
            )}

            <motion.div {...fadeUp(0.22)} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </motion.div>

            <motion.div {...fadeUp(0.26)} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                <AuthButton variant="ghost" fullWidth icon={Building}>Kerala Health Dept. SSO</AuthButton>
                <AuthButton variant="ghost" fullWidth onClick={() => navigate('/verify-otp')}>Login with OTP</AuthButton>
            </motion.div>

            <motion.div {...fadeUp(0.3)} style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Don't have an account? </span>
                <Link to="/register" style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: 'var(--red)', textDecoration: 'none' }}>Create account →</Link>
            </motion.div>
        </AuthLayout>
    );
}
