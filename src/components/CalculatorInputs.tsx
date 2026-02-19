
import React, { } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';
import { Flag } from './ui/Flag';

interface CalculatorInputsProps {
    inputUSD: string;
    inputVES: string;
    focusedInput: 'USD' | 'VES' | null;
    handleInputFocus: (type: 'USD' | 'VES') => void;
    setFixedAmount: (amount: string, type: 'USD' | 'VES') => void;
    isInverse: boolean;
    handleSwapCurrencies: () => void;
    allRates: any;
    activeSource: string;
    usdInputRef: React.RefObject<HTMLButtonElement | null>;
    vesInputRef: React.RefObject<HTMLButtonElement | null>;
}

export const CalculatorInputs: React.FC<CalculatorInputsProps> = ({
    inputUSD,
    inputVES,
    focusedInput,
    handleInputFocus,
    setFixedAmount,
    isInverse,
    handleSwapCurrencies,
    allRates,
    activeSource,
    usdInputRef,
    vesInputRef
}) => {
    return (
        <section className={`glass-card p-4 md:p-6 space-y-3 md:space-y-4 border-none shadow-2xl relative overflow-hidden transition-all duration-500 ${focusedInput ? 'pb-8' : ''}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"></div>

            {/* Renderizado dinámico basado en isInverse */}
            {[isInverse ? 'VES' : 'USD', 'SWAP', isInverse ? 'USD' : 'VES'].map((type) => {
                if (type === 'SWAP') {
                    return (
                        <div key="swap-btn" className="flex justify-center -my-4 md:-my-6 relative z-10">
                            <button
                                onClick={handleSwapCurrencies}
                                aria-label="Intercambiar divisas"
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface border border-border flex items-center justify-center text-primary hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95 shadow-lg"
                                title="Intercambiar Orden"
                            >
                                <ArrowRightLeft size={focusedInput ? 16 : 20} className="rotate-90 md:rotate-0" />
                            </button>
                        </div>
                    );
                }

                const isUSD = type === 'USD';
                const ref = isUSD ? usdInputRef : vesInputRef;
                const value = isUSD ? inputUSD : inputVES;
                const isFocused = focusedInput === type;

                // Using any type assertion to bypass strict null checks for ref if necessary, 
                // though RefObject should work fine.

                return (
                    <button
                        key={type}
                        ref={ref}
                        className={`w-full text-left relative cursor-pointer calculator-input p-3 rounded-2xl transition-all duration-300 border border-white/10 bg-white/5 ${isFocused ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/20 scale-[1.01]' : 'hover:bg-white/10'}`}
                        onClick={() => handleInputFocus(type as 'USD' | 'VES')}
                        aria-label={`Editar monto en ${isUSD ? (allRates[activeSource]?.name || 'Divisa') : 'Bolívares'}`}
                        aria-current={isFocused}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Flag code={isUSD ? (allRates[activeSource]?.flag || 'us') : 've'} />
                                <span className={`label-zen !mb-0 transition-opacity ${isFocused ? 'opacity-100' : 'opacity-60'}`}>
                                    {isUSD ? `Importe Divisa (${allRates[activeSource]?.flag === 'eu' ? 'EUR' : 'USD'})` : 'Ajustar Bolívares (VES)'}
                                </span>
                            </div>
                            {isFocused ? (
                                <motion.div layoutId="focus-pill" className="w-1.5 h-1.5 bg-primary rounded-full" />
                            ) : (
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-80 animate-pulse">Editar</span>
                            )}
                        </div>
                        <div className={`input-zen !text-2xl md:input-zen md:!text-3xl transition-opacity flex items-center ${isFocused ? 'opacity-100' : 'opacity-70'}`}>
                            <span className="text-xl font-bold opacity-60 mr-2">{isUSD ? (allRates[activeSource]?.flag === 'eu' ? '€' : '$') : 'Bs.'}</span>
                            {value || <span className="opacity-60">0,00</span>}
                            {isFocused && <span className="inline-block w-1 h-8 bg-primary/50 ml-1 animate-pulse" />}
                        </div>

                        {isUSD && !isInverse && !focusedInput && (
                            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                                {[1, 5, 10, 20, 50, 100].map(v => (
                                    <span key={v} onClick={(e) => { e.stopPropagation(); setFixedAmount(v.toString(), 'USD'); }}
                                        className="text-[10px] font-black px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-border rounded-lg hover:bg-primary/20 transition-all whitespace-nowrap cursor-pointer">
                                        {v}{allRates[activeSource]?.flag === 'eu' ? '€' : '$'}
                                    </span>
                                ))}
                            </div>
                        )}
                    </button>
                );
            })}
        </section>
    );
};
