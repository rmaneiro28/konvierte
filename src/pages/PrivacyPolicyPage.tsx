import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, RefreshCw } from 'lucide-react';
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
              Última actualización: 17 de Julio de 2026
            </p>
          </div>

          {/* Legal Text */}
          <div className="space-y-10 text-sm md:text-base font-medium leading-relaxed opacity-80 bg-surface/20 border border-border p-8 md:p-12 rounded-[2.5rem] backdrop-blur-xl">
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                <Eye size={20} /> 1. Transparencia y Privacidad
              </h2>
              <p>
                En <strong>Konvierte</strong> nos tomamos la privacidad del usuario con absoluta seriedad. Esta Política de Privacidad describe cómo se gestiona y protege la información en nuestra aplicación móvil y sitio web oficial. Al utilizar nuestros servicios, aceptas las prácticas descritas en este documento.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                <Lock size={20} /> 2. Recopilación de Datos
              </h2>
              <p>
                <strong>Konvierte no recopila, almacena, comparte ni vende ningún tipo de información personal</strong>. 
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Sin Registro:</strong> No requerimos la creación de cuentas de usuario, correos electrónicos, contraseñas ni perfiles para usar la calculadora de divisas y presupuestos.</li>
                <li><strong>Almacenamiento Local:</strong> Toda la información ingresada por el usuario (como presupuestos, fichas de pago móvil o ajustes personales) se almacena de forma local y exclusiva en el almacenamiento interno de tu dispositivo móvil a través de tecnologías de bases de datos seguras (como SQLite o Preferences locales).</li>
                <li><strong>Cero Transmisiones Financieras:</strong> No tenemos acceso a tus cuentas bancarias, credenciales de pago ni información financiera. Las fichas de pago generadas son plantillas de texto e imágenes locales creadas exclusivamente para facilitar tus operaciones de pago móvil del día a día.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                <RefreshCw size={20} /> 3. Permisos Requeridos por la Aplicación
              </h2>
              <p>
                Nuestra aplicación solicita permisos mínimos para garantizar un correcto funcionamiento técnico:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acceso a Internet (INTERNET):</strong> Utilizado exclusivamente para sincronizar periódicamente las tasas de cambio de divisas oficiales (BCV) y promedios cripto (Binance P2P) a través de nuestra API pública.</li>
                <li><strong>Almacenamiento (WRITE_EXTERNAL_STORAGE):</strong> Utilizado bajo la autorización expresa del usuario al exportar presupuestos en formato de archivos PDF o compartir fichas de pago de forma externa.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                4. Cookies y Análisis en la Web
              </h2>
              <p>
                Nuestro sitio web puede utilizar cookies técnicas necesarias para mantener preferencias básicas de la interfaz (como la selección de tema claro/oscuro). No utilizamos rastreadores invasivos de comportamiento ni tecnologías de segmentación comercial.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
                5. Cambios a esta Política
              </h2>
              <p>
                Nos reservamos el derecho de modificar esta política en cualquier momento para adaptarla a futuras actualizaciones de la aplicación o requerimientos de las tiendas de aplicaciones (como Google Play Store). Se aconseja revisar esta página frecuentemente para constatar el compromiso inalterable de Konvierte con la privacidad total de sus usuarios.
              </p>
            </div>

            <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
              <p className="text-xs">
                © {new Date().getFullYear()} Konvierte Digital. Todos los derechos reservados.
              </p>
              <p className="text-xs font-mono">
                Soporte: rmaneiro28@gmail.com
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

export default PrivacyPolicyPage;
