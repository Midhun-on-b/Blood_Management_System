import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Phone, Building2 } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';
import DonorLoadingSkeleton from '../../components/donor/DonorLoadingSkeleton';

const KERALA_DISTRICTS = [
    'All Districts',
    'Thiruvananthapuram',
    'Kollam',
    'Pathanamthitta',
    'Alappuzha',
    'Kottayam',
    'Idukki',
    'Ernakulam',
    'Thrissur',
    'Palakkad',
    'Malappuram',
    'Kozhikode',
    'Wayanad',
    'Kannur',
    'Kasaragod'
];

const panelStyle = {
    background: '#0F0F17',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 20
};

export default function DonorFindBank() {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [district, setDistrict] = useState('All Districts');

    useEffect(() => {
        fetch('http://localhost:5000/blood-banks')
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data?.message || 'Failed to fetch blood banks');
                }
                if (!Array.isArray(data)) {
                    throw new Error('Invalid blood-bank response');
                }
                return data;
            })
            .then((data) => {
                setBanks(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching blood banks:', err);
                setError(err.message || 'Unable to load blood banks');
                setLoading(false);
            });
    }, []);

    const filtered = banks.filter((b) => {
        const bankName = (b.bank_name || '').toLowerCase();
        const city = (b.city || '').toLowerCase();
        const matchSearch = bankName.includes(search.toLowerCase()) || city.includes(search.toLowerCase());
        const matchDistrict = district === 'All Districts' || b.city === district;
        return matchSearch && matchDistrict;
    });

    if (loading) {
        return (
            <DonorLayout title="Find Blood Bank" page="FIND-BANK">
                <DonorLoadingSkeleton showHero={false} showFilters cardCount={4} listRows={0} />
            </DonorLayout>
        );
    }

    return (
        <DonorLayout title="Find Blood Bank" page="FIND-BANK">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ ...panelStyle, padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 230px', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{
                                position: 'absolute',
                                left: 14,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text3)'
                            }} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by bank name or city"
                                style={{
                                    width: '100%',
                                    padding: '11px 12px 11px 40px',
                                    borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: '#0A0A12',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            style={{
                                padding: '11px 12px',
                                borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: '#0A0A12',
                                color: '#fff',
                                outline: 'none'
                            }}
                        >
                            {KERALA_DISTRICTS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {error ? (
                    <div style={{ ...panelStyle, color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
                        {error}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ ...panelStyle, color: 'var(--text3)' }}>No blood banks found.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
                        {filtered.map((bank, i) => (
                            <motion.div
                                key={bank.bank_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                style={panelStyle}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
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
                                        <Building2 size={16} color="var(--red)" />
                                    </div>
                                    <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{bank.bank_name}</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, color: 'var(--text2)' }}>
                                    <MapPin size={14} color="var(--text3)" /> {bank.city || 'N/A'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text2)' }}>
                                    <Phone size={14} color="var(--text3)" /> {bank.contact_no || 'N/A'}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DonorLayout>
    );
}
