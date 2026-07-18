import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Share2, Smartphone, Zap, History, Bell, CheckCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: <CreditCard size={24} className="text-primary" />,
      title: "Presupuestos Pro",
      description: "Crea presupuestos en múltiples divisas con conversión automática y exportación a PDF profesional. Ideal para freelances y negocios."
    },
    {
      icon: <Share2 size={24} className="text-primary" />,
      title: "PDFs con Marca",
      description: "Personaliza tus reportes con tu logo, redes sociales y códigos QR de Pago Móvil integrados. Da una imagen profesional."
    },
    {
      icon: <Smartphone size={24} className="text-primary" />,
      title: "Widgets & Accesos",
      description: "Consulta las tasas y accede a tus herramientas favoritas directamente desde tu pantalla de inicio en Android."
    },
    {
      icon: <Zap size={24} className="text-primary" />,
      title: "Tasa del Mañana",
      description: "Sé el primero en saber la tasa oficial del día siguiente. Visualización anticipada apenas se publica por el BCV."
    },
    {
      icon: <History size={24} className="text-primary" />,
      title: "Historial & Gráficos",
      description: "Analiza la evolución del dólar con nuestro historial interactivo y gráficos de tendencia en tiempo real."
    },
    {
      icon: <Bell size={24} className="text-primary" />,
      title: "Directorio Bancario",
      description: "Información actualizada de toda la banca nacional con logos oficiales para tus transacciones sin errores."
    }
  ];

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

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-6"
            >
              Potencia tus finanzas con <br />
              <span className="text-primary italic">herramientas únicas.</span>
            </motion.h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Diseñamos Konvierte para ser más que una simple calculadora. Cada función está pensada para el contexto venezolano.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-surface/30 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] hover:bg-surface/50 transition-all group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-main mb-4">{feature.title}</h3>
                <p className="text-sm font-bold text-main/50 leading-relaxed mb-6">{feature.description}</p>
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Incluido en la App</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-24 p-12 bg-gradient-to-br from-primary/10 to-transparent rounded-[3rem] border border-primary/20 text-center">
            <h2 className="text-3xl font-black mb-6">¿Ves algo que te gusta?</h2>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">Todas estas funcionalidades están disponibles de forma gratuita y sin registro en nuestra aplicación para Android.</p>
            <NavLink 
                to="/#download"
                className="inline-flex px-10 py-5 bg-primary text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 items-center gap-3"
            >
                Descargar Ahora
            </NavLink>
          </div>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-white/5 text-center bg-surface/5 backdrop-blur-md">
          <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-6">
            <NavLink to="/terms" className="hover:text-primary transition-colors">Términos</NavLink>
            <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacidad</NavLink>
          </div>
          <p className="text-[10px] font-bold opacity-20 text-main uppercase tracking-[0.5em]">
            &copy; {new Date().getFullYear()} Konvierte Digital
          </p>
      </footer>
    </div>
  );
};

export default FeaturesPage;
