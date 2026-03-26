import React from 'react';
import { formatCurrency } from '../utils/formatters';
import type { PaymentMethod } from '../hooks/usePaymentMethods';
import { QRCodeCanvas } from 'qrcode.react';
import { VENEZUELA_BANKS } from '../data/banks';

interface ShareTemplateProps {
    lastEdited: 'USD' | 'VES';
    inputUSD: string;
    inputVES: string;
    activeRateValue: number;
    templateRef: React.RefObject<HTMLDivElement | null>;
    paymentMethod?: PaymentMethod;
}

export const ShareTemplate: React.FC<ShareTemplateProps> = ({
    lastEdited,
    inputUSD,
    inputVES,
    activeRateValue,
    templateRef,
    paymentMethod
}) => {
    const amountStr = lastEdited === 'USD' ? (inputVES || formatCurrency(activeRateValue)) : (inputUSD || '1.00');

    return (
        <div className="fixed top-0 left-0 -z-50 pointer-events-none opacity-0" style={{ width: '500px', minWidth: '500px' }}>
            <div
                ref={templateRef}
                className="flex flex-col py-10 px-10 relative font-['Outfit'] overflow-hidden"
                style={{ backgroundColor: '#050505', width: '500px', minWidth: '500px', maxWidth: '500px', minHeight: '650px', height: 'auto', margin: '0' }}
            >
                {/* Header: Design 1 Style */}
                <div className="flex items-center justify-between mb-8 z-10 w-full">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </div>
                        <div className="flex flex-col items-start translate-y-[-2px]">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                PAGO MÓVIL - {paymentMethod?.bank || 'Destino'}
                            </span>
                            <span className="text-[20px] font-black text-white leading-none">
                                {paymentMethod?.alias || 'Konvierte'}
                            </span>
                        </div>
                    </div>
                    {paymentMethod?.bankLogo && (
                        <img 
                            src={paymentMethod.bankLogo.startsWith('data:') ? paymentMethod.bankLogo : `https://wsrv.nl/?url=${encodeURIComponent(paymentMethod.bankLogo)}&w=80&h=80&output=png`}
                            className="w-12 h-12 object-contain rounded-xl opacity-80"
                            style={{ padding: '4px', backgroundColor: 'transparent' }}
                            crossOrigin="anonymous"
                        />
                    )}
                </div>

                {/* Data Rows */}
                <div className="space-y-6 z-10 w-full mb-10">
                    <div className="flex justify-between items-center">
                        <span className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>Teléfono</span>
                        <span className="text-[18px] font-black text-white">{paymentMethod?.phoneNumber || '0000-000-0000'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>Cédula / RIF</span>
                        <span className="text-[18px] font-black text-white">{paymentMethod?.documentType || 'V'}-{paymentMethod?.idNumber?.replace(/\D/g, '') || '00000000'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>Banco</span>
                        <span className="text-[18px] font-black text-white">{paymentMethod?.bank || 'Banco'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>Monto</span>
                        <span className="text-[22px] font-black" style={{ color: '#10B981' }}>Bs. {amountStr}</span>
                    </div>
                </div>

                {/* QR Section */}
                <div className="flex flex-col items-center gap-4 z-10 w-full">
                    <div className="bg-white p-4 rounded-[32px] flex items-center justify-center shadow-2xl">
                        <QRCodeCanvas
                            value={`${paymentMethod?.bank} ${VENEZUELA_BANKS.find(b => b.name === paymentMethod?.bank)?.code || '0000'}\n${paymentMethod?.phoneNumber}\n${paymentMethod?.documentType || 'V'}-${paymentMethod?.idNumber?.replace(/\D/g, '')}\nBs. ${amountStr}`}
                            size={180}
                            level="H"
                            fgColor="#000000"
                            bgColor="#FFFFFF"
                            includeMargin={false}
                            imageSettings={{
                                src: "/logo_qr.png",
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>
                    <span className="text-[11px] font-bold text-center leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Escanea este código desde la app de tu banco<br />para pagar al instante
                    </span>
                </div>

                {/* Promo Footer */}
                <div className="mt-auto pt-8 text-center z-10 opacity-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#ffffff' }}>
                        KONVIERTE.VERCEL.APP
                    </span>
                </div>

                {/* Abstract Backgrounds */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] blur-[150px] opacity-10 rounded-full" style={{ backgroundColor: '#10B981' }} />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] blur-[150px] opacity-10 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            </div>
        </div>
    );
};
