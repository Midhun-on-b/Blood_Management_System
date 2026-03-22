import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import { apiFetch } from '../../services/http';


const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const genStock = seed => BLOOD_TYPES.map(g => ({ group: g, units: Math.floor(seed * (40 + Math.random() * 120)), capacity: 250, updated: '2025-01-15' }));

export default function AdminInventory() {
    const [expanded, setExpanded] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [banks, setBanks] = useState([]);
const [districtData, setDistrictData] = useState([]);
const [stats, setStats] = useState({
    totalUnits: 0,
    criticalTypes: 0,
    lowStock: 0,
    avgCapacity: 0
});
useEffect(() => {
    fetchBanks();
    fetchDistricts();
}, []);
const fetchBanks = async () => {
    try {
        const res = await apiFetch("/admin/inventory")
        const data = await res.json();
        if (!Array.isArray(data)) {
            setBanks([]);
            setStats({ totalUnits: 0, criticalTypes: 0, lowStock: 0, avgCapacity: 0 });
            setLoading(false);
            return;
        }
        let totalUnits = 0;
let criticalTypes = 0;
let lowStock = 0;
let totalPercent = 0;
let count = 0;

data.forEach(row => {
    const units = row.available_units;
    const capacity = 100; // since we fixed it

    totalUnits += units;

    const pct = capacity ? (units / capacity) * 100 : 0;

    if (pct <= 30) {
        criticalTypes++;
    } else if (pct <= 60) {
        lowStock++;
    }

    totalPercent += pct;
    count++;
});

const avgCapacity = count ? (totalPercent / count).toFixed(1) : 0;

setStats({
    totalUnits,
    criticalTypes,
    lowStock,
    avgCapacity
});

const grouped = {};

data.forEach(row => {
    if (!grouped[row.bank_id]) {
        grouped[row.bank_id] = {
            bank_id: row.bank_id,
            bank_name: row.bank_name,
            city: row.city,
            total_units: 0,
            inventoryByGroup: {}
        };
    }

    if (!grouped[row.bank_id].inventoryByGroup[row.blood_group]) {
        grouped[row.bank_id].inventoryByGroup[row.blood_group] = {
            group: row.blood_group,
            units: 0,
            capacity: 100,
            updated: new Date().toISOString().split("T")[0]
        };
    }

    grouped[row.bank_id].inventoryByGroup[row.blood_group].units += row.available_units;

    grouped[row.bank_id].total_units += row.available_units;
});

setBanks(Object.values(grouped).map((bank) => ({
    ...bank,
    inventory: Object.values(bank.inventoryByGroup)
})));
setLoading(false);
    } catch (err) {
        console.error(err);
        setLoading(false);
    }
};

const fetchDistricts = async () => {
    try {
        const res = await apiFetch("/admin/inventory");
        const data = await res.json();
        if (!Array.isArray(data)) {
            setDistrictData([]);
            return;
        }

const districtMap = {};

data.forEach(row => {
    if (!districtMap[row.city]) {
        districtMap[row.city] = 0;
    }
    districtMap[row.city] += row.available_units;
});

const formatted = Object.keys(districtMap).map(city => ({
    district: city,
    total_units: districtMap[city],
    status:
        districtMap[city] > 1000 ? "Healthy" :
        districtMap[city] > 500 ? "Low" : "Critical"
}));

setDistrictData(formatted);
    } catch (err) {
        console.error(err);
    }
};
    const filteredBanks = selectedDistrict
    ? banks.filter(b => b.city === selectedDistrict)
    : banks;
  if (loading) {
    return (
        <AdminLayout title="System Inventory" page="INVENTORY">
            <div style={{ color: "#fff", padding: 20 }}>Loading...</div>
        </AdminLayout>
    );
}
    return (
        <AdminLayout title="System Inventory" page="INVENTORY">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
  { l: 'TOTAL UNITS', v: stats.totalUnits.toLocaleString() },
  { l: 'CRITICAL TYPES', v: stats.criticalTypes, c: 'var(--red)' },
  { l: 'LOW STOCK', v: stats.lowStock, c: '#f59e0b' },
  { l: 'AVG CAPACITY', v: stats.avgCapacity + '%' }
].map(({ l, v, c }, i) => (
                        <motion.div key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{l}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: c || '#fff', lineHeight: 1 }}>{v}</div>
                        </motion.div>
                    ))}
                </div>

                {/* District Map */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 6 }}>District Stock Overview</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Click a district to filter banks below</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <button onClick={() => setSelectedDistrict('')} style={{ background: !selectedDistrict ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${!selectedDistrict ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: !selectedDistrict ? '#fff' : 'var(--text2)' }}>All</button>
                       {districtData.map(d => {
                            const sc = d.status === 'Healthy' ? 'rgba(34,197,94,0.2)' : d.status === 'Low' ? 'rgba(245,158,11,0.2)' : 'rgba(217,0,37,0.2)';
                            const tc = d.status === 'Healthy' ? '#22c55e' : d.status === 'Low' ? '#f59e0b' : 'var(--red)';
                            const sel = selectedDistrict === d.district;
                            return (
                                <button key={d.district} onClick={() => setSelectedDistrict(d.district)}
                                    style={{ background: sel ? sc : 'rgba(255,255,255,0.03)', border: `1px solid ${sel ? tc : 'rgba(255,255,255,0.08)'}`, borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: sel ? tc : 'var(--text3)' }}>
                                    {d.district} <span style={{ fontSize: 9, opacity: 0.6 }}>({d.total_units})</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Banks inventory grouped */}
               {filteredBanks.map((b, bi) => {
                    const stock = Array.isArray(b.inventory) ? b.inventory : [];
                    const isOpen = expanded === b.bank_id;
                    return (
                        <motion.div key={b.bank_id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + bi * 0.05 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                            <div onClick={() => setExpanded(isOpen ? null : b.bank_id)}
                                style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff' }}>{b.bank_name}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{b.city}</div>
                                    <span style={{ background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)' }}>{b.total_units} units</span>
                                </div>
                                {isOpen ? <ChevronUp size={16} color="var(--text3)" /> : <ChevronDown size={16} color="var(--text3)" />}
                            </div>
                            {isOpen && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                    style={{ padding: '0 28px 24px', overflow: 'hidden' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 80px 1fr 80px 100px', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        {['BLOOD GRP', 'AVAILABLE', 'CAPACITY', 'PERCENTAGE', 'STATUS', 'UPDATED'].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em' }}>{h}</div>)}
                                    </div>
                                    {stock.map(st => {
                                        const pct = st.capacity ? Math.round((st.units / st.capacity) * 100) : 0;
                                        const stLabel = pct <= 30 ? 'Critical' : pct <= 60 ? 'Low' : 'Healthy';
                                        const stColor = pct <= 30 ? 'var(--red)' : pct <= 60 ? '#f59e0b' : '#22c55e';
                                        return (
                                            <div key={`${b.bank_id}-${st.group}`} style={{ display: 'grid', gridTemplateColumns: '80px 100px 80px 1fr 80px 100px', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <BloodGroupBadge group={st.group} small />
                                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff' }}>{st.units}</div>
                                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{st.capacity}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${pct}%`, background: stColor, borderRadius: 2 }} />
                                                    </div>
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', minWidth: 32 }}>{pct}%</span>
                                                </div>
                                                <span style={{ background: `${stColor}18`, border: `1px solid ${stColor}40`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: stColor }}>{stLabel}</span>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{st.updated}</div>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </AdminLayout>
    );
}
