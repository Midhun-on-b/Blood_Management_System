import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/hospital/StatusBadge';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import { apiFetch } from '../../services/http';

function fmt(d) {
    return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
    });
}

export default function AdminRequests() {

    const [requests, setRequests] = useState([]);
    const [tab, setTab] = useState('All');
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    // 🔥 FETCH DATA
   useEffect(() => {
    apiFetch("/admin/requests")
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data)) {
                setError(data?.message || 'Failed to load requests');
                setRequests([]);
                return;
            }
            setError('');
            setRequests(data);
        })
        .catch(err => {
            console.error("ERROR:", err);
            setError('Failed to load requests');
            setRequests([]);
        });
}, []);

    const requestList = Array.isArray(requests) ? requests : [];

    // 🔥 FORMAT STATUS (IMPORTANT)
    const formatStatus = (status) =>
        status?.charAt(0).toUpperCase() + status?.slice(1);

    // 🔥 STATS
    const fulfilled = requestList.filter(r =>
        r.status?.toLowerCase() === 'approved'
    ).length;

    const pending = requestList.filter(r =>
        r.status?.toLowerCase() === 'pending'
    ).length;

    const rate = requestList.length
        ? ((fulfilled / requestList.length) * 100).toFixed(1)
        : 0;

    // 🔥 FILTER
    const filtered = requestList.filter(r => {

        // status filter (case-insensitive)
        if (tab !== 'All' && r.status?.toLowerCase() !== tab.toLowerCase())
            return false;

        // search filter
        if (
            search &&
            !r.patient_name?.toLowerCase().includes(search.toLowerCase()) &&
            !String(r.id).toLowerCase().includes(search.toLowerCase())
        ) return false;

        return true;
    });

    return (
        <AdminLayout title="Blood Requests" page="REQUESTS">

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

                {/* KPI */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
                        { l: 'TOTAL', v: requestList.length },
                        { l: 'PENDING', v: pending, c: 'var(--red)' },
                        { l: 'APPROVED', v: fulfilled, c: '#22c55e' },
                        { l: 'RATE', v: `${rate}%` }
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
                                marginBottom: 10
                            }}>{l}</div>

                            <div style={{
                                fontSize: 40,
                                color: c || '#fff'
                            }}>{v}</div>
                        </motion.div>
                    ))}
                </div>

                {/* FILTER + SEARCH */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {['All', 'Pending', 'Approved', 'Rejected'].map(t => (
                        <button key={t}
                            onClick={() => setTab(t)}
                            style={{
                                background: tab === t ? 'var(--red)' : '#111',
                                border: '1px solid #333',
                                borderRadius: 20,
                                padding: '5px 12px',
                                color: '#aaa',
                                cursor: 'pointer'
                            }}>
                            {t}
                        </button>
                    ))}

                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={14} style={{
                            position: 'absolute',
                            left: 10,
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }} />

                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search..."
                            style={{
                                width: '100%',
                                padding: '8px 10px 8px 30px',
                                background: '#111',
                                border: '1px solid #333',
                                borderRadius: 8,
                                color: '#fff'
                            }}
                        />
                    </div>

                    <button style={{
                        border: '1px solid #333',
                        padding: '6px 12px',
                        borderRadius: 8,
                        color: '#aaa'
                    }}>
                        <Download size={14} /> Export
                    </button>
                </div>

                {/* TABLE */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: '#0F0F17',
                        borderRadius: 20,
                        padding: 20
                    }}>

                    {/* HEADER */}
                    {/* HEADER */}
<div style={{
    display: 'grid',
    gridTemplateColumns: '100px 1fr 1fr 120px 80px 60px 100px 100px',
    gap: 10,
    paddingBottom: 12,
    marginBottom: 6,
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    padding: '10px 12px',
    border: '1px solid rgba(255,255,255,0.05)'
}}>
                        {['ID', 'HOSPITAL', 'BANK', 'PATIENT', 'BLOOD', 'QTY', 'PRIORITY', 'STATUS']
    .map(h => (
        <div key={h} style={{
            fontSize: 11,
            letterSpacing: '1px',
            color: '#9CA3AF',
            fontWeight: 500
        }}>
            {h}
        </div>
    ))}
                    </div>

                    {/* DATA */}
                    {filtered.map(r => (
                        <div
  key={r.id}
  style={{
    display: 'grid',
    gridTemplateColumns: '100px 1fr 1fr 120px 80px 60px 100px 100px',
    gap: 10,
    padding: '12px 0',
    borderBottom: '1px solid #111',
    cursor: 'pointer',
    transition: '0.2s'
  }}
  onMouseEnter={(e) => e.currentTarget.style.background = '#111'}
  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
>
                            <div>
                                <div style={{ fontWeight: 500, color: '#ccc' }}>
  {r.id}
</div>
                                <div style={{ fontSize: 10, color: '#777' }}>
                                    {fmt(r.request_date || r.created_at)}
                                </div>
                            </div>

                            <div>{r.hospital || "N/A"}</div>
                            <div>{r.blood_bank || "N/A"}</div>
                            <div>{r.patient_name || "N/A"}</div>

                            <BloodGroupBadge group={r.blood_group || "N/A"} small />
                            <div>{r.quantity}</div>

                            <div>-</div>
                            <div style={{
  display: 'flex',
  alignItems: 'center'
}}>
  <StatusBadge status={formatStatus(r.status)} />
</div>
                        </div>
                    ))}
      {filtered.length === 0 && (
  <div style={{
    padding: 20,
    textAlign: 'center',
    color: '#666'
  }}>
    No requests found
  </div>
)}
                </motion.div>

            </div>

        </AdminLayout>
    );
}
