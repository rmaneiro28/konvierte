import { forwardRef } from 'react';

// Generates a 1200x630 OG Image style card, or 1024x1024 app icon.
// We'll use this ref with html2canvas.
export const AppIconTemplate = forwardRef<HTMLDivElement>((_, ref) => {
    return (
        <div className="fixed top-0 left-[-200vw]">
            <div
                ref={ref}
                className="w-[1024px] h-[1024px] relative flex items-center justify-center bg-[#050505] overflow-hidden"
                style={{ fontFamily: 'Outfit, sans-serif' }}
            >
                {/* Background Ambient Glow */}
                <div
                    className="absolute -top-[200px] -right-[200px] w-[800px] h-[800px] blur-[200px] rounded-full opacity-30"
                    style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                />
                <div
                    className="absolute -bottom-[200px] -left-[200px] w-[700px] h-[700px] blur-[180px] rounded-full opacity-20"
                    style={{ background: 'rgba(59, 130, 246, 0.15)' }}
                />

                {/* Main Logo Container */}
                <div className="relative z-10 flex flex-col items-center gap-12 transform scale-150">
                    <div className="w-64 h-64 bg-[#111111] rounded-[4rem] flex items-center justify-center shadow-2xl border border-white/10 relative overflow-hidden backdrop-blur-xl p-8">
                        <div className="absolute inset-0 opacity-10 bg-[#10B981]" />

                        <img src="/favicon.svg" alt="Konvierte Logo" className="w-full h-full object-contain relative z-10" crossOrigin="anonymous" />
                    </div>
                </div>
            </div>
        </div>
    );
});

AppIconTemplate.displayName = 'AppIconTemplate';