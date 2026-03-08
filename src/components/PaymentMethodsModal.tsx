import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { X, Wallet, Plus, Trash2, Building2, User, ChevronDown, ClipboardPaste, Edit2 } from 'lucide-react';
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
    formatPhoneNumber: (phone: string) => string;
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
    formatPhoneNumber,
    formatCI
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [alias, setAlias] = useState('');
    const [bank, setBank] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [documentType, setDocumentType] = useState('V');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const docTypes = ['V', 'J', 'E', 'P', 'G'];

    const handleSave = () => {
        if (!alias || !bank || !idNumber || !phone) return;

        if (!validatePhone(phone)) {
            alert("Número de teléfono inválido. Debe ser un celular venezolano (ej: 0412...)");
            return;
        }

        const methodData = {
            alias,
            bank,
            idNumber,
            phoneNumber: formatPhoneNumber(phone),
            documentType,
            qrCode: qrCode || undefined
        };

        if (editingId) {
            editMethod(editingId, methodData);
        } else {
            addMethod(methodData);
        }

        // Reset form
        setAlias('');
        setBank('');
        setIdNumber('');
        setPhone('');
        setDocumentType('V');
        setQrCode(null);
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (method: PaymentMethod) => {
        setAlias(method.alias);
        setBank(method.bank);
        setIdNumber(method.idNumber);
        setPhone(method.phoneNumber);
        setDocumentType(method.documentType || 'V');
        setQrCode(method.qrCode || null);
        setEditingId(method.id);
        setIsAdding(true);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrCode(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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
                const p1 = phoneMatch[1];
                const p2 = phoneMatch[2];
                const p3 = phoneMatch[3];
                setPhone(`+58-${p1}-${p2}-${p3}`);
                identifiedFields.push('Teléfono');
                remainingText = remainingText.replace(phoneMatch[0], ' ');
            }

            // Extract CI
            const ciMatch = remainingText.match(/(?:(?:CI|C[eé]dula|RIF|Id)[\s:-]*)?([VJEGPvjegp])?[\s.-]*([1-9](?:\d\.?){5,9})\b/i);
            if (ciMatch) {
                setDocumentType(ciMatch[1] ? ciMatch[1].toUpperCase() : 'V');
                let val = ciMatch[2].replace(/\D/g, '');
                const maxLen = (!ciMatch[1] || ciMatch[1].toUpperCase() === 'V' || ciMatch[1].toUpperCase() === 'E') ? 8 : 10;
                val = val.substring(0, maxLen);
                setIdNumber(formatCI(val));
                identifiedFields.push('C.I./RIF');
                remainingText = remainingText.replace(ciMatch[0], ' ');
            }

            // Extract Bank
            let foundBank = undefined;
            const bankCodeMatch = remainingText.match(/\b(01\d{2}|0601)\b/);

            if (bankCodeMatch) {
                foundBank = VENEZUELA_BANKS.find(b => b.code === bankCodeMatch[1]);
                if (foundBank) remainingText = remainingText.replace(bankCodeMatch[0], ' ');
            }

            if (!foundBank) {
                const t = remainingText.toLowerCase();
                foundBank = VENEZUELA_BANKS.find(b => {
                    if (b.shortName && t.includes(b.shortName.toLowerCase())) return true;
                    if (t.includes(b.name.toLowerCase())) return true;
                    if (b.code === '0102' && t.includes('venezuela')) return true;
                    if (b.code === '0105' && t.includes('mercantil')) return true;
                    if (b.code === '0108' && t.includes('provincial')) return true;
                    if (b.code === '0134' && t.includes('banesco')) return true;
                    return false;
                });
            }

            if (foundBank) {
                setBank(foundBank.name);
                discoveredBankName = foundBank.shortName || foundBank.name;
                identifiedFields.push('Banco');
            }

            if (identifiedFields.length > 0) {
                if (!alias) setAlias(discoveredBankName ? `Pago Móvil - ${discoveredBankName}` : "Ficha Copiada");
                toast.success(`Datos identificados: ${identifiedFields.join(', ')}`);
            } else {
                toast.error('No se detectaron datos válidos');
            }
        } catch (e) {
            console.error('Error reading clipboard', e);
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
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50">{editingId ? 'Editar Ficha' : 'Nueva Ficha'}</h4>
                                        <button
                                            onClick={handlePasteFromClipboard}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors border border-primary/20"
                                        >
                                            <ClipboardPaste size={12} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Pegar Datos</span>
                                        </button>
                                    </div>

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
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-white flex items-center">
                                                {(() => {
                                                    const selectedBank = VENEZUELA_BANKS.find(b => b.name === bank);
                                                    if (selectedBank && selectedBank.logo) {
                                                        return <img src={selectedBank.logo} alt="bank logo" className="w-4 h-4 object-contain rounded-sm bg-white p-[1px]" />;
                                                    }
                                                    return <Building2 size={14} className="opacity-30" />;
                                                })()}
                                            </span>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 z-10 pointer-events-none text-white"><ChevronDown size={14} /></div>
                                            <select
                                                value={bank}
                                                onChange={e => setBank(e.target.value)}
                                                onKeyDown={(e) => e.stopPropagation()}
                                                className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-11 pr-10 text-xs font-bold outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer text-white/90"
                                            >
                                                <option value="" disabled className="bg-zinc-900 text-white/50">Seleccionar Banco</option>
                                                {VENEZUELA_BANKS.filter(b => b.active !== 0).map(b => (
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

                                        <div className="relative w-full">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    id="qr-upload"
                                                />
                                                <label
                                                    htmlFor="qr-upload"
                                                    className="flex-1 cursor-pointer bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold flex justify-between items-center transition-colors hover:border-primary/50 group"
                                                >
                                                    <span className="opacity-50 text-[10px] uppercase font-black tracking-widest group-hover:text-primary transition-colors">
                                                        {qrCode ? 'QR Cargado (+)' : 'Subir código QR (Opcional)'}
                                                    </span>
                                                    {qrCode && <img src={qrCode} alt="QR Preview" className="w-6 h-6 object-cover rounded-md" />}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => {
                                                setIsAdding(false);
                                                setEditingId(null);
                                                setAlias('');
                                                setBank('');
                                                setIdNumber('');
                                                setPhone('');
                                                setDocumentType('V');
                                                setQrCode(null);
                                            }}
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
                                            <div className="flex items-center gap-3">
                                                {method.bankLogo && (
                                                    <img
                                                        src={method.bankLogo}
                                                        alt={method.bank}
                                                        className="w-8 h-8 rounded-lg object-contain bg-white p-1"
                                                    />
                                                )}
                                                <div>
                                                    <h4 className="text-sm font-black text-white mb-1">{method.alias}</h4>
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{method.bank}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 transition-all">
                                                <button
                                                    onClick={() => handleEdit(method)}
                                                    className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => removeMethod(method.id)}
                                                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
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
