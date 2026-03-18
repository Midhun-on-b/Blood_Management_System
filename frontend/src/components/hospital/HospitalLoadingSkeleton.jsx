import { motion } from 'framer-motion';

function Block({ h, w = '100%', r = 10 }) {
    return (
        <div
            style={{
                height: h,
                width: w,
                borderRadius: r,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.11) 50%, rgba(255,255,255,0.04) 100%)',
                backgroundSize: '220% 100%',
                animation: 'hospitalSkeletonShimmer 1.35s ease-in-out infinite'
            }}
        />
    );
}

export default function HospitalLoadingSkeleton({
    showHero = true,
    showFilters = false,
    cardCount = 4,
    listRows = 5
}) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {showHero && (
                <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 22, padding: 22 }}>
                    <Block h={12} w={120} />
                    <div style={{ marginTop: 12 }}><Block h={34} w="52%" /></div>
                    <div style={{ marginTop: 12 }}><Block h={14} w="42%" /></div>
                </div>
            )}

            {showFilters && (
                <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 16, display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12 }}>
                    <Block h={42} />
                    <Block h={42} />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
                {Array.from({ length: cardCount }).map((_, i) => (
                    <div key={i} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 18 }}>
                        <Block h={10} w={90} />
                        <div style={{ marginTop: 12 }}><Block h={28} w="65%" /></div>
                    </div>
                ))}
            </div>

            {listRows > 0 && (
                <div style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 18 }}>
                    <Block h={14} w={170} />
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {Array.from({ length: listRows }).map((_, i) => (
                            <Block key={i} h={14} w={`${95 - i * 6}%`} />
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes hospitalSkeletonShimmer {
                    0% { background-position: 100% 0; }
                    100% { background-position: -100% 0; }
                }
            `}</style>
        </motion.div>
    );
}
