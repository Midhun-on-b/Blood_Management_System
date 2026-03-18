import { motion } from 'framer-motion';

function SkeletonBlock({ height, width = '100%', radius = 10 }) {
    return (
        <div
            style={{
                width,
                height,
                borderRadius: radius,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.11) 50%, rgba(255,255,255,0.04) 100%)',
                backgroundSize: '220% 100%',
                animation: 'donorSkeletonShimmer 1.35s ease-in-out infinite'
            }}
        />
    );
}

export default function DonorLoadingSkeleton({ showHero = true, cardCount = 3, listRows = 4, showFilters = false }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
            {showHero && (
                <div style={{
                    background: '#0F0F17',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 22,
                    padding: 24
                }}>
                    <SkeletonBlock height={12} width={110} />
                    <div style={{ marginTop: 12 }}><SkeletonBlock height={36} width="58%" /></div>
                    <div style={{ marginTop: 12 }}><SkeletonBlock height={14} width="45%" /></div>
                    <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                        <SkeletonBlock height={30} width={120} radius={100} />
                        <SkeletonBlock height={30} width={140} radius={100} />
                    </div>
                </div>
            )}

            {showFilters && (
                <div style={{
                    background: '#0F0F17',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    padding: 16,
                    display: 'grid',
                    gridTemplateColumns: '1fr 220px',
                    gap: 12
                }}>
                    <SkeletonBlock height={42} radius={10} />
                    <SkeletonBlock height={42} radius={10} />
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                gap: 12
            }}>
                {Array.from({ length: cardCount }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            background: '#0F0F17',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 20,
                            padding: 20
                        }}
                    >
                        <SkeletonBlock height={10} width={90} />
                        <div style={{ marginTop: 14 }}><SkeletonBlock height={28} width="72%" /></div>
                    </div>
                ))}
            </div>

            {listRows > 0 && (
                <div style={{
                    background: '#0F0F17',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    padding: 20
                }}>
                    <SkeletonBlock height={14} width={160} />
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {Array.from({ length: listRows }).map((_, i) => (
                            <SkeletonBlock key={i} height={14} width={`${92 - i * 7}%`} />
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes donorSkeletonShimmer {
                    0% { background-position: 100% 0; }
                    100% { background-position: -100% 0; }
                }
            `}</style>
        </motion.div>
    );
}
