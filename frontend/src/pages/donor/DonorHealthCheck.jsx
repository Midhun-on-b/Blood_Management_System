import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Activity, Droplets, Scale } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';
import DonorLoadingSkeleton from '../../components/donor/DonorLoadingSkeleton';

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function statusStyle(status) {
    if (status === 'Eligible') {
        return {
            bg: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.28)',
            color: '#22c55e'
        };
    }
    return {
        bg: 'rgba(245,158,11,0.12)',
        border: '1px solid rgba(245,158,11,0.26)',
        color: '#f59e0b'
    };
}

const panelStyle = {
    background: '#0F0F17',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 24
};

export default function DonorHealthCheck() {
    const [checks, setChecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/health-checks/donor/1')
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.message || 'Failed to fetch health checks');
                }
                if (!Array.isArray(data)) {
                    throw new Error('Invalid health-check response');
                }
                return data;
            })
            .then((data) => {
                setChecks(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching health checks:', err);
                setError(err.message || 'Unable to load health checks');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <DonorLayout title="Health Checks" page="HEALTH-CHECKS">
                <DonorLoadingSkeleton showHero={false} cardCount={2} listRows={4} />
            </DonorLayout>
        );
    }

    return (
        <DonorLayout title="Health Checks" page="HEALTH-CHECKS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {error && (
                    <div style={{
                        ...panelStyle,
                        color: '#f87171',
                        border: '1px solid rgba(248,113,113,0.25)'
                    }}>
                        {error}
                    </div>
                )}

                {checks.length === 0 ? (
                    <div style={{ ...panelStyle, color: 'var(--text3)' }}>No health checks found.</div>
                ) : (
                    checks.map((check, i) => {
                        const sts = statusStyle(check.eligibility_status);
                        return (
                            <motion.div
                                key={check.check_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={panelStyle}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                                    <div style={{ color: '#fff', fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18 }}>
                                        Checkup · {formatDate(check.check_date)}
                                    </div>
                                    <span style={{
                                        background: sts.bg,
                                        border: sts.border,
                                        color: sts.color,
                                        borderRadius: 100,
                                        padding: '5px 12px',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 10,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em'
                                    }}>
                                        {check.eligibility_status || 'Unknown'}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                                    gap: 10
                                }}>
                                    <div style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Scale size={14} color="var(--text3)" />
                                        Weight: <span style={{ color: '#fff' }}>{check.weight} kg</span>
                                    </div>
                                    <div style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Activity size={14} color="var(--text3)" />
                                        Blood Pressure: <span style={{ color: '#fff' }}>{check.blood_pressure}</span>
                                    </div>
                                    <div style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Droplets size={14} color="var(--text3)" />
                                        Hemoglobin: <span style={{ color: '#fff' }}>{check.hemoglobin} g/dL</span>
                                    </div>
                                    <div style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <HeartPulse size={14} color="var(--text3)" />
                                        Check ID: <span style={{ color: '#fff' }}>{check.check_id}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </DonorLayout>
    );
}
