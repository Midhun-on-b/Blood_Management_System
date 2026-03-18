import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';
import { EligibilityBadge } from '../../components/donor/DonorSidebar';

/* ─── Helper ───────────────────────── */
function fmt(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

/* ─── Main Dashboard ───────────────── */
export default function DonorDashboard() {

    const navigate = useNavigate();

    const [donor, setDonor] = useState(null);
    const [loading, setLoading] = useState(true);

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
            <DonorLayout title="Dashboard">
                <div style={{ color: "white", padding: 40 }}>
                    Loading dashboard...
                </div>
            </DonorLayout>
        );
    }

    if (!donor) {
        return (
            <DonorLayout title="Dashboard">
                <div style={{ color: "white", padding: 40 }}>
                    No donor found.
                </div>
            </DonorLayout>
        );
    }

    const firstName = donor.name ? donor.name.split(" ")[0] : "Donor";

    return (
        <DonorLayout title="Dashboard">

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* ─── Welcome Banner ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: 'linear-gradient(135deg,#0F0F17 0%,#1A0A0F 100%)',
                        border: '1px solid rgba(217,0,37,0.2)',
                        borderRadius: 20,
                        padding: '32px 40px',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    {/* Big blood group background */}
                    <div style={{
                        position: 'absolute',
                        right: 32,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 180,
                        color: 'rgba(217,0,37,0.06)',
                        lineHeight: 1,
                        userSelect: 'none',
                    }}>
                        {donor.blood_group}
                    </div>

                    <div>
                        <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>
                            ◈ WELCOME BACK
                        </div>

                        <div style={{ fontSize: 42, color: '#fff', marginBottom: 12 }}>
                            Good Morning, {firstName}.
                        </div>

                        <div style={{
                            fontSize: 14,
                            color: donor.status === "active" ? "#22c55e" : "#f59e0b"
                        }}>
                            {donor.status === "active"
                                ? "🟢 You are eligible to donate."
                                : "⚠️ Currently inactive."
                            }
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/donor/schedule')}
                        style={{
                            background: 'var(--red)',
                            color: '#fff',
                            border: 'none',
                            padding: '13px 24px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <Calendar size={16} />
                        Schedule Now
                    </button>
                </motion.div>

                {/* ─── Donor Info Card ─── */}
                <div style={{
                    background: '#0F0F17',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    padding: 28
                }}>
                    <h3 style={{ color: "white", marginBottom: 16 }}>
                        Donor Information
                    </h3>

                    <div style={{ color: "white", lineHeight: 1.8 }}>
                        <p><strong>Name:</strong> {donor.name}</p>
                        <p><strong>Age:</strong> {donor.age}</p>
                        <p><strong>Gender:</strong> {donor.gender}</p>
                        <p><strong>Blood Group:</strong> {donor.blood_group}</p>
                        <p><strong>City:</strong> {donor.city}</p>
                        <p><strong>Last Donation:</strong> {fmt(donor.last_donation_date)}</p>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <EligibilityBadge status={donor.status} />
                    </div>
                </div>

            </div>

        </DonorLayout>
    );
}
