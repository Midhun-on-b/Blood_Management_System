import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Users, Building2, CreditCard, AlertTriangle, Award, BarChart2, X, Download, Check } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const REPORTS = [
    { name: 'NACO Monthly Report', desc: 'Auto-generated NACO blood bank compliance report', freq: 'Monthly', icon: FileText, color: '#D90025' },
    { name: 'Kerala Health Dept. Quarterly', desc: 'State health department submission package', freq: 'Quarterly', icon: FileText, color: '#3b82f6' },
    { name: 'District-wise Stock Analysis', desc: 'Blood inventory levels across all 14 districts', freq: 'Weekly', icon: BarChart2, color: '#22c55e' },
    { name: 'Donor Activity Report', desc: 'Donor registrations, donations, and recall rates', freq: 'Monthly', icon: Users, color: '#f59e0b' },
    { name: 'Hospital Request Analysis', desc: 'Request volumes, fulfillment rates, response times', freq: 'Monthly', icon: Building2, color: '#3b82f6' },
    { name: 'Revenue & Payment Report', desc: 'Complete financial summary across all transactions', freq: 'Monthly', icon: CreditCard, color: '#22c55e' },
    { name: 'Wastage Analysis Report', desc: 'Blood unit expiry and wastage tracking', freq: 'Monthly', icon: AlertTriangle, color: '#f59e0b' },
    { name: 'Emergency Response Report', desc: 'Emergency request response times and outcomes', freq: 'Monthly', icon: AlertTriangle, color: '#D90025' },
    { name: 'Annual System Report', desc: 'Complete year-end Kerala blood management summary', freq: 'Annual', icon: Award, color: '#f59e0b' },
];

export default function AdminReports() {
    const [genModal, setGenModal] = useState(null);
    const [format, setFormat] = useState('PDF');
    const [generating, setGenerating] = useState(false);
    const [done, setDone] = useState(false);
    const [requests, setRequests] = useState([]);
    const [donors, setDonors] = useState([]);
    useEffect(() => {
    fetch("http://localhost:5000/blood-requests")
        .then(res => res.json())
        .then(data => setRequests(data))
        .catch(err => console.error(err));

    fetch("http://localhost:5000/donors")
        .then(res => res.json())
        .then(data => setDonors(data))
        .catch(err => console.error(err));
}, []);
   const reportData = {
    totalRequests: requests.length,
    approved: requests.filter(r => r.status === "approved").length,
    pending: requests.filter(r => r.status === "pending").length,
    rejected: requests.filter(r => r.status === "rejected").length,
    totalDonors: donors.length
};
    const handleGenerate = async () => {
        setGenerating(true);

        try {
            let endpoint = '';
            switch (genModal) {
                case 0: // NACO Monthly Report
                case 1: // Kerala Health Dept. Quarterly
                    endpoint = '/admin/blood-utilization';
                    break;
                case 2: // District-wise Stock Analysis
                    endpoint = '/admin/stock-shortages';
                    break;
                case 3: // Donor Activity Report
                    endpoint = '/admin/donor-retention';
                    break;
                case 4: // Hospital Request Analysis
                    endpoint = '/admin/hospital-demand';
                    break;
                case 5: // Revenue & Payment Report
                    endpoint = '/admin/overdue-payments';
                    break;
                case 6: // Wastage Analysis Report
                    // No specific endpoint, use blood-utilization
                    endpoint = '/admin/blood-utilization';
                    break;
                case 7: // Emergency Response Report
                    endpoint = '/admin/hospital-demand';
                    break;
                case 8: // Annual System Report
                    endpoint = '/admin/blood-utilization';
                    break;
                default:
                    endpoint = '/admin/dashboard';
            }

            const res = await fetch(`http://localhost:5000${endpoint}`);
            const data = await res.json();
            
            console.log("📊 REPORT DATA:", data); // Real data from API

            // Simulate report generation time
            setTimeout(() => {
                setGenerating(false);
                setDone(true);

                setTimeout(() => {
                    setDone(false);
                    setGenModal(null);
                }, 2000);
            }, 1500);

        } catch (error) {
            console.error("Error generating report:", error);
            setGenerating(false);
            // Could show error toast here
        }
    };

    return (
        <AdminLayout title="Reports" page="REPORTS">
            <AnimatePresence>
                {genModal !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        onClick={e => { if (e.target === e.currentTarget && !generating) setGenModal(null); }}>
                        <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 480, position: 'relative' }}>
                            {!generating && !done && <button onClick={() => setGenModal(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>}
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 24 }}>{REPORTS[genModal]?.name}</div>

                            {!generating && !done && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>FROM</div><input type="date" defaultValue="2025-01-01" style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} /></div>
                                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>TO</div><input type="date" defaultValue="2025-01-15" style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} /></div>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>FORMAT</div>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                                        {['PDF', 'Excel', 'CSV'].map(f => (
                                            <button key={f} onClick={() => setFormat(f)} style={{ flex: 1, background: format === f ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${format === f ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '10px 0', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff' }}>{f}</button>
                                        ))}
                                    </div>
                                    <div style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center' }}>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--red)', marginBottom: 6 }}>HEM∆</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Preview of report structure</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12, opacity: 0.3 }}>
                                            {[1, 2, 3].map(i => <div key={i} style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />)}
                                        </div>
                                    </div>
                                    <button onClick={handleGenerate} style={{ width: '100%', background: 'var(--red)', border: 'none', borderRadius: 10, padding: '13px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff' }}>Generate Report →</button>
                                </>
                            )}
                            {generating && (
                                <div style={{ textAlign: 'center', padding: 40 }}>
                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)', marginBottom: 16 }}>Generating report...</div>
                                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                        <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2 }} style={{ height: '100%', background: 'var(--red)', borderRadius: 3 }} />
                                    </div>
                                </div>
                            )}
                            {done && (
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: 40 }}>
                                    <Download size={40} color="#22c55e" style={{ marginBottom: 16 }} />
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#22c55e' }}>Report ready!</div>
                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)', marginTop: 8 }}>Downloading...</div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 6 }}>Generate Reports</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)' }}>Pre-built compliance and analytics reports</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                    {REPORTS.map((r, i) => {
                        const Icon = r.icon;
                        return (
                            <motion.div key={r.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                whileHover={{ y: -3, borderColor: 'rgba(217,0,37,0.3)' }}
                                style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => setGenModal(i)}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon size={22} color={r.color} /></div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 6 }}>{r.name}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 12, lineHeight: 1.4 }}>{r.desc}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 14 }}>{r.freq}</div>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>Generate →</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}
