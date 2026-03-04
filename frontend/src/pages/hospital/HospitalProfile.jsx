import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Download, Building2 } from 'lucide-react';
import HospitalLayout from '../../components/hospital/HospitalLayout';
import { mockBloodRequests, mockPatients, mockHospitalBanks } from '../../data/hospitalMockData';

const TABS = ['Hospital Details', 'Account Settings'];
const ALL_DEPTS = ['Emergency', 'Surgery', 'Oncology', 'Maternity', 'ICU', 'Radiology', 'Cardiology', 'Pediatrics'];

function Toggle({ on, onChange }) {
    return (
        <div onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 12, background: on ? 'var(--red)' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{value}</span>
        </div>
    );
}

export default function HospitalProfile() {

    const [tab, setTab] = useState(0);
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);

    const [hospitalId, setHospitalId] = useState(null);
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [contact, setContact] = useState('');
    const [beds, setBeds] = useState(0);

    const [depts, setDepts] = useState(['Emergency', 'ICU']);

    const [notifs, setNotifs] = useState({
        emergency: true,
        updates: true,
        payments: true,
        stock: true,
        whatsapp: false
    });

    const fulfillRate = Math.round((mockBloodRequests.filter(r => r.status === 'Fulfilled').length / mockBloodRequests.length) * 100);

    const iS = { width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box', marginTop: 8 };
    const lS = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 18, marginBottom: 4 };



    // =========================
    // FETCH HOSPITAL PROFILE
    // =========================

    useEffect(() => {

        async function loadHospital() {

            try {

                const res = await fetch("http://localhost:5000/hospitals/1");
                const data = await res.json();

                setHospitalId(data.hospital_id);
                setName(data.hospital_name);
                setCity(data.city);
                setContact(data.contact_no);

                if (data.beds) setBeds(data.beds);

            } catch (err) {

                console.error("Hospital fetch error:", err);

            }

        }

        loadHospital();

    }, []);



    // =========================
    // UPDATE PROFILE
    // =========================

    const handleSave = async () => {

        try {

            const res = await fetch(`http://localhost:5000/hospitals/${hospitalId}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    hospital_name: name,
                    city: city,
                    contact_no: contact
                })

            });

            await res.json();

            setSaved(true);
            setEditing(false);

            setTimeout(() => setSaved(false), 2500);

        } catch (err) {

            console.error("Update failed:", err);

        }

    };



    return (
        <HospitalLayout title="Profile" page="PROFILE">

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'linear-gradient(135deg,rgba(217,0,37,0.08) 0%,rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: '36px 40px' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>

                        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building2 size={36} color="var(--red)" />
                        </div>

                        <div style={{ flex: 1 }}>

                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: '#fff', lineHeight: 1 }}>
                                {name}
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>HOSPITAL</span>
                                <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{city}</span>
                            </div>

                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 8 }}>
                                ID: {hospitalId} · {beds} Beds · Kerala
                            </div>

                        </div>

                        <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>
                            <Edit2 size={14} /> Edit Profile
                        </button>

                    </div>
                </motion.div>



                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {TABS.map((t, i) => (
                        <button key={t} onClick={() => setTab(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px 24px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: tab === i ? 600 : 400, color: tab === i ? '#fff' : 'var(--text3)', borderBottom: `2px solid ${tab === i ? 'var(--red)' : 'transparent'}` }}>
                            {t}
                        </button>
                    ))}
                </div>



                {tab === 0 && (

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>

                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Hospital Information</div>

                            {saved && <div style={{ marginTop: 10, color: '#22c55e' }}>✓ Changes saved successfully</div>}

                            <label style={lS}>HOSPITAL NAME</label>
                            <input value={name} onChange={e => setName(e.target.value)} disabled={!editing} style={{ ...iS, opacity: editing ? 1 : 0.6 }} />

                            <label style={lS}>CITY</label>
                            <input value={city} onChange={e => setCity(e.target.value)} disabled={!editing} style={{ ...iS, opacity: editing ? 1 : 0.6 }} />

                            <label style={lS}>CONTACT</label>
                            <input value={contact} onChange={e => setContact(e.target.value)} disabled={!editing} style={{ ...iS, opacity: editing ? 1 : 0.6 }} />

                            {editing && (
                                <button onClick={handleSave} style={{ marginTop: 20, background: 'var(--red)', border: 'none', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', color: '#fff' }}>
                                    Save Changes
                                </button>
                            )}

                        </motion.div>



                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>

                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 16 }}>Hospital Summary</div>

                            <InfoRow label="Hospital ID" value={hospitalId} />
                            <InfoRow label="City" value={city} />
                            <InfoRow label="Contact" value={contact} />
                            <InfoRow label="Active Patients" value={mockPatients.length} />
                            <InfoRow label="Total Requests" value={mockBloodRequests.length} />
                            <InfoRow label="Fulfillment Rate" value={fulfillRate + '%'} />

                            <button style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>
                                <Download size={14} /> Download Hospital Report
                            </button>

                        </motion.div>

                    </div>

                )}

            </div>

        </HospitalLayout>
    );
}