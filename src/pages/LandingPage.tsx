import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Smartphone, Zap, Shield, ExternalLink, Sun, Moon, Users, Download, CheckCircle, Star, Lock, Clock, Award } from 'lucide-react';
import { NavLink, useSearchParams } from 'react-router-dom';

import { getDownloadCount, registerDownload } from '../services/downloadService';
import { PostDownloadModal } from '../components/PostDownloadModal';

interface LandingPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ theme, setTheme }) => {
  const [searchParams] = useSearchParams();
  const [downloadCount, setDownloadCount] = useState<number>(847);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [isPostDownloadOpen, setIsPostDownloadOpen] = useState(false);

  const APK_URL = '/releases/Konvierte.apk';
  const APK_VERSION = '1.2.0';


  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const total = await registerDownload(APK_VERSION);
      setDownloadCount(total);
      // Iniciar descarga real
      const link = document.createElement('a');
      link.href = APK_URL;
      link.download = `Konvierte-v${APK_VERSION}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 4000);
      // Abrir modal post-descarga con un pequeño delay para que el usuario vea que inició
      setTimeout(() => setIsPostDownloadOpen(true), 1200);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const loadDownloads = async () => {
      const count = await getDownloadCount();
      setDownloadCount(count);
    };
    loadDownloads();
  }, []);



  return (
    <>
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
            </NavLink>            <div className="hidden md:flex items-center gap-8">
              <NavLink to="/features" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Características</NavLink>
              <NavLink to="/developers" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Desarrolladores</NavLink>
              <a href="#team" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Equipo</a>
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                <Download size={14} /> Descargar
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
                onClick={handleDownload}
                className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-1.5"
              >
                <Download size={13} /> Descargar
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative pt-40 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] -z-10 rounded-full" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 blur-[120px] -z-10 rounded-full" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 text-center lg:text-left"
            >
              <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary/15 border border-primary/40 text-primary rounded-full">
                  <span className="w-2 h-2 bg-primary animate-pulse rounded-full" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Konvierte App · Android</span>
                </div>
              </div>

              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-main">
                Controla tus <br />divisas <span className="text-primary italic">fácil.</span>
              </h1>

              <p className="text-xl md:text-2xl font-medium opacity-60 text-main max-w-xl mx-auto lg:mx-0 leading-relaxed">
                La herramienta definitiva para gestionar tus finanzas en Venezuela. Tasas en tiempo real, presupuestos y reportes profesionales en una sola app.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="px-12 py-6 rounded-[2rem] text-base font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-[0_20px_50px_rgba(16,185,129,0.35)] flex items-center justify-center gap-3 relative overflow-hidden group/hero disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/hero:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                  {downloadDone ? <><CheckCircle size={20} /> ¡Descarga iniciada!</> : isDownloading ? <><Download size={20} className="animate-bounce" /> Preparando...</> : <><Download size={20} /> Descargar APK Gratis</>}
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-40">
                <div className="text-center">
                  <p className="text-2xl font-black">{downloadCount.toLocaleString()}+</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Descargas</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-black">~38 MB</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Tamaño APK</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-[3.5rem] blur-2xl opacity-50" />
                <div className="relative z-10 w-[300px] md:w-[350px] rounded-[3rem] border-[12px] border-zinc-900 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden aspect-[9/19.5] bg-zinc-950">
                  <img
                    src="/screenshots/Calculadora Konvierte.jpeg"
                    alt="App Interface"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000";
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Mini Features Summary */}
        <section className="py-24 px-6 border-y border-white/5 bg-surface/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-4 max-w-md">
              <h2 className="text-3xl font-black tracking-tight">Mucho más que <br /><span className="text-primary italic">solo tasas.</span></h2>
              <p className="text-white/40 font-medium">Descubre todas las herramientas que hemos construido para simplificar tu día a día financiero.</p>
              <NavLink to="/features" className="inline-flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest hover:gap-3 transition-all">
                Ver todas las funciones <ArrowRight size={14} />
              </NavLink>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {[
                { icon: Smartphone, label: 'Widget Android' },
                { icon: Shield, label: '100% Privado' },
                { icon: Zap, label: 'Tasas en Vivo' },
                { icon: ExternalLink, label: 'Reportes PDF' },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4">
                  <item.icon size={20} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition Simplified */}
        <section className="py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest">Mobile First</h3>
                <p className="text-sm font-bold text-white/40 leading-relaxed">Optimizada para la mejor experiencia móvil nativa.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest">Real Time</h3>
                <p className="text-sm font-bold text-white/40 leading-relaxed">Tasas actualizadas automáticamente desde fuentes oficiales.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <ExternalLink size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest">Multilink</h3>
                <p className="text-sm font-bold text-white/40 leading-relaxed">Comparte reportes y tasas directamente a tus apps.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest">Sin Registro</h3>
                <p className="text-sm font-bold text-white/40 leading-relaxed">Usa todas las funciones sin necesidad de dejar tus datos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* APK Download Section */}
        <section id="download" className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 blur-[200px] rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
                <Smartphone size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">App Nativa para Android</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-6">
                Descarga la app,<br /><span className="text-primary italic">sin rodeos.</span>
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                APK directa, sin Play Store, sin rastreos. Solo Konvierte funcionando en tu bolsillo.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-5"
              >
                {[
                  { icon: Shield, color: 'text-primary', bg: 'bg-primary/10 border-primary/20', title: '100% Libre de virus', desc: 'Compilada directamente desde nuestro código fuente abierto. Sin modificaciones, sin malware.' },
                  { icon: Lock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'Sin permisos invasivos', desc: 'No pedimos acceso a tu cámara, contactos ni ubicación. Solo lo que necesitas para calcular.' },
                  { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', title: 'Funciona sin internet', desc: 'Las conversiones básicas funcionan offline. Las tasas se sincronizan cuando tienes conexión.' },
                  { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', title: 'Actualizaciones frecuentes', desc: 'El equipo lanza mejoras constantemente. Cada versión nueva está en esta misma página.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-start gap-4 p-4 rounded-2xl border ${item.bg} group hover:scale-[1.01] transition-transform`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                      <item.icon size={18} className={item.color} />
                    </div>
                    <div>
                      <p className={`text-sm font-black ${item.color} mb-1`}>{item.title}</p>
                      <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Download Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent rounded-[2.5rem] blur-lg" />
                <div className="relative glass-card p-8 md:p-10 rounded-[2rem] border-primary/20 space-y-8">

