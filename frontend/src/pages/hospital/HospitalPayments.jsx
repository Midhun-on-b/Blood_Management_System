import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import HospitalLayout from '../../components/hospital/HospitalLayout';
import StatusBadge from '../../components/hospital/StatusBadge';
import HospitalLoadingSkeleton from '../../components/hospital/HospitalLoadingSkeleton';

function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#161622', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
            {payload.map(p => <div key={p.name} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: p.color, marginBottom: 2 }}>₹{p.value.toLocaleString()} {p.name}</div>)}
        </div>
    );
}

const PAY_TABS = ['All', 'Paid', 'Pending', 'Overdue'];

async function readJsonSafe(res, fallbackMessage) {
    const raw = await res.text();
    let data = null;

    if (raw) {
        try {
            data = JSON.parse(raw);
        } catch {
            throw new Error(`${fallbackMessage} (non-JSON response)`);
        }
    }

    if (!res.ok) {
        throw new Error(data?.message || fallbackMessage);
    }

    return data;
}

export default function HospitalPayments() {

    const [payments, setPayments] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');



    /* =========================
       FETCH PAYMENTS
    ========================= */

    useEffect(() => {

        fetch("http://localhost:5000/payments")
            .then(res => readJsonSafe(res, 'Failed to load payments'))
            .then(data => {

                const formatted = (Array.isArray(data) ? data : []).map(p => ({
                    payment_id: String(p.payment_id),
                    bank_name: p.bank_name,
                    request_id: "REQ-" + p.payment_id,
                    amount: Number(p.amount),
                    payment_date: p.payment_date,
                    payment_status: p.payment_status === "Completed" ? "Paid" : p.payment_status
                }));

                setPayments(formatted);



                /* -------- Chart Data (Monthly) -------- */

                const chart = {};

                formatted.forEach(p => {

                    const month = new Date(p.payment_date).toLocaleString('default', { month: 'short' });

                    if (!chart[month]) {
                        chart[month] = { month, paid: 0, pending: 0 };
                    }

                    if (p.payment_status === "Paid")
                        chart[month].paid += p.amount;
                    else
                        chart[month].pending += p.amount;

                });

                setChartData(Object.values(chart));
                setLoading(false);

            })
            .catch(err => {
                console.error(err);
                setError(err.message || 'Unable to load payments.');
                setLoading(false);
            });

    }, []);



    /* =========================
       CALCULATIONS
    ========================= */

    const totalPaid = payments.filter(p => p.payment_status === 'Paid').reduce((s, p) => s + p.amount, 0);

    const totalPending = payments.filter(p => p.payment_status === 'Pending').reduce((s, p) => s + p.amount, 0);



    const filtered = payments.filter(p => {

        const mf = filter === 'All' || p.payment_status === filter;

        const mq =
            p.payment_id.toLowerCase().includes(search.toLowerCase()) ||
            p.bank_name.toLowerCase().includes(search.toLowerCase());

        return mf && mq;

    });

    if (loading) {
        return (
            <HospitalLayout title="Payments" page="PAYMENTS">
                <HospitalLoadingSkeleton showHero={false} cardCount={4} listRows={5} />
            </HospitalLayout>
        );
    }



    return (
        <HospitalLayout title="Payments" page="PAYMENTS">
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

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
                        { label: 'TOTAL PAID', val: `₹${totalPaid.toLocaleString()}`, color: '#22c55e' },
                        { label: 'PENDING', val: `₹${totalPending.toLocaleString()}`, color: '#f59e0b' },
                        { label: 'TOTAL THIS MONTH', val: `₹${(totalPaid + totalPending).toLocaleString()}`, color: '#fff' },
                        { label: 'TRANSACTIONS', val: payments.length, color: '#fff' },
                    ].map(({ label, val, color }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{label}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, color, lineHeight: 1 }}>{val}</div>
                        </motion.div>
                    ))}
                </div>



                {/* Chart */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4 }}>Payment History</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Last months</div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData} barGap={4}>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Legend iconType="square" wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 10, paddingTop: 12 }} />
                            <Bar dataKey="paid" name="paid" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="pending" name="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>



                {/* Table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>All Payments</div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>
                            <Download size={13} /> Download Statement
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {PAY_TABS.map(t => <button key={t} onClick={() => setFilter(t)} style={{ background: filter === t ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${filter === t ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: filter === t ? '#fff' : 'var(--text2)' }}>{t}</button>)}
                        </div>

                        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                            <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payment ID or bank..."
                                style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px 9px 38px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    </div>



                    {/* Table */}
                    {filtered.map((p, i) => (
                        <div key={p.payment_id}
                            style={{ display: 'grid', gridTemplateColumns: '120px 1fr 110px 100px 100px 100px 90px', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>{p.payment_id}</div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{p.bank_name}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{fmt(p.payment_date)}</div>
                            </div>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', textAlign: 'left', padding: 0 }}>{p.request_id}</button>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff' }}>₹{p.amount.toLocaleString()}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{fmt(p.payment_date)}</div>
                            <StatusBadge status={p.payment_status} />
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: p.payment_status === 'Pending' ? 'var(--red)' : 'var(--text3)', padding: 0 }}>
                                {p.payment_status === 'Pending' ? 'Pay Now →' : 'Receipt →'}
                            </button>
                        </div>
                    ))}
                </motion.div>

            </div>
        </HospitalLayout>
    );
}
