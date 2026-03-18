import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, User, Phone, MapPin, Droplets, CalendarDays } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';
import { EligibilityBadge } from '../../components/donor/DonorSidebar';
import DonorLoadingSkeleton from '../../components/donor/DonorLoadingSkeleton';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const TABS = ['Personal Details', 'Account Settings'];

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

const panelStyle = {
    background: '#0F0F17',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 22,
    padding: 24
};

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
        fetch('http://localhost:5000/donors/1')
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok || !data || typeof data.name !== 'string') {
                    throw new Error(data?.message || 'Invalid donor response');
                }
                return data;
            })
            .then((data) => {
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
            .catch((err) => {
                console.error('Error fetching donor:', err);
                setDonor(null);
                setLoading(false);
            });
    }, []);

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({
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

    if (loading) {
        return (
            <DonorLayout title="My Profile" page="PROFILE">
                <DonorLoadingSkeleton showHero cardCount={3} listRows={5} />
            </DonorLayout>
        );
    }

    if (!donor) {
        return (
            <DonorLayout title="My Profile" page="PROFILE">
                <div style={{ ...panelStyle, color: '#fff' }}>No donor found.</div>
            </DonorLayout>
        );
    }

    const initials = donor.name
        ? donor.name.split(' ').filter(Boolean).map((n) => n[0]).join('')
        : 'DN';

    const profileStats = [
        { icon: Droplets, label: 'Blood Group', value: donor.blood_group || 'N/A' },
        { icon: MapPin, label: 'City', value: donor.city || 'N/A' },
        { icon: CalendarDays, label: 'Last Donation', value: formatDate(donor.last_donation_date) }
    ];

    const inputStyle = {
        width: '100%',
        background: '#0A0A12',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        padding: '11px 13px',
        fontSize: 14,
        color: '#fff',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        fontSize: 10,
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 7
    };

    return (
        <DonorLayout title="My Profile" page="PROFILE">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'linear-gradient(145deg,#0F0F17 0%,#1A0A0F 55%,#220A10 100%)',
                        border: '1px solid rgba(217,0,37,0.24)',
                        borderRadius: 24,
                        padding: '26px 28px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        right: -8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 150,
                        color: 'rgba(217,0,37,0.08)',
                        lineHeight: 1,
                        userSelect: 'none'
                    }}>
                        {donor.blood_group}
                    </div>

                    <div style={{
                        width: 74,
                        height: 74,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #D90025, #8B0010)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        color: '#fff',
                        flexShrink: 0,
                        zIndex: 1
                    }}>
                        {initials}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                        <div style={{ fontSize: 34, color: '#fff', marginBottom: 7 }}>{donor.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                            <span style={{
                                background: 'rgba(217,0,37,0.12)',
                                border: '1px solid rgba(217,0,37,0.3)',
                                borderRadius: 100,
                                padding: '4px 12px',
                                fontSize: 12,
                                color: 'var(--red)'
                            }}>
                                {donor.blood_group}
                            </span>
                            <EligibilityBadge status={donor.status} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                            ID: {donor.donor_id} · {donor.city}, Kerala
                        </div>
                    </div>

                    <button
                        onClick={() => setTab(1)}
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.14)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            cursor: 'pointer',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            zIndex: 1
                        }}
                    >
                        <Edit2 size={14} /> Edit Profile
                    </button>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                    gap: 12
                }}>
                    {profileStats.map(({ icon: Icon, label, value }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={panelStyle}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 10,
                                    background: 'rgba(217,0,37,0.1)',
                                    border: '1px solid rgba(217,0,37,0.22)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={15} color="var(--red)" />
                                </div>
                                <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {label}
                                </span>
                            </div>
                            <div style={{ color: '#fff', fontSize: 22 }}>{value}</div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ ...panelStyle, padding: 10 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {TABS.map((t, i) => (
                            <button
                                key={t}
                                onClick={() => setTab(i)}
                                style={{
                                    background: tab === i ? 'rgba(217,0,37,0.16)' : 'transparent',
                                    border: tab === i ? '1px solid rgba(217,0,37,0.35)' : '1px solid transparent',
                                    cursor: 'pointer',
                                    padding: '9px 14px',
                                    color: tab === i ? '#fff' : 'var(--text3)',
                                    borderRadius: 10
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {tab === 0 && (
                        <motion.div
                            key="profile-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={panelStyle}
                        >
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                                gap: 14
                            }}>
                                {[
                                    { icon: User, label: 'Full Name', value: donor.name || 'N/A' },
                                    { label: 'Age', value: donor.age || 'N/A' },
                                    { label: 'Gender', value: donor.gender || 'N/A' },
                                    { icon: Droplets, label: 'Blood Group', value: donor.blood_group || 'N/A' },
                                    { icon: Phone, label: 'Phone', value: donor.phone_no || 'N/A' },
                                    { icon: MapPin, label: 'City', value: donor.city || 'N/A' },
                                    { icon: CalendarDays, label: 'Last Donation', value: formatDate(donor.last_donation_date) }
                                ].map((field) => (
                                    <div key={field.label} style={{
                                        background: '#0A0A12',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 12,
                                        padding: '12px 14px'
                                    }}>
                                        <div style={{ ...labelStyle, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {field.icon ? <field.icon size={12} color="var(--text3)" /> : null}
                                            {field.label}
                                        </div>
                                        <div style={{ color: '#fff' }}>{field.value}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {tab === 1 && (
                        <motion.div
                            key="profile-edit"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={panelStyle}
                        >
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                                gap: 14
                            }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Age</label>
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => handleFieldChange('age', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
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
                                </div>

                                <div>
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
                                </div>

                                <div>
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
                                </div>

                                <div>
                                    <label style={labelStyle}>City</label>
                                    <input
                                        value={formData.city}
                                        onChange={(e) => handleFieldChange('city', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Last Donation Date</label>
                                    <input
                                        type="date"
                                        value={formData.last_donation_date}
                                        onChange={(e) => handleFieldChange('last_donation_date', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {saveError && (
                                <div style={{
                                    marginTop: 14,
                                    color: '#f87171',
                                    background: 'rgba(248,113,113,0.1)',
                                    border: '1px solid rgba(248,113,113,0.25)',
                                    borderRadius: 10,
                                    padding: '10px 12px'
                                }}>
                                    {saveError}
                                </div>
                            )}
                            {saveMessage && (
                                <div style={{
                                    marginTop: 14,
                                    color: '#22c55e',
                                    background: 'rgba(34,197,94,0.1)',
                                    border: '1px solid rgba(34,197,94,0.25)',
                                    borderRadius: 10,
                                    padding: '10px 12px'
                                }}>
                                    {saveMessage}
                                </div>
                            )}

                            <div style={{ marginTop: 16 }}>
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
