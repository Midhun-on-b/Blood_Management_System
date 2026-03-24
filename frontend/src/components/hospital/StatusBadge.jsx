export default function StatusBadge({ status }) {
    const cfg = {
        Pending: {
            bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',
            color: '#f59e0b', label: '⏳ PENDING',
        },
        Approved: {
            bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)',
            color: '#22c55e', label: '✓ APPROVED',
        },
        Rejected: {
            bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)',
            color: '#ef4444', label: '✗ REJECTED',
        },
        Processing: {
            bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)',
            color: '#818cf8', label: '⟳ PROCESSING',
        },
        Completed: {
            bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)',
            color: '#22c55e', label: '✓ COMPLETED',
        },
        Fulfilled: {
            bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)',
            color: '#22c55e', label: '✓ FULFILLED',
        },
        Cancelled: {
            bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)',
            color: 'var(--text3)', label: '✕ CANCELLED',
        },
        Paid: {
            bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)',
            color: '#22c55e', label: 'PAID',
        },
        Overdue: {
            bg: 'rgba(217,0,37,0.1)', border: 'rgba(217,0,37,0.3)',
            color: '#FF4460', label: 'OVERDUE',
        },
    };

    const normalized = String(status || '').trim();
    const normalizedKey = normalized
        ? normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
        : 'Cancelled';

    const c = cfg[normalizedKey] || cfg.Cancelled;

    return (
        <span style={{
            display: 'inline-block',
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 100, padding: '3px 12px',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: c.color, letterSpacing: '0.06em',
            userSelect: 'none',
        }}>
            {c.label}
        </span>
    );
}
