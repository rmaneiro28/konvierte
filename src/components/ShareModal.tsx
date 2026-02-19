
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Image as ImageIcon, Wallet, Download } from 'lucide-react';
import type { PaymentMethod } from '../hooks/usePaymentMethods';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareAsText: () => void;
    shareAsImage: (mode?: 'share' | 'download') => void;
    sharing: boolean;
    paymentMethods: PaymentMethod[];
    selectedPaymentMethodId: string | null;
    onSelectPaymentMethod: (id: string | null) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    shareAsText,
    shareAsImage,
    sharing,
    paymentMethods,
    selectedPaymentMethodId,
    onSelectPaymentMethod
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] p-6 flex items-center justify-center">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card max-w-xs w-full p-8 space-y-6 bg-surface dark:bg-surface border-white/10">
                        <div className="flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-widest">Compartir</h3><button onClick={onClose}><X size={18} /></button></div>

                        {/* Payment Method Selector */}
                        {paymentMethods.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Incluir Ficha de Pago</span>
                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                    <button
                                        onClick={() => onSelectPaymentMethod(null)}
                                        className={`flex-shrink-0 px-4 py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedPaymentMethodId === null ? 'bg-primary/10 border-primary/50 text-white' : 'bg-white/5 border-transparent opacity-50 hover:opacity-100'}`}
                                    >
                                        <X size={14} className="opacity-50" />
                                        <span className="text-[9px] font-black uppercase">Ninguna</span>
                                    </button>
                                    {paymentMethods.map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => onSelectPaymentMethod(method.id === selectedPaymentMethodId ? null : method.id)}
                                            className={`flex-shrink-0 px-4 py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedPaymentMethodId === method.id ? 'bg-primary/10 border-primary/50 text-white' : 'bg-white/5 border-transparent opacity-50 hover:opacity-100'}`}
                                        >
                                            <Wallet size={14} className="opacity-50" />
                                            <span className="text-[9px] font-black uppercase whitespace-nowrap">{method.alias}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={shareAsText} className="col-span-2 flex items-center justify-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-primary/10 transition-all group">
                                <Type size={20} className="opacity-30 group-hover:text-primary transition-all" /><span className="text-[10px] font-black uppercase opacity-20 group-hover:text-primary">Copiar Texto</span>
                            </button>
                            <button onClick={() => shareAsImage('share')} disabled={sharing} className="flex flex-col items-center gap-2 p-5 bg-white/5 rounded-2xl hover:bg-primary/10 transition-all group disabled:opacity-50">
                                <ImageIcon size={20} className="opacity-30 group-hover:text-primary transition-all" /><span className="text-[10px] font-black uppercase opacity-20 group-hover:text-primary">{sharing ? '...' : 'Compartir'}</span>
                            </button>
                            <button onClick={() => shareAsImage('download')} disabled={sharing} className="flex flex-col items-center gap-2 p-5 bg-white/5 rounded-2xl hover:bg-primary/10 transition-all group disabled:opacity-50">
                                <Download size={20} className="opacity-30 group-hover:text-primary transition-all" /><span className="text-[10px] font-black uppercase opacity-20 group-hover:text-primary">Descargar</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
