
import React from 'react';
import { Trash2, RotateCw } from 'lucide-react';

interface ActionButtonsProps {
    handleReset: () => void;
    loadRates: () => void;
    isLoading: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ handleReset, loadRates, isLoading }) => {
    return (
        <section className="flex justify-center gap-4 my-2">
            <button
                onClick={handleReset}
                className="px-6 py-3 rounded-2xl bg-white/5 border border-transparent flex items-center gap-2 text-red-600 dark:text-red-400 font-bold hover:bg-red-500/5 transition-all active:scale-95 group"
                title="Resetear montos"
            >
                <Trash2 size={16} className="opacity-70 group-hover:opacity-100" />
                <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
            </button>
            <button
                onClick={loadRates}
                disabled={isLoading}
                className="px-6 py-3 rounded-2xl bg-white/5 border border-transparent flex items-center gap-2 text-primary hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-50 group font-bold"
                title="Actualizar tasas"
            >
                <RotateCw size={16} className={`opacity-70 group-hover:opacity-100 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Actualizar</span>
            </button>
        </section>
    );
};
