import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/http';

export default function AdminBloodBanks() {
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [banks, setBanks] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        apiFetch("/admin/blood-banks")
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    setError(data?.message || 'Failed to load blood banks');
                    setBanks([]);
                    return;
                }
                setError('');
                setBanks(data);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load blood banks');
                setBanks([]);
            });
    }, []);

    const filtered = banks.filter(b =>
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase())
    );

    const totalU = banks.reduce((s, b) => s + Number(b.units), 0);

    return (
        <AdminLayout title="Blood Banks" page="BLOOD BANKS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {error && (
                    <div style={{
                        background: '#0F0F17',
                        border: '1px solid rgba(248,113,113,0.28)',
                        borderRadius: 14,
                        padding: 14,
                        color: '#f87171'
                    }}>
                        {error}
                    </div>
                )}

                {/* STATS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
                        { l: 'TOTAL BANKS', v: String(banks.length) },
                        { l: 'TOTAL UNITS', v: totalU.toLocaleString(), c: 'var(--red)' }
                    ].map(({ l, v, c }, i) => (
                        <motion.div key={l}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            style={{
                                background: '#0F0F17',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 16,
                                padding: 24
                            }}>
                            <div style={{
                                fontSize: 9,
                                color: 'var(--text3)',
                                marginBottom: 14
                            }}>{l}</div>

                            <div style={{
                                fontSize: 48,
                                color: c || '#fff'
                            }}>{v}</div>
                        </motion.div>
                    ))}
                </div>

                {/* SEARCH */}
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search bank name, city..."
                        style={{
                            width: '100%',
                            background: '#0F0F17',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            padding: '9px 12px 9px 38px',
                            color: '#fff'
                        }}
                    />
                </div>

                {/* TABLE */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: '#0F0F17',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 20,
                        padding: 28
                    }}
                >

                    {/* HEADER */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '70px 1fr 120px 140px 90px 90px 28px',
                        gap: 10,
                        paddingBottom: 10,
                        borderBottom: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        {['ID', 'NAME', 'CITY', 'CONTACT', 'UNITS', 'DONATED', '']
                            .map(h => (
                                <div key={h} style={{ fontSize: 9, color: 'var(--text3)' }}>
                                    {h}
                                </div>
                            ))}
                    </div>

                    {/* ROWS */}
                    {filtered.map(b => (
                        <div key={b.bank_id}>

                            <div
                                onClick={() => setExpanded(expanded === b.bank_id ? null : b.bank_id)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '70px 1fr 120px 140px 90px 90px 28px',
                                    gap: 10,
                                    alignItems: 'center',
                                    padding: '14px 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div>{b.bank_id}</div>
                                <div>{b.name}</div>
                                <div>{b.city}</div>
                                <div>{b.contact_no}</div>
                                <div>{b.units}</div>
                                <div>{b.donated}</div>

                                {expanded === b.bank_id
                                    ? <ChevronUp size={13} />
                                    : <ChevronDown size={13} />}
                            </div>

                            {/* EXPANDED */}
                            {expanded === b.bank_id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        borderTop: '1px solid rgba(255,255,255,0.06)',
                                        padding: '20px',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: 20
                                    }}>

                                        <div>
                                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>CONTACT NUMBER</div>
                                            <div>{b.contact_no}</div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>AVAILABLE UNITS</div>
                                            <div>{b.units}</div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>TOTAL DONATIONS</div>
                                            <div>{b.donated}</div>
                                        </div>

                                    </div>
                                </motion.div>
                            )}

                        </div>
                    ))}

                </motion.div>
            </div>
        </AdminLayout>
    );
}
