import React from 'react';
import { Trash2, RotateCw, History } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ActionButtonsProps {
    handleReset: () => void;
    loadRates: () => void;
    isLoading: boolean;
    setIsHistoryOpen: (isOpen: boolean) => void;
    className?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ handleReset, loadRates, isLoading, setIsHistoryOpen, className }) => {
    return (
        <section className={twMerge("flex flex-row justify-center gap-3 my-2 w-full", className)}>
            <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex-1 max-w-[90px] aspect-square rounded-[1.25rem] bg-white/5 border border-transparent flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/5 transition-all active:scale-95 group font-bold shadow-sm"
                title="Histórico de tasas"
            >
                <History size={20} className="opacity-70 group-hover:opacity-100" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none mt-1">Histórico</span>
            </button>
            <button
                onClick={handleReset}
                className="flex-1 max-w-[90px] aspect-square rounded-[1.25rem] bg-white/5 border border-transparent flex flex-col items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold hover:bg-red-500/5 transition-all active:scale-95 group shadow-sm"
                title="Resetear montos"
            >
                <Trash2 size={20} className="opacity-70 group-hover:opacity-100" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none mt-1">Reset</span>
            </button>
            <button
                onClick={loadRates}
                disabled={isLoading}
                className="flex-1 max-w-[90px] aspect-square rounded-[1.25rem] bg-white/5 border border-transparent flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-50 group font-bold shadow-sm"
                title="Actualizar tasas"
            >
                <RotateCw size={20} className={`opacity-70 group-hover:opacity-100 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none mt-1">Actualizar</span>
            </button>
        </section>
    );
};
