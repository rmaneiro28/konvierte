
import React from 'react';
import { Flag } from './ui/Flag';
import { formatCurrency } from '../utils/formatters';

interface RateSelectorProps {
    ratesOrder: string[];
    allRates: any;
    activeSource: string;
    selectRate: (id: string) => void;
}

export const RateSelector: React.FC<RateSelectorProps> = ({ ratesOrder, allRates, activeSource, selectRate }) => {
    return (
        <section className="flex gap-3 overflow-x-auto no-scrollbar py-1 mb-2">
            {ratesOrder.map((id) => {
                const data = allRates[id];
                if (!data) return null;
                return (
                    <button key={id} onClick={() => selectRate(id)}
                        aria-label={`Seleccionar tasa ${data.name}`}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-colors duration-300 flex items-center gap-2 ${activeSource === id ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-transparent text-primary dark:text-primary hover:bg-white/10'}`}>
                        <Flag code={data.flag} />
                        <div>
                            <span className={`block text-[8px] font-black uppercase tracking-widest mb-0.5 ${activeSource === id ? 'text-white' : ''}`}>{data.name}</span>
                            <span className="text-sm font-black">{formatCurrency(data.price)}</span>
                        </div>
                    </button>
                );
            })}
        </section>
    );
};
