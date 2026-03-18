import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Check, X, Building2, Clock3 } from 'lucide-react';
import DonorLayout from '../../components/donor/DonorLayout';
import { mockBloodBanks } from '../../data/mockData';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

const panelStyle = {
    background: '#0F0F17',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 24
};

function BookingModal({ bank, onClose, onConfirm }) {
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);
    const [done, setDone] = useState(false);

    const today = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return d;
    });

    const handleConfirm = () => {
        if (!date || !time) return;
        onConfirm({
            bank_name: bank.bank_name,
            date: date.toISOString(),
            time
        });
        setDone(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(6px)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 18 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                    background: '#0F0F17',
                    border: '1px solid rgba(217,0,37,0.22)',
                    borderRadius: 22,
                    padding: 30,
                    width: '100%',
                    maxWidth: 520,
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} color="var(--text3)" />
                </button>

                {done ? (
                    <div style={{ textAlign: 'center', padding: '16px 0 10px' }}>
                        <div style={{
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            background: 'rgba(34,197,94,0.15)',
                            border: '1px solid rgba(34,197,94,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 14px'
                        }}>
                            <Check size={30} color="#22c55e" />
                        </div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 24, color: '#fff', marginBottom: 6 }}>
                            Appointment Booked
                        </div>
                        <div style={{ color: 'var(--text2)', marginBottom: 18 }}>{bank.bank_name}</div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: '1px solid rgba(255,255,255,0.14)',
                                borderRadius: 10,
                                padding: '10px 22px',
                                cursor: 'pointer',
                                color: '#fff'
                            }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 6 }}>
                            Book Donation Slot
                        </div>
                        <div style={{ color: 'var(--text3)', marginBottom: 18 }}>{bank.bank_name}</div>

                        <div style={{ marginBottom: 18 }}>
                            <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: 10 }}>
                                SELECT DATE
                            </div>
                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                                {days.map((d, i) => {
                                    const selected = date?.toDateString() === d.toDateString();
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setDate(d)}
                                            style={{
                                                minWidth: 76,
                                                padding: '9px 10px',
                                                borderRadius: 10,
                                                border: selected ? '1px solid var(--red)' : '1px solid rgba(255,255,255,0.1)',
                                                background: selected ? 'rgba(217,0,37,0.14)' : '#0A0A12',
                                                color: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ marginBottom: 22 }}>
                            <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: 10 }}>
                                SELECT TIME
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {TIME_SLOTS.map((t) => {
                                    const selected = time === t;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => setTime(t)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: 10,
                                                border: selected ? '1px solid var(--red)' : '1px solid rgba(255,255,255,0.1)',
                                                background: selected ? 'rgba(217,0,37,0.14)' : '#0A0A12',
                                                color: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={!date || !time}
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 10,
                                border: 'none',
                                background: date && time ? 'var(--red)' : 'rgba(255,255,255,0.08)',
                                color: '#fff',
                                cursor: date && time ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Confirm Booking
                        </button>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

export default function DonorSchedule() {
    const [bookingBank, setBookingBank] = useState(null);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('appointments');
        if (saved) setAppointments(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }, [appointments]);

    return (
        <DonorLayout title="Schedule Donation" page="SCHEDULE">
            <AnimatePresence>
                {bookingBank && (
                    <BookingModal
                        bank={bookingBank}
                        onClose={() => setBookingBank(null)}
                        onConfirm={(appointment) => setAppointments((prev) => [...prev, appointment])}
                    />
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {appointments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            ...panelStyle,
                            background: 'rgba(217,0,37,0.08)',
                            border: '1px solid rgba(217,0,37,0.24)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)', marginBottom: 10 }}>
                            <CalendarClock size={16} />
                            <span style={{ fontFamily: 'var(--font-sub)', fontWeight: 700 }}>Upcoming Appointments</span>
                        </div>
                        {appointments.map((a, i) => (
                            <div key={i} style={{ color: 'var(--text2)', padding: '6px 0' }}>
                                {a.bank_name} · {new Date(a.date).toLocaleDateString('en-IN')} · {a.time}
                            </div>
                        ))}
                    </motion.div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
                    gap: 14
                }}>
                    {mockBloodBanks.map((bank) => (
                        <motion.div
                            key={bank.bank_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={panelStyle}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    background: 'rgba(217,0,37,0.1)',
                                    border: '1px solid rgba(217,0,37,0.22)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Building2 size={16} color="var(--red)" />
                                </div>
                                <div style={{ color: '#fff', fontWeight: 700 }}>{bank.bank_name}</div>
                            </div>

                            <div style={{ color: 'var(--text2)', marginBottom: 6 }}>{bank.city}</div>
                            <div style={{ color: bank.open ? '#22c55e' : 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Clock3 size={14} />
                                {bank.open ? 'Open for booking' : 'Currently closed'}
                            </div>

                            <button
                                onClick={() => bank.open && setBookingBank(bank)}
                                disabled={!bank.open}
                                style={{
                                    width: '100%',
                                    padding: 11,
                                    borderRadius: 10,
                                    border: 'none',
                                    background: bank.open ? 'var(--red)' : 'rgba(255,255,255,0.08)',
                                    color: '#fff',
                                    cursor: bank.open ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {bank.open ? 'Book Appointment' : 'Closed'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </DonorLayout>
    );
}
