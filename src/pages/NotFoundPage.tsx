import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0F1115] text-[#C9D1D9] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-500">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center relative z-10 max-w-lg"
            >
                {/* Visual Icon */}
                <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 rotate-6 hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-emerald-500/10">
                    <Search size={40} className="text-emerald-500" />
                </div>

                <h1 className="text-9xl font-black italic tracking-tighter opacity-10 mb-4 select-none">404</h1>
                <h2 className="text-4xl font-extrabold tracking-tight text-white mb-6 underline underline-offset-8 decoration-emerald-500/30 italic">Página no encontrada</h2>
                <p className="text-lg font-medium text-[#8B949E] leading-relaxed mb-12">
                   Ups, parece que esta ruta se ha esfumado. Si buscabas la API, verifica que la URL sea correcta o vuelve al inicio.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <NavLink to="/" className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3">
                        <Home size={18} fill="currentColor" /> Volver al Inicio
                    </NavLink>
                    <button 
                        onClick={() => window.history.back()} 
                        className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                    >
                        <ArrowLeft size={18} /> Regresar
                    </button>
                </div>
            </motion.div>

            {/* Subtle Footer Info */}
            <div className="absolute bottom-10 left-0 right-0 text-center opacity-20 hover:opacity-50 transition-opacity">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono italic">Konvierte Ecosystem | V1.1</span>
            </div>
        </div>
    );
};

export default NotFoundPage;
