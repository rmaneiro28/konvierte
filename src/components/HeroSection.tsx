
import React from 'react';
import { Flag } from './ui/Flag';

interface HeroSectionProps {
    focusedInput: 'USD' | 'VES' | null;
    inputUSD: string;
    inputVES: string;
    handleInputFocus: (type: 'USD' | 'VES') => void;
    handleSwapCurrencies: () => void;
    setFixedAmount: (amount: string, type: 'USD' | 'VES') => void;
    usdInputRef: React.RefObject<HTMLButtonElement | null>;
    vesInputRef: React.RefObject<HTMLButtonElement | null>;
    activeRateValue: number;
    allRates: any;
    activeSource: string;
    isInverse: boolean;
    lastEdited: 'USD' | 'VES';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    focusedInput,
    inputUSD,
    inputVES,
    handleInputFocus,
    usdInputRef,
    vesInputRef,
    allRates,
    activeSource,
    isInverse
}) => {
    return (
        <div className="flex flex-col w-full gap-4 items-center">
            {[isInverse ? 'VES' : 'USD', isInverse ? 'USD' : 'VES'].map((type) => {
                const isUSD = type === 'USD';
                const ref = isUSD ? usdInputRef : vesInputRef;
                const value = isUSD ? inputUSD : inputVES;
                const isFocused = focusedInput === type;
                const currencyCode = isUSD ? (allRates[activeSource]?.flag === 'eu' ? 'EUR' : 'USD') : 'VES';
                const currencySymbol = isUSD ? (allRates[activeSource]?.flag === 'eu' ? '€' : '$') : 'Bs.';
                const flagCode = isUSD ? (allRates[activeSource]?.flag || 'us') : 've';

                return (
                    <button
                        key={type}
                        ref={ref}
                        onClick={() => handleInputFocus(type as 'USD' | 'VES')}
                        className={`w-full max-w-sm flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all duration-300 outline-none group
                            ${isFocused ? 'bg-primary/5 border border-primary/20 scale-[1.02]' : 'bg-transparent border border-transparent opacity-60 hover:opacity-100'}
                        `}
                    >
                        {/* Flag & Label */}
                        <div className="flex items-center gap-2 mb-2">
                            <Flag code={flagCode} className="w-4 h-4 shadow-sm" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{currencyCode}</span>
                        </div>

                        {/* Value Display */}
                        <div className="flex items-center justify-center gap-1">
                            <span className={`text-lg font-bold mr-1 ${isFocused ? 'text-primary' : 'opacity-20'}`}>
                                {currencySymbol}
                            </span>
                            <span className={`text-4xl md:text-5xl font-black tracking-tighter ${isFocused ? 'text-primary' : 'text-main'}`}>
                                {value || '0,00'}
                            </span>
                            {isFocused && (
                                <span className="w-0.5 h-8 bg-primary animate-pulse ml-1 rounded-full opacity-50" />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
