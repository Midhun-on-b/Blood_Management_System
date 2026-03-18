import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';
import { EligibilityBadge } from '../../components/donor/DonorSidebar';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const TABS = ['Personal Details', 'Account Settings'];

function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

export default function DonorProfile() {

    const [tab, setTab] = useState(0);
    const [donor, setDonor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        blood_group: '',
        phone_no: '',
        city: '',
        last_donation_date: ''
    });
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        fetch("http://localhost:5000/donors/1")
            .then(async (res) => {
                const data = await res.json();

                if (!res.ok || !data || typeof data.name !== "string") {
                    throw new Error(data?.message || "Invalid donor response");
                }

                return data;
            })
            .then(data => {
                setDonor(data);
                setFormData({
                    name: data.name ?? '',
                    age: data.age ?? '',
                    gender: data.gender ?? '',
                    blood_group: data.blood_group ?? '',
                    phone_no: data.phone_no == null ? '' : String(data.phone_no),
                    city: data.city ?? '',
                    last_donation_date: data.last_donation_date
                        ? new Date(data.last_donation_date).toISOString().slice(0, 10)
                        : ''
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching donor:", err);
                setDonor(null);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <DonorLayout title="My Profile">
                <div style={{ padding: 40, color: "white" }}>Loading profile...</div>
            </DonorLayout>
        );
    }

    if (!donor) {
        return (
            <DonorLayout title="My Profile">
                <div style={{ padding: 40, color: "white" }}>No donor found.</div>
            </DonorLayout>
        );
    }

    const initials = donor.name
        ? donor.name.split(' ').filter(Boolean).map(n => n[0]).join('')
        : 'DN';

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        setSaveMessage('');
        setSaveError('');

        const donorId = donor?.donor_id || 1;

        try {
            const payload = {
                name: formData.name.trim(),
                age: formData.age === '' ? null : Number(formData.age),
                gender: formData.gender,
                phone_no: formData.phone_no.trim(),
                blood_group: formData.blood_group,
                city: formData.city.trim(),
                last_donation_date: formData.last_donation_date || null
            };

            const res = await fetch(`http://localhost:5000/donors/${donorId}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || data?.message || 'Failed to save settings');
            }

            if (data?.donor) {
                setDonor(data.donor);
                setFormData({
                    name: data.donor.name ?? '',
                    age: data.donor.age ?? '',
                    gender: data.donor.gender ?? '',
                    blood_group: data.donor.blood_group ?? '',
                    phone_no: data.donor.phone_no == null ? '' : String(data.donor.phone_no),
                    city: data.donor.city ?? '',
                    last_donation_date: data.donor.last_donation_date
                        ? new Date(data.donor.last_donation_date).toISOString().slice(0, 10)
                        : ''
                });
            }

            setSaveMessage('Settings updated successfully.');
        } catch (error) {
            console.error('Error saving donor settings:', error);
            setSaveError(error.message || 'Unable to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: '#0A0A12',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '12px 14px',
        fontSize: 14,
        color: '#fff',
        marginBottom: 16
    };

    const labelStyle = {
        display: 'block',
        fontSize: 9,
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: 8
    };

    return (
        <DonorLayout title="My Profile" page="PROFILE">

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'linear-gradient(135deg,#0F0F17 0%,#1A0A0F 100%)',
                        border: '1px solid rgba(217,0,37,0.2)',
                        borderRadius: 20,
                        padding: 36,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 28,
                    }}
                >
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #D90025, #8B0010)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        color: '#fff'
                    }}>
                        {initials}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 36, color: '#fff', marginBottom: 8 }}>
                            {donor.name}
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span style={{
                                background: 'rgba(217,0,37,0.1)',
                                border: '1px solid rgba(217,0,37,0.3)',
                                borderRadius: 100,
                                padding: '3px 12px',
                                fontSize: 12,
                                color: 'var(--red)'
                            }}>
                                {donor.blood_group}
                            </span>

                            <EligibilityBadge status={donor.status} />
                        </div>

                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 10 }}>
                            ID: {donor.donor_id} · {donor.city}, Kerala
                        </div>
                    </div>

                    <button
                        onClick={() => setTab(1)}
                        style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        padding: '10px 18px',
                        cursor: 'pointer',
                        color: 'var(--text2)'
                    }}
                    >
                        <Edit2 size={14} /> Edit Profile
                    </button>
                </motion.div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {TABS.map((t, i) => (
                        <button
                            key={t}
                            onClick={() => setTab(i)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '12px 20px',
                                color: tab === i ? '#fff' : 'var(--text3)',
                                borderBottom: tab === i ? '2px solid var(--red)' : 'none'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {tab === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div style={{
                                background: '#0F0F17',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 20,
                                padding: 28
                            }}>
                                <label style={labelStyle}>Full Name</label>
                                <input value={donor.name} style={inputStyle} readOnly />

                                <label style={labelStyle}>Age</label>
                                <input value={donor.age} style={inputStyle} readOnly />

                                <label style={labelStyle}>Gender</label>
                                <input value={donor.gender} style={inputStyle} readOnly />

                                <label style={labelStyle}>Blood Group</label>
                                <input value={donor.blood_group} style={inputStyle} readOnly />

                                <label style={labelStyle}>Phone</label>
                                <input value={donor.phone_no} style={inputStyle} readOnly />

                                <label style={labelStyle}>City</label>
                                <input value={donor.city} style={inputStyle} readOnly />

                                <label style={labelStyle}>Last Donation</label>
                                <input value={formatDate(donor.last_donation_date)} style={inputStyle} readOnly />
                            </div>
                        </motion.div>
                    )}
                    {tab === 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div style={{
                                background: '#0F0F17',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 20,
                                padding: 28
                            }}>
                                <label style={labelStyle}>Full Name</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => handleFieldChange('name', e.target.value)}
                                    style={inputStyle}
                                />

                                <label style={labelStyle}>Age</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => handleFieldChange('age', e.target.value)}
                                    style={inputStyle}
                                />

                                <label style={labelStyle}>Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="">Select gender</option>
                                    {GENDERS.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>

                                <label style={labelStyle}>Blood Group</label>
                                <select
                                    value={formData.blood_group}
                                    onChange={(e) => handleFieldChange('blood_group', e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="">Select blood group</option>
                                    {BLOOD_GROUPS.map((bg) => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>

                                <label style={labelStyle}>Phone</label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    maxLength={15}
                                    value={formData.phone_no}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        const cleaned = raw
                                            .replace(/[^\d+]/g, '')
                                            .replace(/(?!^)\+/g, '');
                                        handleFieldChange('phone_no', cleaned);
                                    }}
                                    style={inputStyle}
                                />

                                <label style={labelStyle}>City</label>
                                <input
                                    value={formData.city}
                                    onChange={(e) => handleFieldChange('city', e.target.value)}
                                    style={inputStyle}
                                />

                                <label style={labelStyle}>Last Donation Date</label>
                                <input
                                    type="date"
                                    value={formData.last_donation_date}
                                    onChange={(e) => handleFieldChange('last_donation_date', e.target.value)}
                                    style={inputStyle}
                                />

                                {saveError && (
                                    <div style={{ color: '#f87171', marginBottom: 12, fontSize: 13 }}>
                                        {saveError}
                                    </div>
                                )}
                                {saveMessage && (
                                    <div style={{ color: '#22c55e', marginBottom: 12, fontSize: 13 }}>
                                        {saveMessage}
                                    </div>
                                )}

                                <button
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                    style={{
                                        background: 'var(--red)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 10,
                                        padding: '12px 18px',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        opacity: saving ? 0.7 : 1
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </DonorLayout>
    );
}
