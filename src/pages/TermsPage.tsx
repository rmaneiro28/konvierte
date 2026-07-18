import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, FileText, HelpCircle, Landmark } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-main selection:bg-primary/30 overflow-x-hidden relative">
      {/* Background Glows */}
      <div className="absolute inset-0 mesh-gradient opacity-60 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border h-20 flex items-center">
        <div className="max-w-4xl mx-auto px-6 w-full flex items-center justify-between">
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

      {/* Content */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <Scale size={32} className="text-primary" />
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tighter leading-tight italic"
            >
              Términos de <span className="text-primary italic">Uso y Condiciones</span>
            </motion.h1>
            <p className="text-sm opacity-50 font-medium">
              Última actualización: 17 de Julio de 2026
            </p>
          </div>

          {/* Legal Text */}
          <div className="space-y-10 text-sm md:text-base font-medium leading-relaxed opacity-80 bg-surface/20 border border-border p-8 md:p-12 rounded-[2.5rem] backdrop-blur-xl">
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                <FileText size={20} /> 1. Aceptación de los Términos
              </h2>
              <p>
                Al acceder y utilizar la aplicación móvil o el sitio web de <strong>Konvierte</strong>, aceptas cumplir con los términos y condiciones estipulados en este documento. Si no estás de acuerdo con alguno de ellos, debes abstenerte de utilizar nuestros servicios inmediatamente.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                <Landmark size={20} /> 2. Origen de las Tasas e Información Financiera
              </h2>
              <p>
                <strong>Konvierte es una herramienta informativa y de cálculo matemático</strong>. Los tipos de cambio e información que se muestran se recopilan automáticamente de las siguientes fuentes:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Tasa Oficial de Divisas (USD y EUR):</strong> Sincronizada directamente a partir de las publicaciones oficiales y públicas realizadas por el <strong>Banco Central de Venezuela (BCV)</strong> en su sitio web. Esta información es de libre acceso público.
                </li>
                <li>
                  <strong>Tasa Cripto / Dólar P2P (USDT):</strong> Calculada y ponderada estadísticamente mediante el análisis de ofertas de mercado abierto en la plataforma global de <strong>Binance P2P</strong> para el par USDT/VES.
                </li>
              </ul>
              <p className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-xs text-primary font-bold">
                ⚠️ IMPORTANTE: Konvierte no altera ni determina el valor del tipo de cambio. Los datos se muestran en tiempo real tal como son provistos por las fuentes externas mencionadas. No nos hacemos responsables de posibles retrasos o discrepancias temporales en la sincronización de las fuentes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                <HelpCircle size={20} /> 3. Naturaleza del Servicio y Descargo de Responsabilidad
              </h2>
              <p>
                Konvierte <strong>no es un operador cambiario, casa de cambio, institución bancaria ni entidad financiera</strong>. 
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La aplicación no procesa pagos, transferencias, remesas ni operaciones cambiarias de divisas o bolívares.</li>
                <li>Cualquier transacción comercial o cambiaria realizada entre usuarios o comercios basándose en los resultados aritméticos de la calculadora de Konvierte es responsabilidad exclusiva de las partes involucradas.</li>
                <li>Los presupuestos, facturas provisionales o fichas de pago móvil generados a través de la aplicación son plantillas puramente informativas y no constituyen un documento fiscal oficial.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                4. Propiedad Intelectual
              </h2>
              <p>
                Todo el código fuente del proyecto, logotipos, interfaces, y elementos de diseño web y móvil son propiedad del equipo de desarrollo de Konvierte Digital y están protegidos por leyes de propiedad intelectual. El proyecto cuenta con componentes de código abierto con licencia respectiva disponible en nuestros repositorios oficiales en GitHub.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                5. Limitación de Responsabilidad
              </h2>
              <p>
                En ningún caso el equipo de desarrollo de Konvierte será responsable por pérdidas económicas, malas interpretaciones en transacciones comerciales o fallas técnicas del dispositivo al usar la aplicación. La herramienta se ofrece "tal cual" y sin garantías explícitas de comerciabilidad.
              </p>
            </div>

            <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
              <p className="text-xs">
                © {new Date().getFullYear()} Konvierte Digital. Todos los derechos reservados.
              </p>
              <p className="text-xs font-mono">
                Contacto Legal: rmaneiro28@gmail.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border text-center opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em]">
          Konvierte Digital · Hecho en Venezuela
        </p>
      </footer>
    </div>
  );
};

export default TermsPage;
