import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { X, Wallet, Plus, Trash2, Building2, User, ChevronDown } from 'lucide-react';
import type { PaymentMethod } from '../hooks/usePaymentMethods';
import { VENEZUELA_BANKS } from '../data/banks';

interface PaymentMethodsModalProps {
    isOpen: boolean;
    onClose: () => void;
    methods: PaymentMethod[];
    addMethod: (method: Omit<PaymentMethod, 'id'>) => void;
    removeMethod: (id: string) => void;
    validatePhone: (phone: string) => boolean;
    formatPhoneNumber: (phone: string) => string;
    formatCI: (ci: string) => string;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
    isOpen,
    onClose,
    methods,
    addMethod,
    removeMethod,
    validatePhone,
    formatPhoneNumber,
    formatCI
}) => {
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [alias, setAlias] = useState('');
    const [bank, setBank] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [documentType, setDocumentType] = useState('V');
    const docTypes = ['V', 'J', 'E', 'P', 'G'];

    const handleSave = () => {
        if (!alias || !bank || !idNumber || !phone) return;

        if (!validatePhone(phone)) {
            alert("Número de teléfono inválido. Debe ser un celular venezolano (ej: 0412...)");
            return;
        }

        addMethod({
            alias,
            bank,
            idNumber,
            phoneNumber: formatPhoneNumber(phone),
            documentType
        });

        // Reset form
        setAlias('');
        setBank('');
        setIdNumber('');
        setPhone('');
        setDocumentType('V');
        setIsAdding(false);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');

        // Handle country code
        if (val.startsWith('58')) val = val.substring(2);
        if (val.startsWith('0')) val = val.substring(1);

        if (val.length > 10) val = val.substring(0, 10);

        let formatted = '';
        if (val.length > 0) {
            formatted = '+58-' + val.substring(0, 3);
            if (val.length > 3) formatted += '-' + val.substring(3, 6);
            if (val.length > 6) formatted += '-' + val.substring(6, 10);
        }
        setPhone(formatted);
    };

    const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        const maxLen = (documentType === 'V' || documentType === 'E') ? 8 : 10;
        const trimmed = val.substring(0, maxLen);
        setIdNumber(formatCI(trimmed));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] p-6 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col bg-surface dark:bg-surface border-white/10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Wallet size={20} className="text-primary" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest">
                                    Mis Fichas
                                </h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                            {/* Add New Button */}
                            {!isAdding ? (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center gap-2 group transition-all"
                                >
                                    <Plus size={18} className="opacity-50 group-hover:text-primary transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:text-primary transition-colors">
                                        Nueva Ficha de Pago
                                    </span>
                                </button>
                            ) : (
                                <div className="bg-white/5 p-5 rounded-3xl space-y-4 border border-white/5 animate-in fade-in zoom-in">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Nueva Ficha</h4>

                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"><User size={14} /></span>
                                            <input
                                                value={alias}
                                                onChange={e => setAlias(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                placeholder="Alias (ej: Pago Móvil Personal)"
                                                className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-primary/50 transition-colors placeholder:font-medium placeholder:opacity-30"
                                            />
                                        </div>

                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 z-10 pointer-events-none text-white"><Building2 size={14} /></span>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 z-10 pointer-events-none text-white"><ChevronDown size={14} /></div>
                                            <select
                                                value={bank}
                                                onChange={e => setBank(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-xs font-bold outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer text-white/90"
                                            >
                                                <option value="" disabled className="bg-zinc-900 text-white/50">Seleccionar Banco</option>
                                                {VENEZUELA_BANKS.map(b => (
                                                    <option key={b.code} value={b.name} className="bg-zinc-900 text-white">
                                                        {b.code} - {b.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* Document Type Selector */}
                                            <div className="relative w-20">
                                                <select
                                                    value={documentType}
                                                    onChange={e => setDocumentType(e.target.value)}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-2 text-center text-xs font-bold outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer text-white/90"
                                                >
                                                    {docTypes.map(t => <option key={t} value={t} className="bg-zinc-900">{t}</option>)}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none"><ChevronDown size={10} /></div>
                                            </div>

                                            <input
                                                value={idNumber}
                                                onChange={handleIdChange}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                placeholder="C.I. / RIF"
                                                className="flex-1 bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-primary/50 transition-colors placeholder:font-medium placeholder:opacity-30"
                                            />
                                        </div>

                                        <div className="relative w-full">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-80">
                                                <img src="https://flagcdn.com/ve.svg" alt="VE" className="w-4 h-3 object-cover rounded-[2px]" />
                                            </span>
                                            <input
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                placeholder="+58-412-123-4567"
                                                type="tel"
                                                className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-primary/50 transition-colors placeholder:font-medium placeholder:opacity-30"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => setIsAdding(false)}
                                            className="flex-1 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={!alias || !bank || !idNumber || !phone}
                                            className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* List */}
                            <div className="space-y-3">
                                {methods.length === 0 && !isAdding && (
                                    <div className="text-center py-10 opacity-30">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No tienes fichas guardadas</p>
                                    </div>
                                )}

                                {methods.map(method => (
                                    <div key={method.id} className="group bg-white/5 hover:bg-white/[0.07] border border-white/5 rounded-3xl p-5 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-sm font-black text-white mb-1">{method.alias}</h4>
                                                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{method.bank}</p>
                                            </div>
                                            <button
                                                onClick={() => removeMethod(method.id)}
                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Cédula / RIF</span>
                                                <span className="text-[13px] font-black text-white/90">{method.documentType || 'V'}-{method.idNumber}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Teléfono</span>
                                                <span className="text-[13px] font-black text-white/90 tracking-tight">{method.phoneNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
