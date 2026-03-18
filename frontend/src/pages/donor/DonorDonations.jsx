import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Building2, CalendarDays } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';
import DonorLoadingSkeleton from '../../components/donor/DonorLoadingSkeleton';

function fmt(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function ChartTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#161622',
            border: '1px solid rgba(217,0,37,0.3)',
            borderRadius: 10,
            padding: '10px 14px'
        }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>
                {payload[0].value} ml
            </div>
        </div>
    );
}

const panelStyle = {
    background: '#0F0F17',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 24
};

export default function DonorDonations() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/donations/donor/1')
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.message || 'Failed to fetch donations');
                }
                if (!Array.isArray(data)) {
                    throw new Error('Invalid donations response');
                }
                return data;
            })
            .then((data) => {
                setDonations(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching donations:', err);
                setError(err.message || 'Unable to load donations');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <DonorLayout title="My Donations" page="DONATIONS">
                <DonorLoadingSkeleton showHero={false} cardCount={4} listRows={5} />
            </DonorLayout>
        );
    }

    const totalMl = donations.reduce((s, d) => s + (Number(d.quantity) || 0), 0);
    const banksVisited = new Set(donations.map((d) => d.bank_name)).size;
    const lastDonation = donations.length ? fmt(donations[0].donation_date) : 'N/A';

    const areaData = donations
        .map((d) => ({
            date: fmt(d.donation_date),
            ml: Number(d.quantity) || 0
        }))
        .reverse();

    return (
        <DonorLayout title="My Donations" page="DONATIONS">
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

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                    gap: 14
                }}>
                    {[
                        { icon: Droplets, label: 'Total Donations', val: donations.length },
                        { icon: Droplets, label: 'Total Volume', val: `${totalMl} ml` },
                        { icon: Building2, label: 'Banks Visited', val: banksVisited },
                        { icon: CalendarDays, label: 'Last Donation', val: lastDonation }
                    ].map(({ icon: Icon, label, val }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={panelStyle}
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
                                    color: 'var(--text3)',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase'
                                }}>
                                    {label}
                                </span>
                            </div>
                            <div style={{ fontSize: 24, color: '#fff' }}>{val}</div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={panelStyle}
                >
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 16 }}>
                        Donation History
                    </div>
                    {donations.length === 0 ? (
                        <div style={{ color: 'var(--text3)', padding: '20px 0' }}>No donations found.</div>
                    ) : (
                        donations.map((d, i) => (
                            <div
                                key={d.donation_id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '56px 130px 1fr 100px',
                                    gap: 12,
                                    alignItems: 'center',
                                    color: 'var(--text2)',
                                    padding: '14px 0',
                                    borderBottom: i < donations.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                }}
                            >
                                <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                                    #{i + 1}
                                </div>
                                <div>{fmt(d.donation_date)}</div>
                                <div style={{ color: '#fff' }}>{d.bank_name}, {d.city}</div>
                                <div style={{ color: '#fff' }}>{d.quantity} ml</div>
                            </div>
                        ))
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={panelStyle}
                >
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 18 }}>
                        Donation Volume Trend
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={areaData}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.45)" />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="ml" stroke="#D90025" fill="rgba(217,0,37,0.22)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </DonorLayout>
    );
}
