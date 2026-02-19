
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';
import { Flag } from './ui/Flag';

interface HeroSectionProps {
    focusedInput: 'USD' | 'VES' | null;
    inputUSD: string;
    inputVES: string;
    lastEdited: 'USD' | 'VES';
    activeRateValue: number;
    allRates: any;
    activeSource: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    focusedInput,
    inputUSD,
    inputVES,
    lastEdited,
    activeRateValue,
    allRates,
    activeSource
}) => {
    return (
        <div className="rounded-[2.5rem] bg-transparent p-1 flex-1 flex flex-col justify-center">
            {/* Hero: Resalta el resultado opuesto a la entrada (Zen Logic) */}
            <section className={`text-center transition-all duration-300 ${focusedInput ? 'mb-2' : 'mb-4'}`}>
                <div className="flex flex-col items-center">
                    {(() => {
                        const typingValue = focusedInput === 'USD' ? inputUSD : inputVES;

                        // Si no hay nada enfocado, mostramos el "Resultado" grande como antes (Zen Logic)
                        if (!focusedInput) {
                            const mainValue = lastEdited === 'USD' ? (inputVES || formatCurrency(activeRateValue)) : (inputUSD || '1.00');
                            const isUSDHero = lastEdited === 'VES';
                            const numericValue = parseFloat(mainValue.replace(/\./g, '').replace(',', '.'));
                            const fontSizeClass = numericValue >= 100000 ? 'text-4xl' : numericValue >= 10000 ? 'text-5xl' : 'text-7xl';

                            return (
                                <>
                                    <span className="label-zen text-center text-primary !opacity-80 !tracking-[0.6em] mb-2 text-[10px]">
                                        {lastEdited === 'USD' ? 'Monto Calculado (VES)' : 'Equivalente en Divisa (USD)'}
                                    </span>
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-2">
                                        <Flag code={isUSDHero ? 'us' : 've'} className="w-12 h-12 border-4 border-surface shadow-2xl" />
                                    </motion.div>
                                    <motion.span key="hero-static" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${fontSizeClass} font-black tracking-tighter text-primary truncate max-w-full`}>
                                        <span className="text-xl font-bold opacity-60 mr-1">{isUSDHero ? '$' : 'Bs.'}</span>
                                        {mainValue.split(',')[0] || '0'}
                                        <span className="text-2xl opacity-70">,{mainValue.split(',')[1] || '00'}</span>
                                    </motion.span>
                                </>
                            );
                        }

                        // Si está enfocado, mostramos un diseño dual: Entrada y Salida
                        return (
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2 opacity-80 mb-1">
                                    <Flag code={focusedInput === 'USD' ? 'us' : 've'} className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Escribiendo {focusedInput}</span>
                                </div>
                                <motion.div key="hero-typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-black text-primary">
                                    {focusedInput === 'USD' ? '$' : 'Bs.'} {typingValue || '0'}
                                </motion.div>
                                <div className="w-8 h-px bg-primary/20 my-1" />
                                <div className="flex items-center gap-2 opacity-80 mb-1">
                                    <Flag code={focusedInput === 'USD' ? 've' : 'us'} className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Resultado</span>
                                </div>
                                <motion.div key="hero-result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl font-black text-primary">
                                    <span className="text-lg opacity-80 mr-1">{focusedInput === 'USD' ? 'Bs.' : '$'}</span>
                                    {(focusedInput === 'USD' ? inputVES : inputUSD).split(',')[0] || '0'}
                                    <span className="text-xl opacity-90">,{(focusedInput === 'USD' ? inputVES : inputUSD).split(',')[1] || '00'}</span>
                                </motion.div>
                            </div>
                        );
                    })()}
                    {!focusedInput && (
                        <div className="mt-4 flex items-center gap-2 opacity-80">
                            <span className="text-[10px] font-black uppercase tracking-widest">{allRates[activeSource]?.name} @ {formatCurrency(activeRateValue)}</span>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
