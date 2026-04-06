import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, History, CreditCard, Bell, Zap, Share2 } from 'lucide-react';

interface FeaturesSectionProps {
    onOpenTutorial: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onOpenTutorial }) => {
    const features = [
        {
            icon: <Smartphone className="text-primary" />,
            title: "Widgets Android",
            description: "Consulta las tasas sin abrir la app con nuestros widgets personalizables para tu pantalla de inicio."
        },
        {
            icon: <History className="text-primary" />,
            title: "Historial Completo",
            description: "Calendario interactivo para consultar tasas de cualquier fecha pasada de forma inmediata."
        },
        {
            icon: <CreditCard className="text-primary" />,
            title: "Fichas de Pago",
            description: "Guarda y gestiona tus datos de Pago Móvil. Genera imágenes para compartir con un solo toque."
        },
        {
            icon: <Bell className="text-primary" />,
            title: "Alertas en Vivo",
            description: "Mantente informado con notificaciones instantáneas cada vez que el BCV actualiza sus tasas."
        },
        {
            icon: <Zap className="text-primary" />,
            title: "Ultra Rápido",
            description: "Carga instantánea y pesos mínimos. Diseñado para funcionar incluso con conexiones lentas."
        },
        {
            icon: <Share2 className="text-primary" />,
            title: "Compartir Premium",
            description: "Reportes visuales elegantes listos para compartir por WhatsApp, Instagram o Telegram."
        }
    ];

    return (
        <section className="w-full py-20 px-6 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-4"
                    >
                        Todo lo que necesitas
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-black text-main leading-tight"
                    >
                        Más que una calculadora,<br />tu centro de divisas.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-surface/30 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] hover:bg-surface/50 transition-all hover:scale-[1.02] group flex flex-col"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-main mb-3">{feature.title}</h3>
                            <p className="text-[11px] font-bold text-main/50 leading-relaxed mb-6">{feature.description}</p>

                        </motion.div>
                    ))}
                </div>

                {/* Main App Mockup Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary/10 to-transparent border border-border p-8 md:p-12 shadow-2xl shadow-primary/5"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full border border-primary/20">
                                <span className="w-2 h-2 bg-primary animate-pulse rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Acceso Anticipado</span>
                            </div>
                            <h3 className="text-3xl font-black text-main leading-tight">
                                La potencia de <span className="text-primary">Konvierte</span> <br/> en tu bolsillo.
                            </h3>
                            <p className="text-sm font-bold text-main/50 leading-relaxed italic">
                                Únete a la lista de espera para disfrutar de una experiencia fluida, widgets en pantalla de inicio y notificaciones instantáneas de tasas.
                            </p>
                            <div className="flex justify-center md:justify-start">
                                <button
                                    onClick={onOpenTutorial}
                                    className="px-12 py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center gap-3"
                                >
                                    <Smartphone size={16} />
                                    Unirme a la lista
                                </button>
                            </div>
                        </div>
                        <div className="relative flex justify-center">
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                            <div className="relative z-10 w-full max-w-[280px] rounded-[2.5rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden aspect-[9/19.5] bg-zinc-950">
                                <img
                                    src="/screenshots/Calculadora Konvierte.jpeg"
                                    alt="App Screenshot"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
