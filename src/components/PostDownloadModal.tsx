import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, Settings, ArrowRight, ShieldCheck } from 'lucide-react';

interface PostDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PostDownloadModal: React.FC<PostDownloadModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Glow top */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors z-10"
                        >
                            <X size={14} className="text-white/50" />
                        </button>

                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 flex-shrink-0">
                                    <Download size={22} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">¡Descarga en curso!</p>
                                    <h3 className="text-lg font-black text-white leading-tight">Konvierte se está descargando</h3>
                                </div>
                            </div>

                            {/* Info */}
                            <p className="text-xs text-white/50 leading-relaxed">
                                El archivo <span className="text-white font-bold">Konvierte.apk</span> debería comenzar a descargarse automáticamente. Sigue estos pasos para instalarlo:
                            </p>

                            {/* Steps list */}
                            <div className="space-y-3">
                                {[
                                    {
                                        step: "1",
                                        icon: <Download size={14} className="text-primary" />,
                                        title: "Abre el archivo",
                                        desc: "Una vez finalizada la descarga, pulsa en la notificación de descarga o busca 'Konvierte.apk' en tu carpeta de descargas."
                                    },
                                    {
                                        step: "2",
                                        icon: <Settings size={14} className="text-primary" />,
                                        title: "Permitir orígenes desconocidos",
                                        desc: "Si tu navegador solicita permisos para instalar aplicaciones de origen desconocido, pulsa 'Ajustes' y activa la opción."
                                    },
                                    {
                                        step: "3",
                                        icon: <CheckCircle size={14} className="text-primary" />,
                                        title: "Completa la instalación",
                                        desc: "Pulsa 'Instalar' cuando se te solicite. Una vez completado, ya podrás abrir Konvierte y usarla."
                                    }
                                ].map((item, index) => (
                                    <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-start">
                                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-black text-primary">
                                            {item.step}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-white flex items-center gap-1.5">
                                                {item.icon} {item.title}
                                            </p>
                                            <p className="text-[10px] text-white/40 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Security badge */}
                            <div className="flex items-center gap-2.5 justify-center py-1 opacity-60">
                                <ShieldCheck size={14} className="text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-white">Instalación 100% segura · Libre de malware</span>
                            </div>

                            {/* Button */}
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                                style={{ boxShadow: '0 10px 30px rgba(16,185,129,0.2)' }}
                            >
                                Entendido, ¡a instalar! <ArrowRight size={12} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
