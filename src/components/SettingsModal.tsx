import React from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    newRateName: string;
    setNewRateName: (val: string) => void;
    newRateFormula: string;
    setNewRateFormula: (val: string) => void;
    previewRateValue: number;
    addCustomRate: (name: string, formula: string) => void;
    ratesOrder: string[];
    updateOrder: (order: string[]) => void;
    allRates: Record<string, any>;
    defaultRateId: string | null;
    toggleDefault: (id: string) => void;
    removeCustomRate: (id: string) => void;
    RateItem: React.ComponentType<any>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    newRateName,
    setNewRateName,
    newRateFormula,
    setNewRateFormula,
    previewRateValue,
    addCustomRate,
    ratesOrder,
    updateOrder,
    allRates,
    defaultRateId,
    toggleDefault,
    removeCustomRate,
    RateItem
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] p-6 flex items-center justify-center">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card max-w-md w-full p-8 max-h-[80vh] overflow-y-auto space-y-8 bg-surface dark:bg-surface border-white/10">
                        <div className="flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-widest">Ajustes</h3><button onClick={onClose} aria-label="Cerrar ajustes"><X size={18} /></button></div>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <span className="label-zen text-[9px]">Nueva Tasa</span>
                                <div className="flex flex-col gap-3">
                                    <input value={newRateName} onChange={(e) => setNewRateName(e.target.value)} placeholder="Nombre" aria-label="Nombre de la nueva tasa" className="bg-white/5 p-4 rounded-2xl text-[11px] font-bold outline-none border border-black/5 dark:border-white/5 focus:border-primary/50 placeholder:opacity-80 transition-all" />
                                    <input value={newRateFormula} onChange={(e) => setNewRateFormula(e.target.value)} placeholder="Fórmula (Ej: bcv_usd * 1.1)" aria-label="Fórmula de la tasa" className="bg-white/5 p-4 rounded-2xl text-[11px] font-bold outline-none border border-black/5 dark:border-white/5 focus:border-primary/50 placeholder:opacity-80 transition-all" />
                                    {newRateFormula && (<div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-center justify-between"><span className="text-[10px] font-black uppercase opacity-70">Resultado:</span><span className="text-sm font-black text-primary">Bs. {formatCurrency(previewRateValue)}</span></div>)}
                                    <button onClick={() => { if (newRateName && newRateFormula && previewRateValue > 0) { addCustomRate(newRateName, newRateFormula); setNewRateName(''); setNewRateFormula(''); } }} disabled={!newRateName || !newRateFormula || previewRateValue <= 0} className="bg-primary hover:bg-primary/80 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50">Añadir Tasa</button>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-black/5 dark:border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="label-zen text-[9px]">Organizar Mis Tasas</span>
                                    <span className="text-[8px] font-black opacity-80 uppercase tracking-widest italic">Arrastra para ordenar</span>
                                </div>
                                <Reorder.Group axis="y" values={ratesOrder} onReorder={updateOrder} className="space-y-2">
                                    {ratesOrder.map((id) => {
                                        const data = allRates[id];
                                        if (!data) return null;
                                        return (
                                            <RateItem
                                                key={id}
                                                id={id}
                                                data={data}
                                                isDefault={id === defaultRateId}
                                                isCustom={id.startsWith('custom_')}
                                                onToggleDefault={toggleDefault}
                                                onRemove={removeCustomRate}
                                            />
                                        );
                                    })}
                                </Reorder.Group>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
