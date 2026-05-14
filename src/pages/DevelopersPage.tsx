// Updated DevelopersPage
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const DevelopersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-main selection:bg-primary/30 overflow-x-hidden relative">
      <div className="absolute inset-0 mesh-gradient opacity-60 pointer-events-none" />
      
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-lg border border-border overflow-hidden">
              <svg width="24" height="24" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M38 32V96M38 64 L74 32M56 64L88 96" stroke="#10B981" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="85" cy="64" r="18" fill="var(--surface-color)" stroke="#10B981" strokeWidth="6" />
              </svg>
            </div>
            <span className="text-lg font-black uppercase tracking-[0.2em]">Konvierte</span>
          </NavLink>
          <NavLink to="/" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2">
            <ArrowLeft size={14} /> Volver
          </NavLink>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                  <Monitor size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Developer Access</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight italic">
                Una API pensada <br/> por <span className="text-primary italic">Developers</span>
              </h1>
              
              <p className="text-lg font-medium text-white/50 leading-relaxed max-w-xl">
                  Sabemos lo difícil que es encontrar una fuente de datos estable para tasas en Venezuela. Konvierte API ofrece JSON limpio, alta disponibilidad y documentación real.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                      { route: '/docs/api/rates', label: 'Global Rates' },
                      { route: '/docs/api/history', label: 'Historical' },
                      { route: '/docs/api/banks', label: 'Bank Directory' },
                      { route: '/docs/api/usdt', label: 'USDT P2P' }
                  ].map(ep => (
                      <div 
                          key={ep.route} 
                          className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl group/ep hover:border-primary/20 transition-all cursor-pointer"
                      >
                          <span className="text-[7px] font-black uppercase tracking-tighter bg-primary/20 text-primary px-2 py-0.5 rounded-md">GET</span>
                          <div className="flex flex-col">
                              <span className="text-[9px] font-mono opacity-30 group-hover/ep:opacity-100 transition-opacity">{ep.route}</span>
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-20">{ep.label}</span>
                          </div>
                      </div>
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
                  <NavLink 
                      to="/docs"
                      className="px-8 py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-3"
                  >
                      Ver Documentación <ArrowRight size={14} />
                  </NavLink>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-zinc-950 rounded-[1.8rem] border border-white/10 overflow-hidden shadow-2xl">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                      <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/20" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                          <div className="w-3 h-3 rounded-full bg-green-500/20" />
                      </div>
                      <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">konvierte-api-v1.js</div>
                  </div>
                  
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
                          <span className="text-purple-400 ml-4">&nbsp;&nbsp;return</span> <span className="text-white/40">response.</span><span className="text-yellow-400">json</span>();
                      </div>
                      <div className="flex gap-4 mb-2">
                          <span className="text-white/20 select-none">6</span>
                          &#125;
                      </div>
                      
                      <div className="mt-8 p-4 bg-zinc-900 rounded-xl border border-white/5">
                          <p className="text-[10px] text-white/20 mb-2 uppercase tracking-widest font-sans">Status: 200 OK</p>
                          <div className="text-[11px] text-green-400/80">
                              <span className="text-white/40">&#123;</span><br/>
                              &nbsp;&nbsp;"bcv": <span className="text-yellow-400">47.06</span>,<br/>
                              &nbsp;&nbsp;"paralelo": <span className="text-yellow-400">54.20</span>,<br/>
                              &nbsp;&nbsp;"last_updated": <span className="text-green-300">"2026-04-06T14:13"</span><br/>
                              <span className="text-white/40">&#125;</span>
                          </div>
                      </div>
                  </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold opacity-20 text-main uppercase tracking-[0.5em]">
            &copy; {new Date().getFullYear()} Konvierte Digital
          </p>
      </footer>
    </div>
  );
};

export default DevelopersPage;
