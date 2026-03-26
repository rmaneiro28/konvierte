import React from 'react';
import { Eraser, RotateCw, History } from 'lucide-react';
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
        <section className={twMerge("flex flex-row gap-2 my-1 w-full max-w-sm mx-auto", className)}>
            <button
                onClick={loadRates}
                disabled={isLoading}
                className="flex-[1.2] py-3 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-row items-center justify-center gap-2 text-green-500 hover:bg-green-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
                <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">Actualizar</span>
            </button>
            <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-row items-center justify-center gap-2 text-orange-500 hover:bg-orange-500/20 transition-all active:scale-95"
            >
                <Eraser size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
            </button>
            <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex-1 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-row items-center justify-center gap-2 text-blue-500 hover:bg-blue-500/20 transition-all active:scale-95"
            >
                <History size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Historial</span>
            </button>
        </section>
    );
};
