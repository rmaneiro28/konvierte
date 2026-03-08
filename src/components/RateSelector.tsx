import React from 'react';
import { Flag } from './ui/Flag';
import { formatCurrency } from '../utils/formatters';
import { twMerge } from 'tailwind-merge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
                        className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-colors duration-300 flex items-center gap-2 ${activeSource === id ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-transparent text-primary dark:text-primary hover:bg-white/10'}`}>
                        <Flag code={data.flag} />
                        <div>
                            <span className={`block text-[8px] font-black uppercase tracking-widest mb-0.5 ${activeSource === id ? 'text-white' : ''}`}>{data.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black tracking-tight">{formatCurrency(data.price)}</span>
                                {data.change24h !== undefined && data.change24h !== 0 && (
                                    <span className={`flex items-center gap-0.5 text-[8px] font-black ${data.change24h > 0 ? (activeSource === id ? 'text-white' : 'text-red-500') : (activeSource === id ? 'text-white/80' : 'text-primary')}`}>
                                        {data.change24h > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {Math.abs(data.change24h).toFixed(2)}%
                                    </span>
                                )}
                                {data.change24h === 0 && (
                                    <span className={`flex items-center gap-0.5 text-[8px] font-black flex items-center justify-center opacity-50`}>
                                        <Minus size={10} />
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </section>
    );
};
