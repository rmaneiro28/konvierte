import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { X, Wallet, Plus, Trash2, Building2, User, ChevronDown, ClipboardPaste, Edit2, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { Clipboard } from '@capacitor/clipboard';
import type { PaymentMethod } from '../hooks/usePaymentMethods';
import { VENEZUELA_BANKS } from '../data/banks';

interface PaymentMethodsModalProps {
    isOpen: boolean;
    onClose: () => void;
    methods: PaymentMethod[];
    addMethod: (method: Omit<PaymentMethod, 'id'>) => void;
    removeMethod: (id: string) => void;
    editMethod: (id: string, updatedMethod: Omit<PaymentMethod, 'id'>) => void;
    validatePhone: (phone: string) => boolean;
    formatCI: (ci: string) => string;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
    isOpen,
    onClose,
    methods,
    addMethod,
    removeMethod,
    editMethod,
    validatePhone,
    formatCI
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [alias, setAlias] = useState('');
    const [bank, setBank] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [documentType, setDocumentType] = useState('V');
    const docTypes = ['V', 'J', 'E', 'P', 'G'];

    const handleSave = () => {
        if (!alias || !bank || !idNumber || !phone) {
            toast.error("Por favor completa todos los campos requeridos");
            return;
        }

        if (!validatePhone(phone)) {
            toast.error("Número de teléfono inválido");
            return;
        }

        const methodData = {
            alias,
            bank,
            idNumber: idNumber.replace(/\./g, ''),
            phoneNumber: phone,
            documentType,
            amount: amount ? parseFloat(amount.replace(/\./g, '').replace(',', '.')) : undefined
        };

        if (editingId) {
            editMethod(editingId, methodData);
        } else {
            addMethod(methodData);
        }

        resetForm();
    };

    const resetForm = () => {
        setAlias('');
        setBank('');
        setIdNumber('');
        setPhone('');
        setAmount('');
        setDocumentType('V');
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (method: PaymentMethod) => {
        setAlias(method.alias);
        setBank(method.bank);
        setIdNumber(formatCI(method.idNumber));
        setPhone(method.phoneNumber);
        setAmount(method.amount ? new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(method.amount) : '');
        setDocumentType(method.documentType || 'V');
        setEditingId(method.id);
        setIsAdding(true);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val) {
            setAmount('');
            return;
        }
        const number = parseFloat(val) / 100;
        setAmount(new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(number));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
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
        setIdNumber(formatCI(val));
    };

    const handlePasteFromClipboard = async () => {
        try {
            const { value } = await Clipboard.read();
            const text = value;

            if (!text) {
                toast.error('El portapapeles está vacío');
                return;
            }

            const identifiedFields: string[] = [];
            let discoveredBankName = '';
            let remainingText = text;

            // Extract Phone
            const phoneMatch = remainingText.match(/(?:(?:Tel[eé]fono|Celular|Cel|Tlf)[\s:-]*)?(?:(?:\+|00)58)?(?:0)?(41[246]|42[246])[- .]?(\d{3})[- .]?(\d{4})\b/i);
            if (phoneMatch) {
                setPhone(`+58-${phoneMatch[1]}-${phoneMatch[2]}-${phoneMatch[3]}`);
                identifiedFields.push('Teléfono');
                remainingText = remainingText.replace(phoneMatch[0], ' ');
            }

            // Extract CI
            const ciMatch = remainingText.match(/(?:(?:CI|C[eé]dula|RIF|Id)[\s:-]*)?([VJEGPvjegp])?[\s.-]*([1-9](?:\d\.?){5,9})\b/i);
            if (ciMatch) {
                setDocumentType(ciMatch[1] ? ciMatch[1].toUpperCase() : 'V');
                const val = ciMatch[2].replace(/\D/g, '');
                setIdNumber(formatCI(val));
                identifiedFields.push('C.I./RIF');
                remainingText = remainingText.replace(ciMatch[0], ' ');
            }

            // Extract Bank
            let foundBank = undefined;
            const bankCodeMatch = remainingText.match(/\b(01\d{2}|0601)\b/);
            if (bankCodeMatch) {
                foundBank = VENEZUELA_BANKS.find(b => b.code === bankCodeMatch[1]);
            }
            if (!foundBank) {
                const t = remainingText.toLowerCase();
                foundBank = VENEZUELA_BANKS.find(b => 
                    (b.shortName && t.includes(b.shortName.toLowerCase())) || 
                    t.includes(b.name.toLowerCase()) ||
                    (b.code === '0102' && t.includes('venezuela')) ||
                    (b.code === '0105' && t.includes('mercantil')) ||
                    (b.code === '0108' && t.includes('provincial')) ||
                    (b.code === '0134' && t.includes('banesco'))
                );
            }

            if (foundBank) {
                setBank(foundBank.name);
                discoveredBankName = foundBank.shortName || foundBank.name;
                identifiedFields.push('Banco');
            }

            if (identifiedFields.length > 0) {
                if (!alias) setAlias(`Pago Móvil - ${discoveredBankName || 'Nuevo'}`);
                toast.success(`Datos identificados: ${identifiedFields.join(', ')}`);
            } else {
                toast.error('No se detectaron datos válidos');
            }
        } catch (e) {
            toast.error('No se pudo acceder al portapapeles');
        }
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
                        className="glass-card max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col bg-surface border-white/10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Wallet size={20} className="text-primary" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary">
                                    Mis Fichas
                                </h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                            {!isAdding ? (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="w-full py-5 rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center gap-3 group transition-all"
                                >
                                    <Plus size={20} className="opacity-50 group-hover:text-primary transition-colors" />
                                    <span className="text-xs font-black uppercase tracking-widest opacity-50 group-hover:text-primary transition-colors">
                                        Nueva Ficha de Pago
                                    </span>
                                </button>
                            ) : (
                                <div className="bg-white/5 p-6 rounded-[2rem] space-y-5 border border-white/5 shadow-2xl animate-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">{editingId ? 'Editar Ficha' : 'Nueva Ficha'}</h4>
                                        <button
                                            onClick={handlePasteFromClipboard}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-all border border-primary/20"
                                        >
                                            <ClipboardPaste size={14} />
                                            <span className="text-[10px] font-black uppercase">Pegar Datos</span>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"><User size={16} /></span>
                                            <input
                                                value={alias}
                                                onChange={e => setAlias(e.target.value)}
                                                placeholder="Alias (ej: Cuenta Principal)"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-primary/50 transition-all placeholder:font-medium placeholder:opacity-20"
                                            />
                                        </div>

                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                                {(() => {
                                                    const selectedBank = VENEZUELA_BANKS.find(b => b.name === bank);
                                                    if (selectedBank?.logo) return <img src={selectedBank.logo} className="w-5 h-5 object-contain rounded-md bg-white p-0.5" />;
                                                    return <Building2 size={16} className="opacity-30" />;
                                                })()}
                                            </span>
                                            <select
                                                value={bank}
                                                onChange={e => setBank(e.target.value)}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-10 text-xs font-bold outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Seleccionar Banco</option>
                                                {VENEZUELA_BANKS.filter(b => b.active !== 0).map(b => (
                                                    <option key={b.code} value={b.name} className="bg-zinc-900">{b.code} - {b.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="relative w-24">
                                                <select
                                                    value={documentType}
                                                    onChange={e => setDocumentType(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-2 text-center text-xs font-black outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                                >
                                                    {docTypes.map(t => <option key={t} value={t} className="bg-zinc-900">{t}</option>)}
                                                </select>
                                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
                                            </div>

                                            <input
                                                value={idNumber}
                                                onChange={handleIdChange}
                                                placeholder="Cédula / RIF"
                                                className="flex-1 bg-black/40 border border-white/5 rounded-2xl py-4 px-5 text-xs font-bold outline-none focus:border-primary/50 transition-all placeholder:opacity-20"
                                            />
                                        </div>

                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                                <img src="https://flagcdn.com/ve.svg" alt="VE" className="w-5 h-3.5 object-cover rounded-sm" />
                                            </span>
                                            <input
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                placeholder="+58-412-123-4567"
                                                type="tel"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-xs font-bold outline-none focus:border-primary/50 transition-all placeholder:opacity-20"
                                            />
                                        </div>

                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"><Banknote size={16} /></span>
                                            <input
                                                value={amount}
                                                onChange={handleAmountChange}
                                                placeholder="Monto Sugerido (Opcional)"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-primary/50 transition-all placeholder:opacity-20"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={resetForm}
                                            className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* List */}
                            <div className="grid gap-4">
                                {methods.length === 0 && !isAdding && (
                                    <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                                        <Wallet size={40} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Billetera Vacía</p>
                                    </div>
                                )}

                                {methods.map(method => (
                                    <div key={method.id} className="group glass-card border-white/5 bg-white/[0.02] p-6 rounded-[2rem] hover:bg-white/[0.04] transition-all duration-300">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-inner flex items-center justify-center">
                                                    {method.bankLogo ? (
                                                        <img src={method.bankLogo} alt={method.bank} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <Building2 className="text-black" size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-white">{method.alias}</h4>
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">{method.bank}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(method)} className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => removeMethod(method.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid gap-3 pt-2">
                                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest text-primary">Cédula / RIF</span>
                                                <span className="text-xs font-black text-white">{method.documentType}-{formatCI(method.idNumber)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest text-primary">Teléfono</span>
                                                <span className="text-xs font-black text-white">{method.phoneNumber}</span>
                                            </div>
                                            {method.amount && (
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-[9px] font-black opacity-30 uppercase tracking-widest text-primary">Sugerido</span>
                                                    <span className="text-xs font-black text-primary">
                                                        Bs. {new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(method.amount)}
                                                    </span>
                                                </div>
                                            )}
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
