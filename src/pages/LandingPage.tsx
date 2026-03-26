import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Zap, Shield, TrendingUp, Download, ExternalLink, Sun, Moon } from 'lucide-react';
import { FeaturesSection } from '../components/FeaturesSection';
import { TutorialModal } from '../components/TutorialModal';
import { Link } from 'react-router-dom';

interface LandingPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ theme, setTheme }) => {
    const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);
  return (
    <div className={`${theme} min-h-screen transition-colors duration-500`}>
      <div className="min-h-screen bg-background text-main selection:bg-primary/30 overflow-x-hidden relative">
        {/* Global Mesh Gradient Background */}
        <div className="absolute inset-0 mesh-gradient opacity-60 pointer-events-none" />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-lg border border-border overflow-hidden">
                <svg width="24" height="24" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M38 32V96M38 64 L74 32M56 64L88 96" stroke="#10B981" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="85" cy="64" r="18" fill="var(--surface-color)" stroke="#10B981" strokeWidth="6" />
                    <path d="M78 58C80 54 83 53 85 53C88 53 91 54 93 58L97 54M92 70C90 74 87 75 85 75C82 75 79 74 77 70L73 74" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <span className="text-lg font-black uppercase tracking-[0.2em]">Konvierte</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Características</a>
            <a href="#download" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Descargas</a>
            <Link to="/app" className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2">
              Abrir App <ArrowRight size={14} />
            </Link>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center hover:bg-primary/10 transition-colors shadow-sm"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun size={18} className="text-primary" /> : <Moon size={18} className="text-primary" />}
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun size={16} className="text-primary" /> : <Moon size={16} className="text-primary" />}
            </button>
            <Link to="/app" className="p-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
              App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 blur-[120px] -z-10 rounded-full" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="w-2 h-2 bg-primary animate-pulse rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Actualizado hoy con la tasa BCV</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] text-main">
              Tus finanzas <br/>en <span className="text-primary italic">Venezuela</span><br/>simplificadas.
            </h1>
            
            <p className="text-lg md:text-xl font-medium opacity-60 text-main max-w-xl mx-auto lg:mx-0 leading-relaxed">
              La calculadora de divisas más rápida, elegante y completa. Consulta tasas en tiempo real, genera fichas de pago y gestiona tus cuentas en un solo lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/app" 
                className="px-10 py-5 bg-primary text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-95 shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3"
              >
                Comenzar ahora
                <ArrowRight size={18} />
              </Link>
              <a 
                href="#download" 
                className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                Descargar APK
                <Download size={18} />
              </a>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-40">
              <div className="text-center">
                <p className="text-xl font-black">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest">Gratis</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-xl font-black">2k+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest">Usuarios</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-xl font-black">Fast</p>
                <p className="text-[10px] font-bold uppercase tracking-widest">Cloud Sync</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Visual Glass background decoration */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[120%] bg-gradient-to-t from-primary/20 via-transparent to-transparent blur-3xl opacity-30 -z-10" />
            
            <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative z-10 w-[300px] md:w-[350px] rounded-[3rem] border-[12px] border-zinc-900 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden aspect-[9/19.5] bg-zinc-950 transform hover:scale-[1.02] transition-transform duration-500">
                    <img
                        src="/screenshots/Calculadora Konvierte.jpeg"
                        alt="App Interface"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Si la imagen no carga, mostramos un fallback elegante
                            e.currentTarget.src = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000";
                        }}
                    />
                </div>
                
                {/* Floating elements */}
                <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-8 -right-8 glass-card p-4 shadow-2xl z-20 border-primary/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Ref. BCV</p>
                            <p className="text-lg font-black text-main">45.20 Bs.</p>
                        </div>
                    </div>
                </motion.div>
                
                <motion.div 
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute -bottom-10 -left-10 glass-card p-4 shadow-2xl z-20 border-primary/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Privacidad</p>
                            <p className="text-sm font-bold text-main">100% Segura</p>
                        </div>
                    </div>
                </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Anchor */}
      <div id="features" />
      <FeaturesSection onOpenTutorial={() => setIsTutorialOpen(true)} />

      <TutorialModal 
          isOpen={isTutorialOpen} 
          onClose={() => setIsTutorialOpen(false)} 
      />

      {/* Value Proposition */}
      <section className="py-24 px-6 bg-surface/30 backdrop-blur-3xl border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                        <Smartphone size={24} />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-widest">Mobile First</h3>
                    <p className="text-sm font-bold text-white/40 leading-relaxed">Optimizada para la mejor experiencia móvil, tanto web como nativa.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-widest">Real Time</h3>
                    <p className="text-sm font-bold text-white/40 leading-relaxed">Tasas actualizadas automáticamente al instante desde fuentes oficiales.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                        <ExternalLink size={24} />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-widest">Multilink</h3>
                    <p className="text-sm font-bold text-white/40 leading-relaxed">Comparte reportes, tasas y fichas de pago directamente a tus apps.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-widest">Sin Registro</h3>
                    <p className="text-sm font-bold text-white/40 leading-relaxed">Usa todas las funciones sin necesidad de crear cuenta o dejar datos.</p>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="py-32 px-6">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto glass-card p-12 md:p-24 text-center relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -z-10 rounded-full group-hover:bg-primary/30 transition-colors" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] -z-10 rounded-full" />
            
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 italic">
              ¿Listo para simplificar <br className="hidden md:block"/> tus cuentas?
            </h2>
            
            <p className="text-lg md:text-xl font-medium text-white/40 max-w-2xl mx-auto mb-12">
              Únete a los miles de venezolanos que ya usan Konvierte para gestionar sus pagos y consultar el dólar cada día.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link 
                    to="/app" 
                    className="px-12 py-6 bg-primary text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20"
                >
                    Ir a la Calculadora
                </Link>
                <button 
                    className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                    <Smartphone size={20} />
                    Descargar APK
                </button>
            </div>
        </motion.div>
      </section>

      {/* Simplified Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-center bg-zinc-950/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
            <div className="flex items-center gap-3 opacity-60">
                 <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center shadow-lg border border-border overflow-hidden">
                    <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M38 32V96M38 64 L74 32M56 64L88 96" stroke="#10B981" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className="text-sm font-black uppercase tracking-[0.2em]">Konvierte</span>
            </div>
            
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                <a href="#" className="hover:text-primary transition-colors">Términos</a>
                <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
                <a href="#" className="hover:text-primary transition-colors">Contacto</a>
            </div>
            
            <p className="text-[10px] font-bold opacity-20 text-main uppercase tracking-[0.5em] mt-8">
                &copy; {new Date().getFullYear()} Konvierte Digital - Todos los derechos reservados
            </p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default LandingPage;
