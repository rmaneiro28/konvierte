import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Zap, Shield, TrendingUp, ExternalLink, Sun, Moon, Users, Monitor } from 'lucide-react';
import { FeaturesSection } from '../components/FeaturesSection';
import { TutorialModal } from '../components/TutorialModal';
import { NavLink, useSearchParams } from 'react-router-dom';
import { fetchRates } from '../services/rateService';
import { formatCurrency } from '../utils/formatters';
import { getWaitlistCount } from '../services/waitlistService';

interface LandingPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ theme, setTheme }) => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [bcvRate, setBcvRate] = useState<string>('---');
  const [binanceRate, setBinanceRate] = useState<string>('---');

  const [lastUpdated, setLastUpdated] = useState<string>('hoy');
  const [waitlistCount, setWaitlistCount] = useState<number>(1240);


  useEffect(() => {
    const loadWaitlist = async () => {
      const count = await getWaitlistCount();
      setWaitlistCount(count);
    };
    loadWaitlist();

    const getRate = async () => {
      try {
        const data = await fetchRates();
        if (data.bcv_usd) {
          setBcvRate(formatCurrency(data.bcv_usd.price));
          if (data.bcv_usd.lastUpdate) {
            try {
              const date = new Date(data.bcv_usd.lastUpdate);
              setLastUpdated(date.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' }));
            } catch (e) { }
          }
        }
        if (data.binance_usd) {
          setBinanceRate(formatCurrency(data.binance_usd.price));
        }
      } catch (e) {
        console.error("Error cargando tasas en landing:", e);
      }
    };
    getRate();
  }, []);

  const copyToClipboard = (value: string, label: string) => {
    const rawValue = value.replace('Bs.', '').trim();
    navigator.clipboard.writeText(rawValue);
    // @ts-ignore
    import('sonner').then(({ toast }) => {
        toast.success(`${label} copiado: ${rawValue} Bs.`);
    });
  };


  return (
    <div className={`${theme} min-h-screen transition-colors duration-500`}>
      <div className="min-h-screen bg-background text-main selection:bg-primary/30 overflow-x-hidden relative">
        {/* Global Mesh Gradient Background */}
        <div className="absolute inset-0 mesh-gradient opacity-60 pointer-events-none" />
        {/* Navigation */}
        <nav className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border h-20 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-lg border border-border overflow-hidden">
                <svg width="24" height="24" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M38 32V96M38 64 L74 32M56 64L88 96" stroke="#10B981" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="85" cy="64" r="18" fill="var(--surface-color)" stroke="#10B981" strokeWidth="6" />
                  <path d="M78 58C80 54 83 53 85 53C88 53 91 54 93 58L97 54M92 70C90 74 87 75 85 75C82 75 79 74 77 70L73 74" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-black uppercase tracking-[0.2em]">Konvierte</span>
            </NavLink>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Características</a>
              <a href="#download" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Descargas</a>
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                Unirme <ArrowRight size={14} />
              </button>
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
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                Unirme
              </button>
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
              {refCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl mb-8 group overflow-hidden relative"
                >
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary animate-pulse" />
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                    <Zap size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Invitación Validada</p>
                    <p className="text-[9px] font-bold text-white/50 lowercase italic">Código: {refCode}</p>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-black rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <span className="w-2 h-2 bg-black animate-ping rounded-full" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Lanzamiento Oficial: 1 de Mayo</span>
                </div>
                <div className="flex items-center gap-2 opacity-100">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Cupos de acceso beta limitados</span>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] text-main">
                Tus finanzas <br />en <span className="text-primary italic">Venezuela</span><br />simplificadas.
              </h1>

              <p className="text-lg md:text-xl font-medium opacity-60 text-main max-w-xl mx-auto lg:mx-0 leading-relaxed">
                La calculadora de divisas más rápida, elegante y completa. Consulta tasas en tiempo real, genera fichas de pago y gestiona tus cuentas en un solo lugar.
              </p>

              <div className="flex justify-center lg:justify-start">
                <button
                  onClick={() => setIsTutorialOpen(true)}
                  className="px-12 py-6 bg-primary text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-95 shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4"
                >
                  Unirme Ahora
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-40">
                <div className="text-center">
                  <p className="text-xl font-black">100%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Gratis</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-xl font-black">{waitlistCount.toLocaleString()}+</p>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-widest">En Espera</p>
                    <p className="text-[8px] opacity-40 uppercase tracking-tighter italic">Tasas de {lastUpdated}</p>
                  </div>
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

                {/* Floating elements - Tasas en Vivo */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-8 -right-12 glass-card p-5 shadow-2xl z-20 border-primary/20 min-w-[180px] flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between group/row">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                        <TrendingUp size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Ref. BCV (Oficial)</p>
                        <p className="text-md font-black text-main">{bcvRate}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(bcvRate, 'BCV')}
                      className="p-2 hover:bg-primary/10 rounded-lg text-primary opacity-0 group-hover/row:opacity-100 transition-opacity"
                      aria-label="Copiar tasa BCV"
                    >
                      <Zap size={14} />
                    </button>
                  </div>

                  <div className="h-px bg-white/5 mx-2" />

                  <div className="flex items-center justify-between group/row">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-500">
                        <Zap size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">USDT P2P (Promedio)</p>
                        <p className="text-md font-black text-main">{binanceRate}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(binanceRate, 'Binance')}
                      className="p-2 hover:bg-orange-500/10 rounded-lg text-orange-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
                      aria-label="Copiar tasa Binance"
                    >
                      <Zap size={14} />
                    </button>
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

        {/* Developers Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] -z-10 rounded-full" />
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                    <Monitor size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Developer Early Access</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight italic">
                  Una API pensada <br/> por <span className="text-primary italic">Developers</span>
                </h2>
                
                <p className="text-lg font-medium text-white/50 leading-relaxed max-w-xl">
                    Sabemos lo difícil que es encontrar una fuente de datos estable para tasas en Venezuela. Konvierte API ofrece JSON limpio, alta disponibilidad y documentación real.
                </p>

                {/* Micro Endpoints List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                        { route: '/api/rates', label: 'Global Rates' },
                        { route: '/api/history', label: 'Historical' },
                        { route: '/docs/api/usd', label: 'USD oficial' },
                        { route: '/docs/api/usdt', label: 'USDT P2P' }
                    ].map(ep => (
                        <a 
                            key={ep.route} 
                            href={ep.route}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl group/ep hover:border-primary/20 transition-all cursor-pointer"
                        >
                            <span className="text-[7px] font-black uppercase tracking-tighter bg-primary/20 text-primary px-2 py-0.5 rounded-md">GET</span>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-mono opacity-30 group-hover/ep:opacity-100 transition-opacity">{ep.route}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-20">{ep.label}</span>
                            </div>
                        </a>
                    ))}
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">

                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:border-primary/30 transition-all">
                        <p className="text-primary font-black uppercase text-[10px] tracking-widest mb-2">99.9% Uptime</p>
                        <p className="text-sm font-medium text-white/40 italic">Infraestructura resiliente lista para producción.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:border-primary/30 transition-all">
                        <p className="text-primary font-black uppercase text-[10px] tracking-widest mb-2">JSON Nativo</p>
                        <p className="text-sm font-medium text-white/40 italic">Sin formateo basura. Directo a tus variables.</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-8">
                    <button 
                        onClick={() => setIsTutorialOpen(true)}
                        className="px-8 py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-3"
                    >
                        Solicitar API <ArrowRight size={14} />
                    </button>
                    <NavLink 
                        to="/docs"
                        className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3 group"
                    >
                        Ver Documentación <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-zinc-950 rounded-[1.8rem] border border-white/10 overflow-hidden shadow-2xl">
                    {/* Fake Header/Controls */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                        </div>
                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">konvierte-api-v1.js</div>
                        <div className="w-12 h-2 rounded bg-white/5" />
                    </div>
                    
                    {/* Code Content */}
                    <div className="p-8 font-mono text-sm leading-relaxed">
                        <div className="flex gap-4 mb-2">
                            <span className="text-white/20 select-none">1</span>
                            <span className="text-purple-400">async</span> <span className="text-blue-400">function</span> <span className="text-yellow-400">getRates</span>() &#123;
                        </div>
                        <div className="flex gap-4 mb-2">
                            <span className="text-white/20 select-none">2</span>
                            <span className="text-white/40 ml-4">&nbsp;&nbsp;const response = <span className="text-purple-400">await</span> fetch(</span>
                        </div>
                        <div className="flex gap-4 mb-2">
                            <span className="text-green-400 ml-4">&nbsp;&nbsp;&nbsp;&nbsp;'https://konvierte.vercel.app/api/rates'</span>
                        </div>
                        <div className="flex gap-4 mb-2">
                            <span className="text-white/20 select-none">4</span>
                            <span className="text-white/40 ml-4">&nbsp;&nbsp;);</span>
                        </div>
                        <div className="flex gap-4 mb-2">
                            <span className="text-white/20 select-none">5</span>
                            <span className="text-white/40 ml-4"></span>
                        </div>
                        <div className="flex gap-4 mb-2">
                            <span className="text-white/20 select-none">6</span>
                            <span className="text-purple-400 ml-4">&nbsp;&nbsp;return</span> <span className="text-white/40">response.</span><span className="text-yellow-400">json</span>();
                        </div>
                        <div className="flex gap-4 mb-2">
                            <span className="text-white/20 select-none">7</span>
                            &#125;
                        </div>
                        
                        {/* Fake Response Box */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 p-4 bg-zinc-900 rounded-xl border border-white/5"
                        >
                            <p className="text-[10px] text-white/20 mb-2 uppercase tracking-widest font-sans">Status: 200 OK</p>
                            <div className="text-[11px] text-green-400/80">
                                <span className="text-white/40">&#123;</span><br/>
                                &nbsp;&nbsp;"bcv": <span className="text-yellow-400">47.06</span>,<br/>
                                &nbsp;&nbsp;"paralelo": <span className="text-yellow-400">54.20</span>,<br/>
                                &nbsp;&nbsp;"last_updated": <span className="text-green-300">"2026-04-06T14:13"</span><br/>
                                <span className="text-white/40">&#125;</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

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
              ¿Listo para simplificar <br className="hidden md:block" /> tus cuentas?
            </h2>

            <p className="text-lg md:text-xl font-medium text-white/40 max-w-2xl mx-auto mb-12">
              Únete a los miles de venezolanos que ya usan Konvierte para gestionar sus pagos y consultar el dólar cada día.
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="px-12 py-6 bg-primary text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
              >
                <Users size={20} />
                Unirme a la lista
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