                  {/* App Info */}
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 flex-shrink-0">
                      <svg width="32" height="32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M38 32V96M38 64 L74 32M56 64L88 96" stroke="#10B981" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="85" cy="64" r="18" fill="transparent" stroke="#10B981" strokeWidth="6" />
                        <path d="M78 58C80 54 83 53 85 53C88 53 91 54 93 58L97 54M92 70C90 74 87 75 85 75C82 75 79 74 77 70L73 74" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-widest">Konvierte</h3>
                      <p className="text-xs text-white/40 font-bold uppercase tracking-wider">v{APK_VERSION} · Android 6.0+</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={10} className="fill-yellow-400 text-yellow-400" />)}
                        <span className="text-[10px] text-white/40 ml-1">5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: `${downloadCount.toLocaleString()}+`, label: 'Descargas' },
                      { value: '~38 MB', label: 'Tamaño' },
                      { value: 'Gratis', label: 'Precio' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                        <p className="text-base font-black text-primary">{stat.value}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Checkmarks */}
                  <div className="space-y-2">
                    {['Sin cuenta requerida', 'Sin publicidad intrusiva', 'Datos 100% locales', 'Código abierto'].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle size={14} className="text-primary flex-shrink-0" />
                        <span className="text-xs font-bold text-white/60">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 relative overflow-hidden group/dl"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 20px 50px rgba(16,185,129,0.35)' }}
                  >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/dl:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                    <AnimatePresence mode="wait">
                      {downloadDone ? (
                        <motion.span key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                          <CheckCircle size={18} /> ¡Descarga iniciada!
                        </motion.span>
                      ) : isDownloading ? (
                        <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                            <Download size={18} />
                          </motion.div>
                          Preparando...
                        </motion.span>
                      ) : (
                        <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <Download size={18} /> Descargar APK Gratis
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  {/* Safety note */}
                  <p className="text-center text-[10px] text-white/25 leading-relaxed">
                    Al instalar, activa <span className="text-white/50 font-bold">"Fuentes desconocidas"</span> en Ajustes de tu Android.<br />
                    Es normal para APKs externas al Play Store.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* FAQ mini */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {[
                { q: '¿Por qué no está en Play Store?', a: 'Google cobra tarifas y restringe apps venezolanas. Distribuimos directamente para llegar a más usuarios.' },
                { q: '¿Cómo sé que es segura?', a: 'Nuestro código es público en GitHub. Puedes verificar que la APK es idéntica a lo que compilamos.' },
                { q: '¿Qué hago si Android la bloquea?', a: 'Ve a Ajustes → Seguridad → Fuentes desconocidas y actívala. Es un paso estándar para APKs externas.' },
              ].map((faq, i) => (
                <div key={i} className="p-5 bg-white/3 border border-white/8 rounded-2xl space-y-2 hover:border-primary/20 transition-colors">
                  <p className="text-xs font-black text-white/70">{faq.q}</p>
                  <p className="text-[11px] text-white/35 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
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
            <div className="flex justify-center items-center">
              <button
                onClick={handleDownload}
                className="px-16 py-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.25em] hover:opacity-90 transition-all active:scale-95 shadow-2xl shadow-primary/30 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
              >
                <Download size={20} /> Descargar App Gratis
              </button>
            </div>
          </motion.div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/5 blur-[180px] -z-10 rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
                <Users size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">El Equipo</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-6">
                Quiénes somos<br />
                <span className="text-primary italic">detrás de Konvierte</span>
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
                Dos estudiantes venezolanos de Ingeniería en Sistemas que construyeron la herramienta financiera que ellos mismos necesitaban.
              </p>
            </motion.div>

            {/* Team Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {[
                {
                  name: 'Rúbel Maneiro',
                  handle: 'rmaneiro28',
                  role: 'Full-Stack Developer',
                  bio: 'Estudiante de Ingeniería en Sistemas, 10mo semestre. Arquitecto principal de Konvierte: backend, API, sync de tasas y lógica financiera.',
                  avatar: 'https://avatars.githubusercontent.com/u/72143708?v=4',
                  blog: 'https://rmaneiro.vercel.app/',
                  github: 'https://github.com/rmaneiro28',
                  repos: 31,
                  location: 'Venezuela',
                  accent: 'primary',
                  accentColor: '#10B981',
                  tags: ['Flutter', 'React', 'TypeScript', 'Supabase'],
                },
                {
                  name: 'Sneider Araque',
                  handle: 'Sneider22',
                  role: 'Frontend & Mobile Developer',
                  bio: 'Estudiante de Ingeniería en Sistemas. Especialista en UI/UX y desarrollo mobile. Co-creador de la experiencia de usuario de Konvierte.',
                  avatar: 'https://avatars.githubusercontent.com/u/126375669?v=4',
                  blog: null,
                  github: 'https://github.com/sneider22',
                  repos: 18,
                  location: 'Venezuela',
                  accent: 'blue',
                  accentColor: '#3B82F6',
                  tags: ['Flutter', 'React', 'Dart', 'UI/UX'],
                },
              ].map((member, i) => (
                <motion.div
                  key={member.handle}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative group"
                >
                  {/* Glow */}
                  <div
                    className="absolute -inset-1 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"
                    style={{ background: `radial-gradient(ellipse, ${member.accentColor}40, transparent 70%)` }}
                  />

                  <div className="relative glass-card p-8 rounded-[2rem] border-white/10 group-hover:border-white/20 transition-all duration-500 flex flex-col gap-6 h-full">
                    {/* Avatar + Identity */}
                    <div className="flex items-start gap-5">
                      <div className="relative flex-shrink-0">
                        <div
                          className="absolute -inset-1 rounded-full blur-md opacity-50"
                          style={{ background: `radial-gradient(circle, ${member.accentColor}60, transparent)` }}
                        />
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="relative w-16 h-16 rounded-full object-cover border-2 ring-2 ring-offset-2 ring-offset-transparent"
                          style={{ borderColor: member.accentColor + '60', outlineColor: member.accentColor + '40' }}
                        />
                        {/* Online dot */}
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background animate-pulse"
                          style={{ backgroundColor: member.accentColor }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black tracking-tight text-main">{member.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">@{member.handle}</p>
                        <span
                          className="inline-block mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                          style={{ background: member.accentColor + '20', color: member.accentColor }}
                        >
                          {member.role}
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-white/50 leading-relaxed flex-1">{member.bio}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {member.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/8 text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats + Links */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1 text-[10px] text-white/30 font-bold">
                        <span style={{ color: member.accentColor }} className="font-black text-sm">{member.repos}</span>
                        &nbsp;repos públicos · 🇻🇪 {member.location}
                      </div>
                      <div className="flex items-center gap-2">
                        {member.blog && (
                          <a
                            href={member.blog}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            aria-label={`Portfolio de ${member.name}`}
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-black font-black text-[10px] hover:scale-105 transition-transform"
                          style={{ backgroundColor: member.accentColor }}
                          aria-label={`GitHub de ${member.name}`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center text-[11px] text-white/20 uppercase tracking-[0.3em] font-bold mt-16"
            >
              Construido con ❤️ en Venezuela · Open Source
            </motion.p>
          </div>
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

    <PostDownloadModal
      isOpen={isPostDownloadOpen}
      onClose={() => setIsPostDownloadOpen(false)}
      downloadCount={downloadCount}
    />
    </>
  );
};

export default LandingPage;
