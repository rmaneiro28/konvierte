import React from 'react';
import { Flag } from './ui/Flag';
import { formatCurrency } from '../utils/formatters';
import { twMerge } from 'tailwind-merge';

interface RateSelectorProps {
    ratesOrder: string[];
    allRates: any;
    activeSource: string;
    selectRate: (id: string) => void;
    className?: string;
}

export const RateSelector: React.FC<RateSelectorProps> = ({ ratesOrder, allRates, activeSource, selectRate, className }) => {
    return (
        <section className={twMerge("flex gap-3 overflow-x-auto no-scrollbar py-0.5 mb-0", className)}>
            {ratesOrder.map((id) => {
                const data = allRates[id];
                if (!data) return null;
                return (
                    <button key={id} onClick={() => selectRate(id)}
                        aria-label={`Seleccionar tasa ${data.name}`}
                        className={`flex-shrink-0 px-3 py-2 rounded-xl border transition-all duration-300 flex items-center gap-2 ${activeSource === id ? 'bg-primary border-primary text-black shadow-lg' : 'bg-surface border-border/50 text-primary hover:bg-white/5'}`}>
                        <Flag code={data.flag} className="w-4 h-4" />
                        <div className="text-left">
                            <span className={`block text-[8px] font-black uppercase tracking-widest ${activeSource === id ? 'text-black/80' : 'text-primary/60'}`}>{data.name}</span>
                            <span className={`text-[13px] font-black tracking-tighter ${activeSource === id ? 'text-black' : 'text-primary'}`}>{formatCurrency(data.price)}</span>
                        </div>
                    </button>
                );
            })}
        </section>
    );
};
