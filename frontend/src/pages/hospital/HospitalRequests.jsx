import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Droplets, Plus, X } from 'lucide-react';
import HospitalLayout from '../../components/hospital/HospitalLayout';
import StatusBadge from '../../components/hospital/StatusBadge';
import HospitalLoadingSkeleton from '../../components/hospital/HospitalLoadingSkeleton';
import { useAuth } from '../../auth/AuthContext';
import { apiFetch } from '../../services/http';

const cardStyle = {
    background: '#0F0F17',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 20
};

function fmt(d) {
    if (!d) return '-';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function NewRequestModal({
    loading,
    onClose,
    onSubmit,
    patients,
    patientId,
    setPatientId,
    bankId,
    setBankId,
    units,
    setUnits,
    bloodGroup
}) {
    const iS = {
        width: '100%',
        background: '#0A0A12',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '11px 12px',
        color: '#fff',
        boxSizing: 'border-box',
        outline: 'none'
    };
    const lS = {
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        color: 'var(--text3)',
        marginBottom: 7,
        marginTop: 12
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <motion.div
                initial={{ scale: 0.94, y: 16, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                style={{ width: '100%', maxWidth: 460, background: '#0F0F17', border: '1px solid rgba(217,0,37,0.24)', borderRadius: 18, padding: 24, position: 'relative' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', right: 14, top: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={18} color="var(--text3)" />
                </button>

                <div style={{ fontFamily: 'var(--font-sub)', fontSize: 22, color: '#fff', marginBottom: 8 }}>Create Blood Request</div>
                <div style={{ color: 'var(--text3)', marginBottom: 12 }}>Submit a new blood unit request for your patient</div>

                <label style={lS}>Patient</label>
                <select value={patientId} onChange={(e) => setPatientId(e.target.value)} style={iS}>
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                        <option key={p.patient_id} value={p.patient_id}>
                            {p.name} (ID {p.patient_id})
                        </option>
                    ))}
                </select>

                <label style={lS}>Blood Group</label>
                <input value={bloodGroup} readOnly style={{ ...iS, opacity: 0.85 }} />

                <label style={lS}>Blood Bank ID</label>
                <input value={bankId} onChange={(e) => setBankId(e.target.value)} style={iS} />

                <label style={lS}>Units Required</label>
                <input type="number" min={1} value={units} onChange={(e) => setUnits(e.target.value)} style={iS} />

                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                    <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 11, color: 'var(--text2)', cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button onClick={onSubmit} disabled={loading} style={{ flex: 1.6, background: 'var(--red)', border: 'none', borderRadius: 10, padding: 11, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function HospitalRequests() {
    const location = useLocation();
    const { user } = useAuth();
    const selectedBank = location.state?.bank_id;

    const [requests, setRequests] = useState([]);
    const [patients, setPatients] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [patientId, setPatientId] = useState('');
    const [bankId, setBankId] = useState('');
    const [units, setUnits] = useState(1);
    const [bloodGroup, setBloodGroup] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedRequest, setExpandedRequest] = useState(null);

   const hospitalId = user?.entity_id;

const fetchRequests = async () => {
    const res = await apiFetch(`/blood-requests/detailed/${hospitalId}`);
    const data = await res.json();
    setRequests(Array.isArray(data) ? data : []);
};

    const fetchPatients = async () => {
        const res = await apiFetch(`/patients/${hospitalId}`);
        const data = await res.json();
        setPatients(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        if (!hospitalId) return;

        const load = async () => {
            try {
                await Promise.all([fetchRequests(), fetchPatients()]);
            } catch (err) {
                console.error(err);
                setError('Unable to load requests.');
            } finally {
                setPageLoading(false);
            }
        };
        load();
    }, [hospitalId]);

    useEffect(() => {
        if (selectedBank) {
            setBankId(String(selectedBank));
            setShowModal(true);
        }
    }, [selectedBank]);

    useEffect(() => {
        const patient = patients.find((p) => String(p.patient_id) === String(patientId));
        setBloodGroup(patient?.blood_group || '');
    }, [patientId, patients]);

    const handleSubmit = async () => {
        if (!patientId || !bankId || !units) {
            toast.error('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            await apiFetch('/blood-requests', {
                method: 'POST',
                body: JSON.stringify({
                    hospital_id: hospitalId,
                    patient_id: parseInt(patientId, 10),
                    bank_id: parseInt(bankId, 10),
                    units_required: parseInt(units, 10)
                })
            });

            setShowModal(false);
            setPatientId('');
            setBankId('');
            setUnits(1);
            setBloodGroup('');
            await fetchRequests();
        } catch (err) {
            console.error(err);
            setError('Unable to submit request.');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <HospitalLayout title="Blood Requests" page="REQUESTS">
                <HospitalLoadingSkeleton showHero={false} cardCount={3} listRows={6} />
            </HospitalLayout>
        );
    }

    const pending = requests.filter((r) => r.status === 'Pending').length;
    const fulfilled = requests.filter((r) => r.status === 'Fulfilled').length;
    const totalUnits = requests.reduce((s, r) => s + (Number(r.units_required) || 0), 0);

    return (
        <HospitalLayout title="Blood Requests" page="REQUESTS">
            <AnimatePresence>
                {showModal && (
                    <NewRequestModal
                        loading={loading}
                        onClose={() => setShowModal(false)}
                        onSubmit={handleSubmit}
                        patients={patients}
                        patientId={patientId}
                        setPatientId={setPatientId}
                        bankId={bankId}
                        setBankId={setBankId}
                        units={units}
                        setUnits={setUnits}
                        bloodGroup={bloodGroup}
                    />
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {error && (
                    <div style={{ ...cardStyle, color: '#f87171', border: '1px solid rgba(248,113,113,0.28)' }}>{error}</div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
                    {[
                        { label: 'Total Requests', value: requests.length },
                        { label: 'Pending', value: pending },
                        { label: 'Fulfilled', value: fulfilled },
                        { label: 'Units Requested', value: totalUnits }
                    ].map((s) => (
                        <div key={s.label} style={cardStyle}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{s.label}</div>
                            <div style={{ color: '#fff', fontSize: 34, lineHeight: 1 }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 20 }}>
                        <Droplets size={18} color="var(--red)" />
                        Blood Requests
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{ background: 'var(--red)', border: 'none', borderRadius: 10, padding: '10px 14px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
                    >
                        <Plus size={14} /> New Request
                    </button>
                </div>

                <div style={cardStyle}>
                    {requests.length === 0 ? (
                        <div style={{ color: 'var(--text3)' }}>No requests found.</div>
                    ) : (
                        requests.map((req, i) => (
                            <div key={req.request_id}>
                                <div
                                    onClick={() => setExpandedRequest(expandedRequest === req.request_id ? null : req.request_id)}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '120px 90px 90px 90px 110px 110px 1fr',
                                        gap: 10,
                                        alignItems: 'center',
                                        padding: '12px 0',
                                        borderBottom: i < requests.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                        color: 'var(--text2)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    <div style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11 }}>REQ-{req.request_id}</div>
                                    <div>{req.hospital_name}</div>
                                    <div>{req.patient_name}</div>
                                    <div>{req.bank_name}</div>
                                    <div>{req.units_required} units</div>
                                    <StatusBadge status={req.status} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div>{fmt(req.request_date)}</div>
                                        <div style={{ transform: expandedRequest === req.request_id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</div>
                                    </div>
                                </div>
                                
                                {expandedRequest === req.request_id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.02)', 
                                            borderRadius: 8, 
                                            padding: 16, 
                                            marginTop: 8,
                                            marginBottom: 12,
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>PATIENT DETAILS</div>
                                                <div style={{ color: '#fff', marginBottom: 2 }}>{req.patient_name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Blood Group: {req.blood_group}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Ward: {req.ward || 'General'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>BANK DETAILS</div>
                                                <div style={{ color: '#fff', marginBottom: 2 }}>{req.bank_name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text2)' }}>City: {req.bank_city}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Priority: {req.priority || 'Normal'}</div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>STATUS HISTORY</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <StatusBadge status={req.status} />
                                                <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                                                    Last updated: {fmt(req.request_date)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </HospitalLayout>
    );
}
