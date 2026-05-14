import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, TrendingUp, Plus, Trash2, Share2, CheckCircle, Banknote, Coins, Zap, Smartphone, ArrowRightLeft, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Clipboard } from '@capacitor/clipboard';
import { formatCurrency } from '../utils/formatters';

interface PaymentEntry {
    id: string;
    type: 'usdCash' | 'vesCash' | 'zelle' | 'pagoMovil' | 'transfer' | 'other';
    amount: number;
    isUsd: boolean;
    label: string;
}

interface KambioModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRate: number;
    rateName: string;
}

export const KambioModal: React.FC<KambioModalProps> = ({
    isOpen,
    onClose,
    currentRate,
    rateName: _rateName
}) => {
    const [totalUsd, setTotalUsd] = useState('0.00');
    const [rate, setRate] = useState(currentRate.toString());
    const [payments, setPayments] = useState<PaymentEntry[]>([]);
    
    const [_totalPaidUsd, setTotalPaidUsd] = useState(0);
    const [remainingUsd, setRemainingUsd] = useState(0);
    const [excessUsd, setExcessUsd] = useState(0);

    const [isAdding, setIsAdding] = useState<{ type: PaymentEntry['type'], isUsd: boolean } | null>(null);
    const [addAmount, setAddAmount] = useState('');

    useEffect(() => {
        const totalDue = parseFloat(totalUsd) || 0;
        const currentR = parseFloat(rate) || currentRate;
        
        let paidUsd = 0;
        payments.forEach(p => {
            if (p.isUsd) {
                paidUsd += p.amount;
            } else {
                paidUsd += p.amount / (currentR > 0 ? currentR : 1);
            }
        });

        setTotalPaidUsd(paidUsd);
        if (paidUsd > totalDue + 0.001) {
            setExcessUsd(paidUsd - totalDue);
            setRemainingUsd(0);
        } else {
            setRemainingUsd(totalDue - paidUsd);
            setExcessUsd(0);
        }
    }, [totalUsd, rate, payments, currentRate]);

    const handleFormatInput = (val: string, setter: (v: string) => void) => {
        const clean = val.replace(/\D/g, '');
        if (!clean) {
            setter('0.00');
            return;
        }
        const amount = parseInt(clean) / 100;
        setter(amount.toFixed(2));
    };

    const getTypeLabel = (type: PaymentEntry['type']) => {
        switch (type) {
            case 'usdCash': return 'Efectivo $';
            case 'vesCash': return 'Efectivo Bs';
            case 'zelle': return 'Zelle';
            case 'pagoMovil': return 'Pago Móvil';
            case 'transfer': return 'Transferencia';
            case 'other': return 'Otro';
        }
    };

    const getTypeIcon = (type: PaymentEntry['type']) => {
        switch (type) {
            case 'usdCash': return <Banknote size={16} />;
            case 'vesCash': return <Coins size={16} />;
            case 'zelle': return <Zap size={16} />;
            case 'pagoMovil': return <Smartphone size={16} />;
            case 'transfer': return <ArrowRightLeft size={16} />;
            case 'other': return <CreditCard size={16} />;
        }
    };

    const startAdding = (type: PaymentEntry['type'], isUsd: boolean) => {
        const currentR = parseFloat(rate) || currentRate;
        let suggested = 0;
        if (remainingUsd > 0) {
            suggested = isUsd ? remainingUsd : remainingUsd * currentR;
        }
        setAddAmount(suggested.toFixed(2));
        setIsAdding({ type, isUsd });
    };

    const confirmAdd = () => {
        const amt = parseFloat(addAmount);
        if (amt > 0 && isAdding) {
            const newEntry: PaymentEntry = {
                id: Date.now().toString(),
                type: isAdding.type,
                amount: amt,
                isUsd: isAdding.isUsd,
                label: getTypeLabel(isAdding.type)
            };
            setPayments([...payments, newEntry]);
            setIsAdding(null);
            setAddAmount('');
            toast.success('Pago añadido');
        }
    };

    const removePayment = (id: string) => {
        setPayments(payments.filter(p => p.id !== id));
    };

    const adjustToExact = () => {
        if (excessUsd <= 0 || payments.length === 0) return;
        
        const last = payments[payments.length - 1];
        const currentR = parseFloat(rate) || currentRate;
        const excessInEntryCurrency = last.isUsd ? excessUsd : excessUsd * currentR;
        const newAmount = last.amount - excessInEntryCurrency;

        if (newAmount <= 0) {
            setPayments(payments.slice(0, -1));
            // Trigger recalculation and check again if needed (the useEffect will handle it)
        } else {
            const newPayments = [...payments];
            newPayments[newPayments.length - 1] = { ...last, amount: newAmount };
            setPayments(newPayments);
        }
    };

    const shareSummary = async () => {
        const currentR = parseFloat(rate) || currentRate;
        const totalDue = parseFloat(totalUsd) || 0;
        
        let summary = `*Resumen de Kambio*\n`;
        summary += `Total a pagar: $${totalDue.toFixed(2)} (Tasa: ${currentR.toFixed(2)})\n`;
        summary += `--------------------------\n`;
        
        payments.forEach((p, i) => {
            summary += `${i + 1}. ${p.label}: ${p.isUsd ? '$' : 'Bs. '}${p.amount.toFixed(2)}`;
            if (!p.isUsd) {
                summary += ` ($${(p.amount / currentR).toFixed(2)})`;
            }
            summary += `\n`;
        });
        
        summary += `--------------------------\n`;
        if (excessUsd > 0) {
            summary += `*PAGO COMPLETADO*\n`;
            summary += `Vuelto: $${excessUsd.toFixed(2)} (Bs. ${(excessUsd * currentR).toFixed(2)})`;
        } else if (remainingUsd <= 0 && totalDue > 0) {
            summary += `*PAGO EXACTO COMPLETADO*`;
        } else {
            summary += `Pendiente: $${remainingUsd.toFixed(2)}`;
        }

        try {
            await Clipboard.write({ string: summary });
            toast.success('Resumen copiado al portapapeles');
        } catch (e) {
            toast.error('Error al copiar');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] p-4 flex items-end sm:items-center justify-center"
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="glass-card w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-surface border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">KAMBIO</h3>
                            <span className="text-[10px] opacity-40 font-bold">Pago Mixto Inteligente</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Inputs Row */}
                        <div className="grid grid-cols-5 gap-3">
                            <div className="col-span-3 space-y-2">
                                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest ml-1">Total a Pagar</span>
                                <div className="relative">
                                    <ShoppingCart size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50" />
                                    <input
                                        type="text"
                                        value={totalUsd}
                                        onChange={(e) => handleFormatInput(e.target.value, setTotalUsd)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-10 pr-12 text-sm font-black outline-none focus:border-primary/50 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">USD</span>
                                </div>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest ml-1">Tasa</span>
                                <div className="relative">
                                    <TrendingUp size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-50" />
                                    <input
                                        type="text"
                                        value={rate}
                                        onChange={(e) => handleFormatInput(e.target.value, setRate)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-10 pr-10 text-sm font-black outline-none focus:border-orange-400/50 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">Bs</span>
                                </div>
                            </div>
                        </div>

                        {/* Payments List */}
                        <div className="space-y-3">
                            <span className="text-[9px] font-black opacity-30 uppercase tracking-widest ml-1">Desglose de Pagos</span>
                            <div className="space-y-2">
                                {payments.length === 0 ? (
                                    <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center opacity-20">
                                        <Plus size={30} />
                                        <p className="text-[10px] font-black uppercase mt-2">Sin Abonos</p>
                                    </div>
                                ) : (
                                    payments.map((p) => (
                                        <div key={p.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                                    {getTypeIcon(p.type)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-wider">{p.label}</span>
                                                    {!p.isUsd && (
                                                        <span className="text-[9px] opacity-40 font-bold">
                                                            ${(p.amount / (parseFloat(rate) || 1)).toFixed(2)} USD
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-sm font-black ${p.isUsd ? 'text-primary' : 'text-amber-400'}`}>
                                                    {p.isUsd ? '$' : 'Bs.'} {p.amount.toFixed(2)}
                                                </span>
                                                <button 
                                                    onClick={() => removePayment(p.id)}
                                                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Add Buttons */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            <QuickAddBtn icon={<Banknote size={14}/>} label="USD" color="emerald" onClick={() => startAdding('usdCash', true)} />
                            <QuickAddBtn icon={<Coins size={14}/>} label="VES" color="amber" onClick={() => startAdding('vesCash', false)} />
                            <QuickAddBtn icon={<Zap size={14}/>} label="Zelle" color="purple" onClick={() => startAdding('zelle', true)} />
                            <QuickAddBtn icon={<Smartphone size={14}/>} label="PM" color="blue" onClick={() => startAdding('pagoMovil', false)} />
                            <QuickAddBtn icon={<ArrowRightLeft size={14}/>} label="Transf" color="slate" onClick={() => startAdding('transfer', false)} />
                        </div>
                    </div>

                    {/* Footer Summary */}
                    <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
                        <div className={`p-5 rounded-3xl border-2 transition-all duration-300 ${
                            excessUsd > 0 ? 'bg-primary/5 border-primary/20' : 
                            (remainingUsd > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20')
                        }`}>
                            <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                                    excessUsd > 0 ? 'text-primary' : 
                                    (remainingUsd > 0 ? 'text-red-500' : 'text-emerald-500')
                                }`}>
                                    {excessUsd > 0 ? 'Tienes Vuelto' : (remainingUsd > 0 ? 'Falta por Pagar' : 'Pago Completado')}
                                </span>
                                <span className={`text-2xl font-black ${
                                    excessUsd > 0 ? 'text-primary' : 
                                    (remainingUsd > 0 ? 'text-red-500' : 'text-emerald-500')
                                }`}>
                                    {excessUsd > 0 ? `$${excessUsd.toFixed(2)}` : (remainingUsd > 0 ? `$${remainingUsd.toFixed(2)}` : 'LISTO')}
                                </span>
                            </div>
                            
                            {excessUsd > 0 && (
                                <button
                                    onClick={adjustToExact}
                                    className="w-full mt-4 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    <CheckCircle size={14} />
                                    Ajustar a Pago Exacto
                                </button>
                            )}

                            {remainingUsd > 0 && (
                                <div className="mt-2 text-[10px] font-bold opacity-40 text-center uppercase tracking-widest">
                                    o Bs. {formatCurrency(remainingUsd * (parseFloat(rate) || currentRate))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={shareSummary}
                            disabled={payments.length === 0}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-20"
                        >
                            <Share2 size={14} />
                            Compartir Resumen
                        </button>
                    </div>
                </motion.div>

                {/* Add Payment Dialog Overlay */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-[#161616] border border-white/10 p-8 rounded-[2rem] w-full max-w-xs shadow-2xl"
                            >
                                <h4 className="text-sm font-black uppercase tracking-widest mb-6 text-center">
                                    Monto en {isAdding.isUsd ? 'USD' : 'VES'}
                                </h4>
                                
                                {remainingUsd > 0 && (
                                    <div className="text-center mb-4">
                                        <span className="text-[9px] font-black uppercase text-primary tracking-widest opacity-60">Sugerido: {isAdding.isUsd ? '$' : 'Bs.'} {(parseFloat(addAmount)).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="relative mb-8">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={addAmount}
                                        onChange={(e) => handleFormatInput(e.target.value, setAddAmount)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 text-center text-2xl font-black outline-none focus:border-primary/50 transition-all"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-20">
                                        {isAdding.isUsd ? 'USD' : 'VES'}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsAdding(null)}
                                        className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmAdd}
                                        className="flex-1 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                    >
                                        Añadir
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};

interface QuickAddBtnProps {
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick: () => void;
}

const QuickAddBtn: React.FC<QuickAddBtnProps> = ({ icon, label, color, onClick }) => {
    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        slate: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${colorMap[color]}`}
        >
            {icon}
            {label}
        </button>
    );
};
