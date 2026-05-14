import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, MessageCircle, MapPin, User, ArrowRight, PartyPopper } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';

interface PostDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    downloadCount: number;
}

const STORAGE_KEY = 'konvierte_post_download_registered';

export const PostDownloadModal: React.FC<PostDownloadModalProps> = ({ isOpen, onClose, downloadCount }) => {
    const [form, setForm] = useState({ name: '', whatsapp: '', city: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [done, setDone] = useState(false);

    // Si ya se registró antes, mostramos directamente el estado de éxito
    const alreadyRegistered = () => {
        try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('waitlist')
                .insert([{
                    name: form.name.trim(),
                    whatsapp: form.whatsapp.trim(),
                    position: downloadCount + 1,
                    referral_code: Math.random().toString(36).substring(7),
                    referred_by: form.city.trim() || null,   // reutilizamos referred_by para ciudad temporalmente
                }]);

            // Error 23505 = duplicado por whatsapp, lo tratamos como éxito
            if (error && error.code !== '23505') throw error;

            localStorage.setItem(STORAGE_KEY, '1');
            setDone(true);
            toast.success('¡Registrado! Te avisaremos de novedades por WhatsApp.');
        } catch {
            toast.error('Hubo un error, intenta de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = () => {
        localStorage.setItem(STORAGE_KEY, '1');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleSkip}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
                    >
                        {/* Glow top */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

                        {/* Close */}
                        <button
                            onClick={handleSkip}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors z-10"
                        >
                            <X size={14} className="text-white/50" />
                        </button>

                        <AnimatePresence mode="wait">
                            {done || alreadyRegistered() ? (
                                /* Estado éxito */
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 text-center space-y-5"
                                >
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30">
                                        <PartyPopper size={28} className="text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-white">¡Todo listo!</h3>
                                        <p className="text-sm text-white/50 leading-relaxed">
                                            Gracias por registrarte. Te notificaremos por WhatsApp cuando haya <span className="text-primary font-bold">actualizaciones y novedades</span> de Konvierte.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Tu descarga</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckCircle size={14} className="text-primary" />
                                            <span className="text-sm font-black text-white">Konvierte.apk · en progreso</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-primary rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary/90 transition-all active:scale-95"
                                    >
                                        Entendido 🎉
                                    </button>
                                </motion.div>
                            ) : (
                                /* Formulario */
                                <motion.div key="form" className="p-6 space-y-5">
                                    {/* Header */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 flex-shrink-0">
                                            <Download size={22} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">¡Descargando!</p>
                                            <h3 className="text-lg font-black text-white leading-tight">Konvierte está en camino</h3>
                                        </div>
                                    </div>

                                    <p className="text-sm text-white/50 leading-relaxed">
                                        Déjanos tu datos para avisarte de <span className="text-white font-bold">actualizaciones y noticias</span> directo a tu WhatsApp. Es opcional, tarda 10 segundos.
                                    </p>

                                    {/* Social proof */}
                                    <div className="flex items-center gap-2 py-2">
                                        <div className="flex -space-x-2">
                                            {['#10B981', '#3B82F6', '#F59E0B', '#EF4444'].map((c, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[8px] font-black text-white" style={{ background: c }}>
                                                    {['J', 'M', 'A', 'L'][i]}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-white/40 font-bold">
                                            +{downloadCount.toLocaleString()} personas ya descargaron
                                        </span>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        {/* Nombre */}
                                        <div className="relative">
                                            <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input
                                                type="text"
                                                placeholder="Tu nombre"
                                                required
                                                disabled={isSaving}
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-white placeholder-white/25 outline-none focus:border-primary/60 transition-all disabled:opacity-50"
                                            />
                                        </div>

                                        {/* WhatsApp */}
                                        <div className="relative">
                                            <MessageCircle size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input
                                                type="tel"
                                                placeholder="WhatsApp (ej: 0412-1234567)"
                                                required
                                                disabled={isSaving}
                                                value={form.whatsapp}
                                                onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-white placeholder-white/25 outline-none focus:border-primary/60 transition-all disabled:opacity-50"
                                            />
                                        </div>

                                        {/* Ciudad */}
                                        <div className="relative">
                                            <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input
                                                type="text"
                                                placeholder="Ciudad (opcional)"
                                                disabled={isSaving}
                                                value={form.city}
                                                onChange={e => setForm({ ...form, city: e.target.value })}
                                                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-white placeholder-white/25 outline-none focus:border-primary/60 transition-all disabled:opacity-50"
                                            />
                                        </div>

                                        {/* CTA */}
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                                            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 10px 30px rgba(16,185,129,0.3)' }}
                                        >
                                            {isSaving ? 'Guardando...' : <><CheckCircle size={15} /> Recibir novedades <ArrowRight size={14} /></>}
                                        </button>
                                    </form>

                                    {/* Skip */}
                                    <button
                                        onClick={handleSkip}
                                        className="w-full text-center text-[10px] font-bold text-white/25 hover:text-white/50 transition-colors py-1"
                                    >
                                        No gracias, solo quiero la app
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
