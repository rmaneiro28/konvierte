import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, History, CreditCard, Share2, Zap, Monitor } from 'lucide-react';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
    const steps = [
        {
            title: "Calculadora Inteligente",
            description: "Toca cualquier monto para activar el teclado. Puedes intercambiar entre USD y VES con el botón central. ¡Las tasas se actualizan automáticamente cada vez que abres la app!",
            icon: <Zap className="text-primary" />,
            image: "/screenshots/Calculadora Konvierte.jpeg"
        },
        {
            title: "Gestión de Fichas de Pago",
            description: "Pulsa el icono de billetera para guardar tus datos de Pago Móvil. Puedes pegar datos directamente desde el portapapeles y la app los reconocerá automáticamente.",
            icon: <CreditCard className="text-primary" />,
            image: "/screenshots/Ficha de Pago - Konvierte.jpeg"
        },
        {
            title: "Widgets para Android",
            description: "Mantén presionada tu pantalla de inicio en Android, selecciona Widgets y busca 'Konvierte'. Ahora puedes ver el precio del dólar sin abrir la aplicación.",
            icon: <Smartphone className="text-primary" />,
            image: "/widget_preview.png"
        },
        {
            title: "Historial y Gráficos",
            description: "Consulta el historial de los últimos 7 días con las mini-gráficas en el selector de tasas. Usa el botón 'Histórico' para ver tasas de cualquier fecha pasada.",
            icon: <History className="text-primary" />
        },
        {
            title: "Compartir con Estilo",
            description: "Genera reportes visuales con tus datos de pago incluidos. Perfecto para enviar presupuestos o cobrar por WhatsApp de forma profesional.",
            icon: <Share2 className="text-primary" />
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <Monitor size={20} className="text-primary" />
                                </div>
                                <h2 className="text-lg font-black uppercase tracking-tight text-white">Tutorial de Konvierte</h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <X size={20} className="text-white/50" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar space-y-12">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                {step.icon}
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-primary">0{idx + 1}. {step.title}</h3>
                                        </div>
                                        <p className="text-sm font-bold text-white/60 leading-relaxed italic">
                                            "{step.description}"
                                        </p>
                                    </div>
                                    {step.image && (
                                        <div className="w-full md:w-48 shrink-0 rounded-2xl border border-white/10 overflow-hidden bg-black/20">
                                            <img 
                                                src={step.image} 
                                                alt={step.title} 
                                                className="w-full h-full object-cover opacity-80"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-center">
                            <button 
                                onClick={onClose}
                                className="px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95"
                            >
                                ¡Entendido, vamos!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
