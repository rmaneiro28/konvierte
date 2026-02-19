
import React from 'react';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ShareTemplateProps {
    lastEdited: 'USD' | 'VES';
    inputUSD: string;
    inputVES: string;
    activeRateValue: number;
    allRates: any;
    activeSource: string;
    templateRef: React.RefObject<HTMLDivElement | null>;
}

export const ShareTemplate: React.FC<ShareTemplateProps> = ({
    lastEdited,
    inputUSD,
    inputVES,
    activeRateValue,
    allRates,
    activeSource,
    templateRef
}) => {
    return (
        <div className="fixed -left-[2000px] top-0 pointer-events-none">
            <div
                ref={templateRef}
                className="w-[500px] h-[500px] p-10 bg-[#050505] flex flex-col justify-center items-center relative font-['Outfit']"
            >
                {/* Acento Visual */}
                <div className="absolute -top-[50px] -right-[50px] w-[250px] h-[250px] bg-emerald-500/10 blur-[80px] rounded-full" />

                <div className="text-center z-10 w-full">
                    <div className="flex items-center justify-center gap-2 mb-6 opacity-80">
                        <div className="bg-emerald-500 p-1.5 rounded-[10px] flex">
                            <Calculator size={18} color="white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">
                            Konvierte
                        </span>
                    </div>

                    <div className="mb-11">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 mb-3 overflow-hidden flex items-center justify-center bg-[#111] shrink-0">
                                <img
                                    src={`https://flagcdn.com/${(lastEdited === 'USD' ? 've' : (allRates[activeSource]?.flag || 'us')).toLowerCase()}.svg`}
                                    alt="flag"
                                    className="w-full h-full object-cover block"
                                />
                            </div>
                            <span className="text-[10px] font-extrabold text-white/60 uppercase tracking-[0.4em] block">
                                {lastEdited === 'USD' ? 'Monto en Bolívares' : 'Monto en Dólares'}
                            </span>
                        </div>
                        <h2 className="text-[90px] font-black text-emerald-500 tracking-[-0.04em] m-0 leading-[0.9]">
                            <span className="text-[28px] opacity-70 mr-2.5 align-middle">
                                {lastEdited === 'USD' ? 'Bs.' : (allRates[activeSource]?.flag === 'eu' ? '€' : '$')}
                            </span>
                            {lastEdited === 'USD' ? (inputVES || formatCurrency(activeRateValue)) : (inputUSD || '1.00')}
                        </h2>
                    </div>

                    <div className="flex items-center justify-center gap-5 px-8 py-5 bg-white/5 border border-white/10 rounded-[32px]">
                        <div className="text-left flex items-center gap-4">
                            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-[#111] shrink-0">
                                <img
                                    src={`https://flagcdn.com/${(lastEdited === 'USD' ? (allRates[activeSource]?.flag || 'us') : 've').toLowerCase()}.svg`}
                                    alt="flag"
                                    className="w-full h-full object-cover block"
                                />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-white/60 uppercase mb-1 tracking-widest">
                                    {lastEdited === 'USD' ? 'Referencia USD' : 'Referencia VES'}
                                </p>
                                <p className="text-2xl font-black text-white m-0">
                                    {lastEdited === 'USD' ? (inputUSD || '1.00') : (inputVES || formatCurrency(activeRateValue))}
                                    <span className="text-xs opacity-70 ml-1">
                                        {lastEdited === 'USD' ? (allRates[activeSource]?.flag === 'eu' ? 'EUR' : 'USD') : 'Bs.'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-left">
                            <p className="text-[9px] font-black text-emerald-500 uppercase mb-1 tracking-widest">
                                Tasa del día ({allRates[activeSource]?.name.split(' ')[0]})
                            </p>
                            <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-[#111] shrink-0">
                                    <img
                                        src={`https://flagcdn.com/${(allRates[activeSource]?.flag || 'us').toLowerCase()}.svg`}
                                        alt="flag"
                                        className="w-full h-full object-cover block"
                                    />
                                </div>
                                <p className="text-2xl font-black text-white m-0">{formatCurrency(activeRateValue)}</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-[9px] font-extrabold text-white/50 tracking-[0.3em] uppercase mt-5">
                        ✨ Calculado con Konvierte
                    </p>
                </div>
            </div>
        </div>
    );
};
