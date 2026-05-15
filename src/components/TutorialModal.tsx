import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, History, CreditCard, Share2, Monitor, Users, Star } from 'lucide-react';
import { joinWaitlist, getWaitlistCount, getUserWaitlistState } from '../services/waitlistService';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
    const [searchParams] = useSearchParams();
    const refCode = searchParams.get('ref');
    const steps = [
        {
            title: "Presupuestos Multi-moneda",
            description: "Crea presupuestos detallados en dólares, euros o bolívares. La app se encarga de las conversiones en tiempo real para que tus cuentas siempre cuadren.",
            icon: <CreditCard className="text-primary" />,
            image: "/screenshots/Ficha de Pago - Konvierte.jpeg"
        },
        {
            title: "PDFs con tu Marca",
            description: "Exporta tus presupuestos como PDFs profesionales con tu logo, redes sociales y código QR de Pago Móvil. Perfecto para negocios y freelancers.",
            icon: <Share2 className="text-primary" />,
            image: "/screenshots/Compartir - Konvierte.jpeg"
        },
        {
            title: "Tasa del Mañana & Historial",
            description: "Anticípate con la visualización de la tasa oficial del día siguiente apenas es publicada. Analiza tendencias con gráficos interactivos de los últimos 7 días.",
            icon: <History className="text-primary" />,
            image: "/screenshots/Historial de Tasas - Konvierte.jpeg"
        },
        {
            title: "Widgets & Accesos Rápidos",
            description: "Configura widgets en tu pantalla de inicio Android para consultar el precio del dólar al instante o acceder a tu calculadora con un solo toque.",
            icon: <Smartphone className="text-primary" />,
            image: "/screenshots/Widget - Konvierte.png"
        },
        {
            title: "Directorio Bancario",
            description: "Accede a la información oficial de toda la banca venezolana (nombres, códigos y logos) directamente desde la app para facilitar tus transferencias.",
            icon: <Monitor className="text-primary" />,
            image: "/screenshots/Calculadora Konvierte.jpeg"
        },
        {
            title: "Acceso Anticipado (Beta)",
            description: "Únete a nuestra lista de espera exclusiva. Te avisaremos por WhatsApp en cuanto tu lugar esté listo para que descargues la app oficial.",
            icon: <Smartphone className="text-primary" />,
            image: "/screenshots/Widget - Konvierte.png",
            isWaitlist: true
        }
    ];

    const [waitlistData, setWaitlistData] = useState({ name: '', whatsapp: '' });
    const [userState, setUserState] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        const saved = getUserWaitlistState();
        if (saved) setUserState(saved);
    }, [isOpen]);

    const handleJoinWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const state = await joinWaitlist(waitlistData.name, waitlistData.whatsapp, refCode || undefined);
        if (state) {
            setUserState(state);
            toast.success("¡Bienvenido a la lista de espera!");
        } else {
            toast.error("Error al registrarte.");
        }
        setIsSaving(false);
    };

    const handleShare = () => {
        if (userState?.referralLink) {
            const shareText = `🚀 ¡Acabo de unirme a la lista de espera de *Konvierte*! La app definitiva para el dólar en Venezuela.\n\nÚnete tú también aquí para tener acceso anticipado:\n${userState.referralLink}\n\n¡Estoy en el puesto *#${userState.position?.toLocaleString()}*! Si usas mi link, subo puestos y tú entras antes. 🔥`;

            navigator.clipboard.writeText(shareText);
            toast.success("¡Mensaje de invitación copiado! Pégalo en tus grupos de WhatsApp.");
        }
    };

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
                                <h2 className="text-lg font-black uppercase tracking-tight text-white">Tutorial y Acceso Beta</h2>
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
                                        {(step as any).isWaitlist && (
                                            <div className="mt-4">
                                                {refCode && !userState && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3"
                                                    >
                                                        <Star size={16} className="text-primary fill-primary/30" />
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-tight">
                                                            ¡Invitación detectada! Tu acceso será prioritario.
                                                        </p>
                                                    </motion.div>
                                                )}
                                                {!userState ? (
                                                    <form onSubmit={handleJoinWaitlist} className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5 relative">
                                                        <div className="flex items-center gap-2 mb-2 opacity-60">
                                                            <Users size={14} className="text-primary" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">{getWaitlistCount().toLocaleString()} personas en espera</span>
                                                        </div>
                                                        <input
                                                            required
                                                            disabled={isSaving}
                                                            type="text"
                                                            placeholder="Tu Nombre"
                                                            className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-bold text-white outline-none focus:border-primary transition-all disabled:opacity-50"
                                                            onChange={(e) => setWaitlistData({ ...waitlistData, name: e.target.value })}
                                                        />
                                                        <input
                                                            required
                                                            disabled={isSaving}
                                                            type="tel"
                                                            placeholder="Tu WhatsApp (Ej: 0412...)"
                                                            className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-bold text-white outline-none focus:border-primary transition-all disabled:opacity-50"
                                                            onChange={(e) => setWaitlistData({ ...waitlistData, whatsapp: e.target.value })}
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={isSaving}
                                                            className="w-full py-3.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                                                        >
                                                            {isSaving ? 'Registrando...' : 'Unirme a la lista de espera'}
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-center space-y-4"
                                                    >
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">¡Estás en la fila!</p>
                                                            <h4 className="text-3xl font-black text-white tracking-tighter italic">#{userState.position?.toLocaleString()}</h4>
                                                        </div>

                                                        <p className="text-[11px] font-bold text-white/50 leading-tight">
                                                            Invita a tus contactos para subir <span className="text-primary">10,000 puestos</span> y obtener acceso antes que nadie. Te avisaremos el <span className="text-white">1 de Mayo</span>.
                                                        </p>

                                                        <button
                                                            onClick={handleShare}
                                                            className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Share2 size={14} />
                                                            Invitar Amigos
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
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
