
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Image as ImageIcon } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareAsText: () => void;
    shareAsImage: () => void;
    sharing: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareAsText, shareAsImage, sharing }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] p-6 flex items-center justify-center">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card max-w-xs w-full p-8 space-y-8 bg-surface dark:bg-surface border-white/10">
                        <div className="flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-widest">Compartir</h3><button onClick={onClose}><X size={18} /></button></div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={shareAsText} className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-[2rem] hover:bg-primary/10 transition-all group">
                                <Type size={24} className="opacity-30 group-hover:text-primary transition-all" /><span className="text-[10px] font-black uppercase opacity-20 group-hover:text-primary">Texto</span>
                            </button>
                            <button onClick={shareAsImage} disabled={sharing} className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-[2rem] hover:bg-primary/10 transition-all group disabled:opacity-50">
                                <ImageIcon size={24} className="opacity-30 group-hover:text-primary transition-all" /><span className="text-[10px] font-black uppercase opacity-20 group-hover:text-primary">{sharing ? '...' : 'Imagen'}</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
