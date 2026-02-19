
import React from 'react';
import { formatCurrency } from '../utils/formatters';
import type { PaymentMethod } from '../hooks/usePaymentMethods';

interface ShareTemplateProps {
    lastEdited: 'USD' | 'VES';
    inputUSD: string;
    inputVES: string;
    activeRateValue: number;
    allRates: any;
    activeSource: string;
    templateRef: React.RefObject<HTMLDivElement | null>;
    paymentMethod?: PaymentMethod;
}

export const ShareTemplate: React.FC<ShareTemplateProps> = ({
    lastEdited,
    inputUSD,
    inputVES,
    activeRateValue,
    allRates,
    activeSource,
    templateRef,
    paymentMethod
}) => {
    return (
        <div className="fixed top-0 left-0 -z-50 pointer-events-none opacity-0">
            <div
                ref={templateRef}
                className="w-[500px] flex flex-col items-center justify-between py-12 px-8 relative font-['Outfit'] overflow-hidden"
                style={{ backgroundColor: '#050505', minHeight: '500px', height: paymentMethod ? 'auto' : '500px' }}
            >
                {/* Acento Visual Fondo */}
                <div
                    className="absolute -top-[100px] -right-[100px] w-[350px] h-[350px] blur-[100px] rounded-full opacity-40"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                />
                <div
                    className="absolute -bottom-[100px] -left-[100px] w-[300px] h-[300px] blur-[90px] rounded-full opacity-20"
                    style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                />

                {/* Header: Logo */}
                <div className="text-center z-10 w-full flex flex-col items-center gap-4 mb-4">
                    <div className="flex items-center gap-3 opacity-90">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border relative overflow-hidden"
                            style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: '#10B981' }} />
                            <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M38 32V96M38 64 L74 32M56 64L88 96" stroke="#10B981" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="85" cy="64" r="18" fill="transparent" stroke="#10B981" strokeWidth="6" />
                            </svg>
                        </div>
                        <span className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Konvierte
                        </span>
                    </div>
                </div>

                {/* Main Content: Amount */}
                <div className="text-center z-10 w-full flex-1 flex flex-col justify-center mb-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {lastEdited === 'USD' ? 'Monto en Bolívares' : 'Monto en Dólares'}
                    </span>

                    <div className="flex items-baseline justify-center gap-2 m-0" style={{ color: '#10B981' }}>
                        <span className="text-[36px] font-bold opacity-60">
                            {lastEdited === 'USD' ? 'Bs.' : (allRates[activeSource]?.flag === 'eu' ? '€' : '$')}
                        </span>
                        <span className="text-[72px] font-black tracking-tighter leading-none filter drop-shadow-2xl">
                            {lastEdited === 'USD' ? (inputVES || formatCurrency(activeRateValue)) : (inputUSD || '1.00')}
                        </span>
                    </div>
                </div>

                {/* Footer Group */}
                <div className="w-full z-10 flex flex-col gap-4">

                    {/* Details Card */}
                    <div
                        className="w-full rounded-3xl border flex items-center justify-between p-5 backdrop-blur-md"
                        style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                        {/* Left: Input */}
                        <div className="flex flex-col gap-1 items-start">
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {lastEdited === 'USD' ? 'Monto Base' : 'A Convertir'}
                            </span>
                            <div className="flex items-center gap-2">
                                <img
                                    src={`https://flagcdn.com/${(lastEdited === 'USD' ? (allRates[activeSource]?.flag || 'us') : 've').toLowerCase()}.svg`}
                                    alt="flag"
                                    className="w-5 h-5 rounded-full object-cover opacity-80"
                                />
                                <span className="text-2xl font-black" style={{ color: '#ffffff' }}>
                                    {lastEdited === 'USD' ? (inputUSD || '1.00') : (inputVES || formatCurrency(activeRateValue))}
                                    <span className="text-sm opacity-50 ml-1 font-bold">
                                        {lastEdited === 'USD' ? (allRates[activeSource]?.flag === 'eu' ? 'EUR' : 'USD') : 'VES'}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-10" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

                        {/* Right: Rate */}
                        <div className="flex flex-col gap-1 items-end">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-right" style={{ color: '#10B981' }}>
                                Tasa ({allRates[activeSource]?.name.split(' ')[0]})
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black" style={{ color: '#ffffff' }}>
                                    {formatCurrency(activeRateValue)}
                                </span>
                                <div className="w-5 h-5 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Card (Conditional) */}
                    {paymentMethod && (
                        <div
                            className="w-full rounded-3xl border p-5 backdrop-blur-md relative overflow-hidden"
                            style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="5" width="20" height="14" rx="2" />
                                    <line x1="2" y1="10" x2="22" y2="10" />
                                </svg>
                            </div>

                            <div className="flex flex-col gap-4 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: '#10B981' }}>
                                            Pago Móvil
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {paymentMethod.bankLogo && (
                                                <img
                                                    src={paymentMethod.bankLogo}
                                                    alt={paymentMethod.bank}
                                                    className="w-6 h-6 object-contain rounded-md bg-white p-[2px]"
                                                    crossOrigin="anonymous"
                                                />
                                            )}
                                            <span className="text-lg font-black text-white block leading-tight" style={{ color: '#ffffff' }}>
                                                {paymentMethod.bank}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                                        {paymentMethod.alias}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            Cédula / RIF
                                        </span>
                                        <span className="text-sm font-mono font-bold" style={{ color: '#ffffff' }}>
                                            {paymentMethod.idNumber}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            Teléfono
                                        </span>
                                        <span className="text-sm font-mono font-bold" style={{ color: '#ffffff' }}>
                                            {paymentMethod.phoneNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
