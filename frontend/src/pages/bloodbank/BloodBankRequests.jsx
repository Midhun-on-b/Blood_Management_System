import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import BloodBankLayout from '../../components/bloodbank/BloodBankLayout';
import BloodBankLoadingSkeleton from '../../components/bloodbank/BloodBankLoadingSkeleton';
import PriorityBadge from '../../components/hospital/PriorityBadge';
import StatusBadge from '../../components/hospital/StatusBadge';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import IssueBloodModal from '../../components/bloodbank/IssueBloodModal';
import { getRequests, getStock, approveRequest, rejectRequest } from '../../api/bloodBankApi';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected', 'Completed'];

function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

export default function BloodBankRequests() {
    const [tab, setTab] = useState('All');
    const [prioFilter, setPrioFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [issueRequest, setIssueRequest] = useState(null);
    const [requests, setRequests] = useState([]);
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = () => {
        setLoading(true);
        Promise.all([getRequests(), getStock()])
            .then(([reqs, stk]) => { setRequests(reqs); setStock(stk); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchAll(); }, []);

    const handleApprove = async (requestId) => {
        try {
            await approveRequest(requestId);
            toast.success('Request approved successfully');
            fetchAll(); // Refresh the list
        } catch (err) {
            console.error('Approve error:', err);
            toast.error('Failed to approve request');
        }
    };

    const handleReject = async (requestId) => {
        try {
            await rejectRequest(requestId);
            toast.success('Request rejected');
            fetchAll(); // Refresh the list
        } catch (err) {
            console.error('Reject error:', err);
            toast.error('Failed to reject request');
        }
    };

    if (loading) return (
        <BloodBankLayout title="Incoming Requests" page="REQUESTS">
            <BloodBankLoadingSkeleton showHero={false} showFilters cardCount={4} listRows={6} />
        </BloodBankLayout>
    );
    if (error) return (
        <BloodBankLayout title="Incoming Requests" page="REQUESTS">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 13 }}>Error: {error}</div>
        </BloodBankLayout>
    );

    function stockForGroup(bg) {
        const s = stock.find(x => x.blood_group === bg);
        return s?.available_units || 0;
    }

    const normalizeStatus = (status) => String(status || '').trim().toLowerCase();
    const emergencyPending = requests.filter(r => normalizeStatus(r.status) === 'pending' && r.priority === 'Emergency');
    const counts = { All: requests.length };
    requests.forEach(r => {
        const key = normalizeStatus(r.status);
        counts[key] = (counts[key] || 0) + 1;
    });

    const filtered = requests.filter(r => {
        const normalizedStatus = normalizeStatus(r.status);
        const mt = tab === 'All' || normalizedStatus === tab.toLowerCase();
        const mp = prioFilter === 'All' || r.priority === prioFilter;
        const rid = `REQ-${String(r.request_id).padStart(3,'0')}`;
        const mq = rid.toLowerCase().includes(search.toLowerCase())
            || (r.hospital_name || '').toLowerCase().includes(search.toLowerCase())
            || (r.patient_name || '').toLowerCase().includes(search.toLowerCase());
        return mt && mp && mq;
    });

    return (
        <BloodBankLayout title="Incoming Requests" page="REQUESTS">
            <AnimatePresence>{issueRequest && <IssueBloodModal onClose={() => { setIssueRequest(null); fetchAll(); }} request={issueRequest} />}</AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[{ label: 'TOTAL REQUESTS', val: String(requests.length), color: '#fff' }, { label: 'PENDING', val: String(counts.Pending || 0), color: 'var(--red)', pulse: emergencyPending.length > 0 }, { label: 'APPROVED', val: String(counts.Approved || 0), color: '#22c55e' }, { label: 'REJECTED', val: String(counts.Rejected || 0), color: '#f59e0b' }].map(({ label, val, color, pulse }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{label}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color, lineHeight: 1 }}>{val}</div>
                            {pulse && <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.2s infinite' }} /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)' }}>EMERGENCY ACTIVE</span></div>}
                        </motion.div>
                    ))}
                </div>
                {/* Emergency alert */}
                {emergencyPending.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'rgba(217,0,37,0.08)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 16, padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <AlertTriangle size={20} color="var(--red)" style={{ animation: 'bounce 1s ease-in-out infinite' }} />
                            <div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: 'var(--red)' }}>{emergencyPending.length} Emergency Blood Request{emergencyPending.length > 1 ? 's' : ''} — Immediate Action Required</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
                                    {emergencyPending.map(r => `${r.hospital_name} · ${r.blood_group} · ${r.units_required} units`).join(' | ')}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIssueRequest(emergencyPending[0])} style={{ background: 'var(--red)', border: 'none', cursor: 'pointer', borderRadius: 10, padding: '10px 18px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#fff' }}>Fulfil Now →</button>
                    </motion.div>
                )}
                {/* Table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 16 }}>Incoming Blood Requests</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {STATUS_TABS.map(t => <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${tab === t ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: tab === t ? '#fff' : 'var(--text2)' }}>{t} ({counts[t] || 0})</button>)}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {['All', 'Emergency', 'Urgent', 'Routine'].map(t => <button key={t} onClick={() => setPrioFilter(t)} style={{ background: prioFilter === t ? 'rgba(217,0,37,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${prioFilter === t ? 'rgba(217,0,37,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 100, padding: '5px 10px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: prioFilter === t ? 'var(--red)' : 'var(--text3)' }}>{t}</button>)}
                        </div>
                        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                            <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hospital, patient, request..."
                                style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px 8px 38px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 130px 120px 90px 60px 110px 120px 120px 110px', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['REQUEST ID', 'HOSPITAL', 'PATIENT', 'BLOOD GRP', 'UNITS', 'PRIORITY', 'STATUS', 'STOCK CHECK', 'ACTION'].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {filtered.map((req, i) => {
                        const avail = stockForGroup(req.blood_group);
                        const stockOk = avail >= req.units_required;
                        const isEmerg = req.priority === 'Emergency';
                        return (
                            <div key={req.request_id}
                                style={{ display: 'grid', gridTemplateColumns: '110px 130px 120px 90px 60px 110px 120px 120px 110px', gap: 10, alignItems: 'center', padding: '14px 0', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', background: isEmerg && req.status === 'Pending' ? 'rgba(217,0,37,0.04)' : 'transparent', borderLeft: isEmerg && req.status === 'Pending' ? '3px solid #D90025' : '3px solid transparent', paddingLeft: isEmerg && req.status === 'Pending' ? 10 : 0 }}
                                onMouseEnter={e => e.currentTarget.style.background = (isEmerg && req.status === 'Pending') ? 'rgba(217,0,37,0.06)' : 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = (isEmerg && req.status === 'Pending') ? 'rgba(217,0,37,0.04)' : 'transparent'}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>REQ-{String(req.request_id).padStart(3,'0')}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.hospital_name}</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13, color: '#fff' }}>{req.patient_name}</div>
                                <BloodGroupBadge group={req.blood_group} small />
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', lineHeight: 1 }}>{req.units_required}</div>
                                <PriorityBadge priority={req.priority || 'Routine'} />
                                <StatusBadge status={req.status} />
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: stockOk ? '#22c55e' : 'var(--red)' }}>
                                    {stockOk ? `✓ ${avail} avail.` : `✗ Only ${avail}`}
                                </div>
                                <div>
                                    {(req.status || '').toLowerCase() === 'pending' && stockOk && (
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button onClick={() => handleApprove(req.request_id)} style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer', borderRadius: 6, padding: '4px 8px', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: '#22c55e' }}>✓ Approve</button>
                                            <button onClick={() => handleReject(req.request_id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', borderRadius: 6, padding: '4px 8px', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, color: '#ef4444' }}>✗ Reject</button>
                                        </div>
                                    )}
                                    {(req.status || '').toLowerCase() === 'approved' && <button onClick={() => setIssueRequest(req)} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer', borderRadius: 7, padding: '5px 10px', fontFamily: 'var(--font-body)', fontSize: 11, color: '#f59e0b' }}>Issue Blood →</button>}
                                    {(req.status || '').toLowerCase() === 'completed' && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>✓ Completed</span>}
                                    {(req.status || '').toLowerCase() === 'rejected' && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>✗ Rejected</span>}
                                </div>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', padding: '20px 0' }}>No requests found.</div>}
                </motion.div>
            </div>
        </BloodBankLayout>
    );
}
