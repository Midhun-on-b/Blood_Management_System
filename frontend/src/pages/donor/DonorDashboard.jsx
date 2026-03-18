import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Droplets, MapPin, HeartPulse } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';
import { EligibilityBadge } from '../../components/donor/DonorSidebar';
import DonorLoadingSkeleton from '../../components/donor/DonorLoadingSkeleton';

function fmt(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

const cardStyle = {
    background: '#0F0F17',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 24
};

export default function DonorDashboard() {
    const navigate = useNavigate();
    const [donor, setDonor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/donors/1')
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok || !data || typeof data.name !== 'string') {
                    throw new Error(data?.message || 'Invalid donor response');
                }
                return data;
            })
            .then((data) => {
                setDonor(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching donor:', err);
                setDonor(null);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <DonorLayout title="Dashboard" page="DASHBOARD">
                <DonorLoadingSkeleton showHero cardCount={3} listRows={4} />
            </DonorLayout>
        );
    }

    if (!donor) {
        return (
            <DonorLayout title="Dashboard">
                <div style={{ color: '#fff', padding: 40 }}>No donor found.</div>
            </DonorLayout>
        );
    }

    const firstName = donor.name ? donor.name.split(' ')[0] : 'Donor';
    const isActive = donor.status === 'active';

    const quickStats = [
        { icon: Droplets, label: 'Blood Group', value: donor.blood_group || 'N/A' },
        { icon: MapPin, label: 'City', value: donor.city || 'N/A' },
        { icon: HeartPulse, label: 'Last Donation', value: fmt(donor.last_donation_date) }
    ];

    return (
        <DonorLayout title="Dashboard" page="DASHBOARD">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        background: 'linear-gradient(140deg, #0F0F17 0%, #1A0A0F 55%, #220A10 100%)',
                        border: '1px solid rgba(217,0,37,0.25)',
                        borderRadius: 24,
                        padding: '30px 32px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        right: -8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 170,
                        lineHeight: 1,
                        color: 'rgba(217,0,37,0.08)',
                        userSelect: 'none'
                    }}>
                        {donor.blood_group}
                    </div>

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            letterSpacing: '0.12em',
                            color: 'var(--red)',
                            marginBottom: 8
                        }}>
                            DONOR OVERVIEW
                        </div>
                        <div style={{ fontSize: 38, color: '#fff', marginBottom: 12 }}>
                            Welcome back, {firstName}
                        </div>
                        <div style={{ color: isActive ? '#22c55e' : '#f59e0b', marginBottom: 18 }}>
                            {isActive ? 'You are currently eligible to donate.' : 'You are currently marked inactive.'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <EligibilityBadge status={donor.status} />
                            <button
                                onClick={() => navigate('/donor/schedule')}
                                style={{
                                    background: 'var(--red)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '11px 18px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                            >
                                <Calendar size={15} />
                                Schedule Donation
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                    gap: 14
                }}>
                    {quickStats.map(({ icon: Icon, label, value }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            style={cardStyle}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                <div style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    background: 'rgba(217,0,37,0.1)',
                                    border: '1px solid rgba(217,0,37,0.22)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={16} color="var(--red)" />
                                </div>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 10,
                                    letterSpacing: '0.1em',
                                    color: 'var(--text3)',
                                    textTransform: 'uppercase'
                                }}>
                                    {label}
                                </span>
                            </div>
                            <div style={{ color: '#fff', fontSize: 22, lineHeight: 1.2 }}>{value}</div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    style={cardStyle}
                >
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 16 }}>
                        Donor Information
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                        gap: 12
                    }}>
                        <div style={{ color: 'var(--text2)' }}><strong style={{ color: '#fff' }}>Name:</strong> {donor.name || 'N/A'}</div>
                        <div style={{ color: 'var(--text2)' }}><strong style={{ color: '#fff' }}>Age:</strong> {donor.age || 'N/A'}</div>
                        <div style={{ color: 'var(--text2)' }}><strong style={{ color: '#fff' }}>Gender:</strong> {donor.gender || 'N/A'}</div>
                        <div style={{ color: 'var(--text2)' }}><strong style={{ color: '#fff' }}>Phone:</strong> {donor.phone_no || 'N/A'}</div>
                        <div style={{ color: 'var(--text2)' }}><strong style={{ color: '#fff' }}>City:</strong> {donor.city || 'N/A'}</div>
                        <div style={{ color: 'var(--text2)' }}><strong style={{ color: '#fff' }}>Last Donation:</strong> {fmt(donor.last_donation_date)}</div>
                    </div>
                </motion.div>
            </div>
        </DonorLayout>
    );
}
