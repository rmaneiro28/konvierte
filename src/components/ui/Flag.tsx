
import React, { useState } from 'react';

export const Flag = React.memo(({ code, className = "w-4 h-4" }: { code: string; className?: string }) => {
    const [error, setError] = useState(false);
    const [FallbackSvg, setFallbackSvg] = useState<React.ReactNode>(null);
    const flagCode = code.toLowerCase();

    // Mapeo simple de códigos a los nombres de FlagCDN
    const flagUrl = `https://flagcdn.com/${flagCode === 'us' ? 'us' : flagCode === 've' ? 've' : flagCode === 'eu' ? 'eu' : 'un'}.svg`;

    const handleError = async () => {
        setError(true);
        // Carga dinámica del fallback SVG solo cuando sea necesario
        // Note: Adjust path if necessary based on where this component lives relative to assets
        try {
            const { SVG_FLAGS } = await import('../../assets/flags');
            setFallbackSvg(SVG_FLAGS[flagCode] || null);
        } catch (e) {
            console.warn("Failed to load flags fallback", e);
        }
    };

    return (
        <div className={`${className} rounded-full overflow-hidden flex-shrink-0 bg-white/10 border border-white/10 flex items-center justify-center relative`}>
            {!error ? (
                <img
                    src={flagUrl}
                    alt={code}
                    className="w-full h-full object-cover"
                    onError={handleError}
                />
            ) : (
                FallbackSvg || (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[8px] font-black uppercase tracking-tighter">?</div>
                )
            )}
        </div>
    );
});
Flag.displayName = "Flag";
