import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, ClipboardPaste } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface VirtualKeyboardProps {
    isOpen: boolean;
    onKeyPress: (key: string) => void;
    onClose?: () => void;
    variant?: 'fixed' | 'embedded';
    className?: string;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    isOpen,
    onKeyPress,
    variant = 'fixed',
    className
}) => {
    const isFixed = variant === 'fixed';

    const keys = [
        'AC', 'DELETE', '%', '÷',
        '7', '8', '9', '×',
        '4', '5', '6', '-',
        '1', '2', '3', '+',
        'PASTE', '0', ',', '='
    ];

    const content = (
        <section
            className={twMerge(
                isFixed
                    ? "fixed bottom-0 left-0 w-full z-50 bg-[#050505] border-t border-white/5 p-4 pt-2 safe-bottom virtual-keyboard"
                    : "w-full bg-transparent p-0 flex flex-col justify-center",
                className
            )}
        >
            <div className={isFixed ? "max-w-xl mx-auto w-full" : "w-full"}>
                <div className="grid grid-cols-4 gap-2">
                    {keys.map((k) => {
                        const isOp = ['÷', '×', '-', '+', '=', 'AC', '%', 'DELETE', 'PASTE'].includes(k);
                        const isEqual = k === '=';
                        const isDel = k === 'DELETE';
                        const isPaste = k === 'PASTE';
                        
                        return (
                            <button
                                key={k}
                                onClick={() => onKeyPress(k)}
                                className={clsx(
                                    "h-14 flex items-center justify-center rounded-xl text-lg font-black transition-all active:scale-90",
                                    isEqual ? "bg-primary text-black" : "bg-white/5",
                                    isOp && !isEqual ? "text-primary" : "text-main"
                                )}
                            >
                                {isDel ? <Delete size={20} /> : (isPaste ? <ClipboardPaste size={20} /> : k)}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );

    if (isFixed) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}>
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return content;
};
