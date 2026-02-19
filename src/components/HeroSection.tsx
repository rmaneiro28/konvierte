
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import { Flag } from './ui/Flag';
import { formatCurrency } from '../utils/formatters';

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
    handleSwapCurrencies,
    setFixedAmount,
    usdInputRef,
    vesInputRef,
    activeRateValue,
    allRates,
    activeSource,
    isInverse
}) => {
    return (
        <div className="flex-1 flex flex-col justify-center w-full relative">
            <section className="flex flex-col w-full gap-2 relative z-10 items-center justify-center">
                {/* Fixed Dual Layout: Always show Source -> Target */}
                {[isInverse ? 'VES' : 'USD', 'SWAP', isInverse ? 'USD' : 'VES'].map((type) => {
                    if (type === 'SWAP') {
                        return (
                            <div key="swap-btn" className="flex justify-center -my-3 relative z-20 opacity-40 hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleSwapCurrencies}
                                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-primary hover:bg-white/5 transition-all active:scale-95 bg-background/50 backdrop-blur-sm"
                                    aria-label="Intercambiar divisas"
                                >
                                    <ArrowLeftRight size={14} className="rotate-90" />
                                </button>
                            </div>
                        );
                    }

                    const isUSD = type === 'USD';
                    const ref = isUSD ? usdInputRef : vesInputRef;
                    const value = isUSD ? inputUSD : inputVES;
                    const isFocused = focusedInput === type;
                    const currencyCode = isUSD ? (allRates[activeSource]?.flag === 'eu' ? 'EUR' : 'USD') : 'VES';
                    const currencySymbol = isUSD ? (allRates[activeSource]?.flag === 'eu' ? '€' : '$') : 'Bs.';

                    return (
                        <button
                            key={type}
                            ref={ref}
                            onClick={() => handleInputFocus(type as 'USD' | 'VES')}
                            className={`w-full text-center relative p-1 transition-all duration-300 group outline-none
                                ${isFocused ? 'scale-[1.01]' : 'hover:opacity-80 active:scale-95'}
                            `}
                        >
                            {/* Label & Flag */}
                            <div className="flex flex-col items-center gap-1 mb-0.5">
                                {isFocused && <motion.div layoutId="active-dot" className="w-1 h-1 bg-primary rounded-full absolute -top-2" />}
                                <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    <Flag code={isUSD ? (allRates[activeSource]?.flag || 'us') : 've'} className="w-3.5 h-3.5 shadow-sm rounded-[2px]" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{currencyCode}</span>
                                    {!isUSD && (
                                        <span className="text-[8px] font-bold text-primary/70 ml-2 tracking-normal">
                                            {allRates[activeSource]?.name} @ {formatCurrency(activeRateValue)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Value - Smaller Size */}
                            <div className="flex items-center justify-center gap-0.5">
                                <span className="text-xl font-bold opacity-20 self-start mt-1.5 mr-0.5 select-none">{currencySymbol}</span>
                                <span className={`text-5xl md:text-5xl font-black tracking-tighter truncate max-w-full ${!value ? 'opacity-20' : 'text-primary'}`}>
                                    {value || '0,00'}
                                </span>
                                {isFocused && <span className="w-0.5 h-8 bg-primary animate-pulse ml-0.5 rounded-full opacity-50" />}
                            </div>

                            {/* Quick Chips (Only for USD) */}
                            {isUSD && (
                                <div className="overflow-hidden w-full mt-2">
                                    <div className="flex justify-center gap-1.5 flex-wrap">
                                        {[1, 5, 10, 20, 50, 100].map(v => (
                                            <span key={v}
                                                onClick={(e) => { e.stopPropagation(); setFixedAmount(v.toString(), 'USD'); }}
                                                className="text-[12px] font-bold px-2.5 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-primary/20 hover:border-primary/20 transition-all cursor-pointer active:scale-95"
                                            >
                                                {currencySymbol}{v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </section>


        </div>
    );
};
