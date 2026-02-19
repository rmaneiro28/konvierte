
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete } from 'lucide-react';

interface VirtualKeyboardProps {
    isOpen: boolean;
    onKeyPress: (key: string) => void;
    onClose: () => void;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ isOpen, onKeyPress, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.section initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-3xl border-t border-border p-6 pt-4 safe-bottom virtual-keyboard shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
                    <div className="max-w-xl mx-auto">
                        <div className="flex justify-center mb-2 pb-2">
                            <button
                                onClick={onClose}
                                className="w-12 h-1 bg-border rounded-full hover:bg-primary/30 transition-colors"
                                aria-label="Cerrar teclado"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0, 'DELETE'].map((k) => (
                                <button
                                    key={k}
                                    onClick={() => onKeyPress(k.toString())}
                                    className="key-cap"
                                    aria-label={k === 'DELETE' ? 'Borrar número' : `Número ${k}`}
                                >
                                    {k === 'DELETE' ? <Delete size={20} /> : k}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
};
