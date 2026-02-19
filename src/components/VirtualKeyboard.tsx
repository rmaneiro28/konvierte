import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface VirtualKeyboardProps {
    isOpen: boolean;
    onKeyPress: (key: string) => void;
    onClose: () => void;
    variant?: 'fixed' | 'embedded';
    className?: string;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    isOpen,
    onKeyPress,
    onClose,
    variant = 'fixed',
    className
}) => {
    const isFixed = variant === 'fixed';

    const content = (
        <section
            className={twMerge(
                isFixed
                    ? "fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-3xl border-t border-border p-3 pt-2 safe-bottom virtual-keyboard shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
                    : "w-full bg-surface/50 rounded-3xl border border-white/5 p-6 backdrop-blur-xl h-full flex flex-col justify-center",
                className
            )}
        >
            <div className={isFixed ? "max-w-xl mx-auto" : "w-full"}>
                {isFixed && (
                    <div className="flex justify-center mb-1 pb-1">
                        <button
                            onClick={onClose}
                            className="w-10 h-1 bg-border rounded-full hover:bg-primary/30 transition-colors"
                            aria-label="Cerrar teclado"
                        />
                    </div>
                )}
                <div className={clsx("grid gap-2", isFixed ? "grid-cols-3" : "grid-cols-3 gap-4")}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0, 'DELETE'].map((k) => (
                        <button
                            key={k}
                            onClick={() => onKeyPress(k.toString())}
                            className={clsx(
                                "key-cap",
                                !isFixed && "h-14 text-xl hover:bg-primary/20 hover:border-primary/30"
                            )}
                            aria-label={k === 'DELETE' ? 'Borrar número' : `Número ${k}`}
                        >
                            {k === 'DELETE' ? <Delete size={20} /> : k}
                        </button>
                    ))}
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
