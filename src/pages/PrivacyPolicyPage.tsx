import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, ExternalLink, CheckCircle, Megaphone } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
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
              <Shield size={32} className="text-primary" />
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tighter leading-tight italic"
            >
              Política de <span className="text-primary italic">Privacidad</span>
            </motion.h1>
            <p className="text-sm opacity-50 font-medium">
              Última actualización: 21 de julio de 2026
            </p>
          </div>

          {/* Legal Text */}
          <div className="space-y-10 text-sm md:text-base font-medium leading-relaxed opacity-80 bg-surface/20 border border-border p-8 md:p-12 rounded-[2.5rem] backdrop-blur-xl">
            <p className="text-base md:text-lg opacity-90 border-b border-border pb-6">
              En <strong>Konvierte</strong>, accesible desde la aplicación móvil Konvierte, una de nuestras principales prioridades es la privacidad de nuestros usuarios. Este documento de Política de Privacidad contiene los tipos de información que se recopilan y registran en Konvierte y cómo los utilizamos.
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                <Eye size={20} /> 1. Información que Recopilamos
              </h2>
              <p>
                Nuestra aplicación <strong>Konvierte</strong> no requiere que los usuarios se registren ni proporcionen datos personales de identificación (como nombre completo, dirección física o número de teléfono) para su funcionamiento básico.
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Datos de Red y Conectividad:</strong> La aplicación utiliza acceso a internet para consultar los tipos de cambio de divisas en tiempo real.
                </li>
                <li>
                  <strong>Preferencias Locales:</strong> Guardamos configuraciones simples de forma local en tu dispositivo (como tus monedas favoritas o el historial de conversiones recientes) para mejorar la experiencia del usuario. Esta información no se sube a servidores externos.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                <Megaphone size={20} /> 2. Anuncios (Google AdMob)
              </h2>
              <p>
                Konvierte puede mostrar anuncios proporcionados por Google AdMob. Google AdMob puede utilizar identificadores de dispositivos y cookies para personalizar los anuncios y analizar el rendimiento del tráfico de anuncios. Puedes gestionar las preferencias de personalización en la configuración de Google de tu dispositivo Android.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                <ExternalLink size={20} /> 3. Enlaces a Sitios de Terceros
              </h2>
              <p>
                Nuestra aplicación puede contener enlaces a otros sitios o servicios de terceros. Si haces clic en un enlace de un tercero, serás redirigido a ese sitio. Te recomendamos revisar la política de privacidad de cada sitio que visites.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                <CheckCircle size={20} /> 4. Consentimiento
              </h2>
              <p>
                Al utilizar nuestra aplicación, aceptas nuestra Política de Privacidad y sus términos.
              </p>
            </div>

            <div className="pt-6 border-t border-border space-y-4">
              <p className="text-sm opacity-90">
                Si tienes alguna pregunta o sugerencia sobre nuestra Política de Privacidad, no dudes en contactarnos a través del correo de soporte proporcionado en la Google Play Store.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 pt-4">
                <p className="text-xs">
                  © {new Date().getFullYear()} Konvierte. Todos los derechos reservados.
                </p>
                <p className="text-xs font-mono">
                  Soporte: Correo en Google Play Store
                </p>
              </div>
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

export default PrivacyPolicyPage;
