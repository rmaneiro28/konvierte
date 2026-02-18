import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRightLeft,
  Moon, Sun, Trash2, Settings2, X, Share2,
  Image as ImageIcon, Type, Delete, RotateCw, Calculator,
  GripVertical, Star
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useCalculator } from './hooks/useCalculator';
import { useRatesManager } from './hooks/useRatesManager';
import { formatCurrency } from './utils/formatters';
import { SVG_FLAGS } from './assets/flags';

// --- Componentes UI Auxiliares ---

const Flag = React.memo(({ code, className = "w-4 h-4" }: { code: string; className?: string }) => {
  const [error, setError] = useState(false);
  const flagCode = code.toLowerCase();

  // Mapeo simple de códigos a los nombres de FlagCDN
  const flagUrl = `https://flagcdn.com/${flagCode === 'us' ? 'us' : flagCode === 've' ? 've' : flagCode === 'eu' ? 'eu' : 'un'}.svg`;

  return (
    <div className={`${className} rounded-full overflow-hidden flex-shrink-0 bg-white/10 border border-white/10 flex items-center justify-center relative`}>
      {!error ? (
        <img
          src={flagUrl}
          alt={code}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        SVG_FLAGS[flagCode] || (
          <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[8px] font-black uppercase tracking-tighter">?</div>
        )
      )}
    </div>
  );
});
Flag.displayName = "Flag";

// Componente de item de tasa extraído para memoización
const RateItem = React.memo(({
  id,
  data,
  isDefault,
  onToggleDefault,
  onRemove,
  isCustom
}: {
  id: string,
  data: any,
  isDefault: boolean,
  onToggleDefault: (id: string) => void,
  onRemove: (id: string) => void,
  isCustom: boolean
}) => (
  <Reorder.Item
    key={id}
    value={id}
    className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between group cursor-grab active:cursor-grabbing border border-transparent hover:border-primary/10 transition-colors"
  >
    <div className="flex items-center gap-3 flex-1">
      <GripVertical size={14} className="opacity-50 group-hover:opacity-100" />
      <Flag code={data.flag} />
      <div className="overflow-hidden">
        <p className="text-[11px] font-black uppercase truncate">{data.name}</p>
        <p className="text-[8px] opacity-80 font-bold uppercase tracking-tighter">
          {isCustom ? 'Personalizada' : 'Sistema'}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => { e.stopPropagation(); onToggleDefault(id); }}
        aria-label={isDefault ? "Desmarcar favorita" : "Marcar como favorita"}
        className={`p-2 rounded-lg transition-colors ${isDefault ? 'text-yellow-500 bg-yellow-500/10' : 'text-primary hover:text-yellow-500 hover:bg-yellow-500/5'}`}
        title={isDefault ? "Tasa por defecto" : "Marcar como favorita"}
      >
        <Star size={14} fill={isDefault ? "currentColor" : "none"} />
      </button>
      {isCustom && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(id); }}
          aria-label="Eliminar tasa personalizada"
          className="p-2 text-red-600 dark:text-red-400 font-bold hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  </Reorder.Item>
));
RateItem.displayName = "RateItem";

// Carga perezosa del componente pesado de Ajustes
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));

function App() {
  const screenshotRef = useRef<HTMLDivElement>(null);
  const shareTemplateRef = useRef<HTMLDivElement>(null);

  // --- Theme State ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('konvierte_theme');
      if (saved === 'light' || saved === 'dark') return saved;

      // Fallback a preferencia del sistema si no hay guardada
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch (e) { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('konvierte_theme', theme);
  }, [theme]);

  // --- Hooks de Lógica ---
  const {
    rates, activeSource, setActiveSource, allRates,
    loadRates, addCustomRate, removeCustomRate,
    ratesOrder, updateOrder, defaultRateId, toggleDefault
  } = useRatesManager();

  const activeRateValue = allRates[activeSource]?.price || 0;

  const {
    inputUSD, inputVES,
    focusedInput, setFocusedInput, lastEdited,
    onKeyPress, handleInputFocus, handleReset: calculatorReset,
    handleSwapCurrencies, updateCalculation, isInverse
  } = useCalculator(activeRateValue);

  // --- Estados de UI locales ---
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [newRateName, setNewRateName] = useState('');
  const [newRateFormula, setNewRateFormula] = useState('');
  const [previewRateValue, setPreviewRateValue] = useState(0);

  // --- Refs para Scroll ---
  const usdInputRef = useRef<HTMLButtonElement>(null);
  const vesInputRef = useRef<HTMLButtonElement>(null);

  // Sincronizar monto inicial VES cuando se cargan las tasas
  useEffect(() => {
    if (rates.bcv_usd?.price && inputUSD === '1' && inputVES === '') {
      updateCalculation('1', 'USD', activeRateValue);
    }
  }, [rates.bcv_usd, activeSource, activeRateValue, updateCalculation, inputUSD, inputVES]);

  // --- Handlers específicos de UI ---
  const handleReset = () => {
    calculatorReset();
    toast.info('Montos restaurados');
  };

  const selectRate = (id: string) => {
    setActiveSource(id);
    const rate = allRates[id]?.price || 0;
    const source = lastEdited;
    const val = lastEdited === 'USD' ? inputUSD : inputVES;
    updateCalculation(val, source, rate);
  };

  // --- Lógica de Compartir ---
  const shareAsText = async () => {
    try {
      const text = `📊 *Konvierte - Reporte*\n\n` +
        `💵 ${inputUSD} USD = ${inputVES} VES\n` +
        `📈 Ref: ${allRates[activeSource]?.name} @ ${formatCurrency(activeRateValue)}\n\n` +
        `✨ Calculado con Konvierte`;

      if (navigator.share && window.isSecureContext) {
        await navigator.share({ title: 'Konvierte', text });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('Copiado al portapapeles');
        } catch (err) {
          toast.error('Error al copiar');
        }
        document.body.removeChild(textArea);
      }
      setIsShareOpen(false);
    } catch (e) {
      toast.error('Error al compartir');
    }
  };

  const shareAsImage = async () => {
    if (!shareTemplateRef.current) {
      toast.error('Error: Plantilla no lista');
      return;
    }

    setSharing(true);
    toast.info('Generando widget...');

    try {
      await new Promise(r => setTimeout(r, 100));

      // Importación dinámica de html2canvas para optimizar el bundle inicial
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(shareTemplateRef.current, {
        backgroundColor: '#050505',
        scale: 3,
        useCORS: true,
        logging: false,
        width: 500,
        height: 500,
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));

      if (blob && navigator.share && window.isSecureContext) {
        try {
          const file = new File([blob], 'konvierte.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Reporte Konvierte',
              text: `Calculado al cambio: ${formatCurrency(activeRateValue)}`
            });
            toast.success('¡Compartido con éxito!');
          } else {
            throw new Error('Navigator share files not supported');
          }
        } catch (err) {
          const link = document.createElement('a');
          link.download = `konvierte-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          toast.success('Imagen guardada');
        }
      } else {
        const link = document.createElement('a');
        link.download = `konvierte-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.info(window.isSecureContext ? 'Imagen descargada' : 'HTTP detectado: Descargando');
      }
      setIsShareOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Error al generar imagen');
    } finally {
      setSharing(false);
    }
  };

  // --- Previsualización de Fórmula ---
  useEffect(() => {
    const calculatePreview = async () => {
      if (!newRateFormula || newRateFormula.trim() === '') {
        setPreviewRateValue(0);
        return;
      }
      try {
        const base: Record<string, number> = {
          bcv_usd: rates.bcv_usd?.price || 0,
          bcv_eur: rates.bcv_eur?.price || 0,
          binance_usd: rates.binance_usd?.price || 0,
        };
        const { evaluate } = await import('mathjs');
        const result = evaluate(newRateFormula.toLowerCase(), base);
        const price = typeof result === 'number' && isFinite(result) ? result : 0;
        setPreviewRateValue(Math.max(0, price));
      } catch (e) { setPreviewRateValue(0); }
    };
    calculatePreview();
  }, [newRateFormula, rates]);

  // --- Efectos de Teclado y Click Externo ---
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.calculator-input') && !target.closest('.virtual-keyboard')) setFocusedInput(null);
    };
    if (focusedInput) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [focusedInput, setFocusedInput]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusedInput(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setFocusedInput]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedInput) return;
      if (isConfigOpen || isShareOpen) return;

      const key = e.key;
      if (/^[0-9]$/.test(key)) onKeyPress(key);
      else if (key === ',' || key === '.') onKeyPress(',');
      else if (key === 'Backspace') onKeyPress('DELETE');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedInput, isConfigOpen, isShareOpen, onKeyPress]);

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${focusedInput ? 'pb-80' : ''}`}>
      {/* Notificaciones Sonner */}
      <Toaster
        position="top-center"
        expand={false}
        richColors
        theme={theme}
        toastOptions={{
          style: {
            background: 'var(--surface-color)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
            fontFamily: 'Outfit, sans-serif',
            marginTop: '60px'
          }
        }}
      />

      {/* Header Zen Fijo */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border safe-top flex items-center">
        <div className="max-w-2xl mx-auto px-6 w-full h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 bg-surface rounded-xl flex items-center justify-center shadow-lg border border-border overflow-hidden">
              <svg width="22" height="22" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M38 32V96M38 64 L74 32M56 64L88 96" stroke="#10B981" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="85" cy="64" r="18" fill="var(--surface-color)" stroke="#10B981" strokeWidth="6" />
                <path d="M78 58C80 54 83 53 85 53C88 53 91 54 93 58L97 54M92 70C90 74 87 75 85 75C82 75 79 74 77 70L73 74" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] relative">
              Konvierte
              <span className="sr-only"> - Calculadora de Tipo de Cambio en Venezuela</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Cambiar tema" className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setIsShareOpen(true)} aria-label="Compartir" className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center"><Share2 size={16} /></button>
            <button onClick={() => setIsConfigOpen(true)} aria-label="Ajustes" className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center"><Settings2 size={16} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 pt-8 space-y-8">

        <div ref={screenshotRef} data-screenshot-area="true" className="rounded-[2.5rem] bg-transparent p-1">
          {/* Hero: Resalta el resultado opuesto a la entrada (Zen Logic) */}
          <section className={`text-center transition-all duration-500 ${focusedInput ? 'mb-4 py-2' : 'mb-8 py-6'}`}>
            <div className="flex flex-col items-center">
              {(() => {
                const typingValue = focusedInput === 'USD' ? inputUSD : inputVES;

                // Si no hay nada enfocado, mostramos el "Resultado" grande como antes (Zen Logic)
                if (!focusedInput) {
                  const mainValue = lastEdited === 'USD' ? (inputVES || formatCurrency(activeRateValue)) : (inputUSD || '1.00');
                  const isUSDHero = lastEdited === 'VES';
                  const numericValue = parseFloat(mainValue.replace(/\./g, '').replace(',', '.'));
                  const fontSizeClass = numericValue >= 100000 ? 'text-4xl' : numericValue >= 10000 ? 'text-5xl' : 'text-7xl';

                  return (
                    <>
                      <span className="label-zen text-center text-primary !opacity-80 !tracking-[0.6em] mb-4">
                        {lastEdited === 'USD' ? 'Monto Calculado (VES)' : 'Equivalente en Divisa (USD)'}
                      </span>
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-4">
                        <Flag code={isUSDHero ? 'us' : 've'} className="w-12 h-12 border-4 border-surface shadow-2xl" />
                      </motion.div>
                      <motion.span key="hero-static" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${fontSizeClass} font-black tracking-tighter text-primary truncate max-w-full`}>
                        <span className="text-xl font-bold opacity-60 mr-1">{isUSDHero ? '$' : 'Bs.'}</span>
                        {mainValue.split(',')[0] || '0'}
                        <span className="text-2xl opacity-70">,{mainValue.split(',')[1] || '00'}</span>
                      </motion.span>
                    </>
                  );
                }

                // Si está enfocado, mostramos un diseño dual: Entrada y Salida
                return (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 opacity-80 mb-1">
                      <Flag code={focusedInput === 'USD' ? 'us' : 've'} className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Escribiendo {focusedInput}</span>
                    </div>
                    <motion.div key="hero-typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-black text-primary">
                      {focusedInput === 'USD' ? '$' : 'Bs.'} {typingValue || '0'}
                    </motion.div>
                    <div className="w-8 h-px bg-primary/20 my-1" />
                    <div className="flex items-center gap-2 opacity-80 mb-1">
                      <Flag code={focusedInput === 'USD' ? 've' : 'us'} className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Resultado</span>
                    </div>
                    <motion.div key="hero-result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl font-black text-primary">
                      <span className="text-lg opacity-80 mr-1">{focusedInput === 'USD' ? 'Bs.' : '$'}</span>
                      {(focusedInput === 'USD' ? inputVES : inputUSD).split(',')[0] || '0'}
                      <span className="text-xl opacity-90">,{(focusedInput === 'USD' ? inputVES : inputUSD).split(',')[1] || '00'}</span>
                    </motion.div>
                  </div>
                );
              })()}
              {!focusedInput && (
                <div className="mt-4 flex items-center gap-2 opacity-80">
                  <span className="text-[10px] font-black uppercase tracking-widest">{allRates[activeSource]?.name} @ {formatCurrency(activeRateValue)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Botones de Acción (Reset/Actualizar) */}
          <section className="flex justify-center gap-4 mb-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-transparent flex items-center gap-2 text-red-600 dark:text-red-400 font-bold hover:bg-red-500/5 transition-all active:scale-95 group"
              title="Resetear montos"
            >
              <Trash2 size={16} className="opacity-70 group-hover:opacity-100" />
              <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
            </button>
            <button
              onClick={loadRates}
              disabled={rates.loading}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-transparent flex items-center gap-2 text-primary hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-50 group font-bold"
              title="Actualizar tasas"
            >
              <RotateCw size={16} className={`opacity-70 group-hover:opacity-100 ${rates.loading ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">Actualizar</span>
            </button>
          </section>

          {/* Selector de Tasas */}
          <section className="flex gap-3 overflow-x-auto no-scrollbar py-2 mb-6">
            {ratesOrder.map((id) => {
              const data = allRates[id];
              if (!data) return null;
              return (
                <button key={id} onClick={() => selectRate(id)}
                  aria-label={`Seleccionar tasa ${data.name}`}
                  className={`flex-shrink-0 px-5 py-3 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${activeSource === id ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-transparent text-primary dark:text-primary hover:bg-white/10'}`}>
                  <Flag code={data.flag} />
                  <div>
                    <span className={`block text-[8px] font-black uppercase tracking-widest mb-0.5 ${activeSource === id ? 'opacity-90' : 'opacity-80'}`}>{data.name}</span>
                    <span className="text-sm font-black">{formatCurrency(data.price)}</span>
                  </div>
                </button>
              );
            })}
          </section>

          {/* Calculadora Zen (Inputs Secundarios) */}
          <section className={`glass-card p-6 md:p-8 space-y-6 md:space-y-10 border-none shadow-2xl relative overflow-hidden transition-all duration-500 ${focusedInput ? 'pb-10' : ''}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"></div>

            {/* Renderizado dinámico basado en isInverse */}
            {[isInverse ? 'VES' : 'USD', 'SWAP', isInverse ? 'USD' : 'VES'].map((type) => {
              if (type === 'SWAP') {
                return (
                  <div key="swap-btn" className="flex justify-center -my-4 md:-my-6 relative z-10">
                    <button
                      onClick={handleSwapCurrencies}
                      aria-label="Intercambiar divisas"
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface border border-border flex items-center justify-center text-primary hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95 shadow-lg"
                      title="Intercambiar Orden"
                    >
                      <ArrowRightLeft size={focusedInput ? 16 : 20} className="rotate-90 md:rotate-0" />
                    </button>
                  </div>
                );
              }

              const isUSD = type === 'USD';
              const ref = isUSD ? usdInputRef : vesInputRef;
              const value = isUSD ? inputUSD : inputVES;
              const isFocused = focusedInput === type;

              return (
                <button
                  key={type}
                  ref={ref}
                  className={`w-full text-left relative cursor-pointer calculator-input p-4 rounded-3xl transition-all duration-300 ${isFocused ? 'bg-primary/5 ring-1 ring-primary/20 scale-[1.02]' : 'hover:bg-white/5'}`}
                  onClick={() => handleInputFocus(type as 'USD' | 'VES')}
                  aria-label={`Editar monto en ${isUSD ? (allRates[activeSource]?.name || 'Divisa') : 'Bolívares'}`}
                  aria-current={isFocused}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flag code={isUSD ? (allRates[activeSource]?.flag || 'us') : 've'} />
                      <span className={`label-zen !mb-0 transition-opacity ${isFocused ? 'opacity-100' : 'opacity-60'}`}>
                        {isUSD ? `Importe Divisa (${allRates[activeSource]?.flag === 'eu' ? 'EUR' : 'USD'})` : 'Ajustar Bolívares (VES)'}
                      </span>
                    </div>
                    {isFocused ? (
                      <motion.div layoutId="focus-pill" className="w-1.5 h-1.5 bg-primary rounded-full" />
                    ) : (
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-80 animate-pulse">Editar</span>
                    )}
                  </div>
                  <div className={`input-zen !text-3xl md:input-zen md:!text-4xl transition-opacity flex items-center ${isFocused ? 'opacity-100' : 'opacity-70'}`}>
                    <span className="text-xl font-bold opacity-60 mr-2">{isUSD ? (allRates[activeSource]?.flag === 'eu' ? '€' : '$') : 'Bs.'}</span>
                    {value || <span className="opacity-60">0,00</span>}
                    {isFocused && <span className="inline-block w-1 h-8 bg-primary/50 ml-1 animate-pulse" />}
                  </div>

                  {isUSD && !isInverse && !focusedInput && (
                    <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                      {[1, 5, 20, 100].map(v => (
                        <span key={v} onClick={(e) => { e.stopPropagation(); handleInputFocus('USD'); onKeyPress(v.toString()); }}
                          className="text-[10px] font-black px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-border rounded-lg hover:bg-primary/20 transition-all whitespace-nowrap">
                          {v}{allRates[activeSource]?.flag === 'eu' ? '€' : '$'}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </section>
        </div>

        <footer className="text-center opacity-60 py-10">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Konvierte Digital • 2026</p>
        </footer>
      </main>

      {/* Teclado Virtual Zen */}
      <AnimatePresence>
        {focusedInput && (
          <motion.section initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-3xl border-t border-border p-6 pt-4 safe-bottom virtual-keyboard shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
            <div className="max-w-xl mx-auto">
              <div className="flex justify-center mb-2 pb-2">
                <button
                  onClick={() => setFocusedInput(null)}
                  className="w-12 h-1 bg-border rounded-full hover:bg-primary/30 transition-colors"
                  aria-label="Cerrar teclado"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0, 'DELETE'].map((k) => (
                  <button
                    key={k}
                    onClick={() => onKeyPress(k.toString())}
                    className="key-cap"
                    aria-label={k === 'DELETE' ? 'Borrar número' : `Número ${k}`}
                  >
                    {k === 'DELETE' ? <Delete size={20} /> : k}
                  </button>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isShareOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] p-6 flex items-center justify-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card max-w-xs w-full p-8 space-y-8 bg-surface dark:bg-surface border-white/10">
              <div className="flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-widest">Compartir</h3><button onClick={() => setIsShareOpen(false)}><X size={18} /></button></div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={shareAsText} className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-[2rem] hover:bg-primary/10 transition-all group">
                  <Type size={24} className="opacity-30 group-hover:text-primary transition-all" /><span className="text-[10px] font-black uppercase opacity-20 group-hover:text-primary">Texto</span>
                </button>
                <button onClick={shareAsImage} disabled={sharing} className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-[2rem] hover:bg-primary/10 transition-all group disabled:opacity-50">
                  <ImageIcon size={24} className="opacity-30 group-hover:text-primary transition-all" /><span className="text-[10px] font-black uppercase opacity-20 group-hover:text-primary">{sharing ? '...' : 'Imagen'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {isConfigOpen && (
          <React.Suspense fallback={null}>
            <SettingsModal
              isOpen={isConfigOpen}
              onClose={() => setIsConfigOpen(false)}
              newRateName={newRateName}
              setNewRateName={setNewRateName}
              newRateFormula={newRateFormula}
              setNewRateFormula={setNewRateFormula}
              previewRateValue={previewRateValue}
              addCustomRate={addCustomRate}
              ratesOrder={ratesOrder}
              updateOrder={updateOrder}
              allRates={allRates}
              defaultRateId={defaultRateId}
              toggleDefault={toggleDefault}
              removeCustomRate={removeCustomRate}
              RateItem={RateItem}
            />
          </React.Suspense>
        )}
      </AnimatePresence>

      {/* 🖼️ Plantilla de Captura (Oculta del Usuario) */}
      <div className="fixed -left-[2000px] top-0 pointer-events-none">
        <div
          ref={shareTemplateRef}
          style={{
            width: '500px',
            height: '500px',
            padding: '40px',
            background: '#050505',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            fontFamily: 'Outfit, sans-serif'
          }}
        >
          {/* Acento Visual */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(80px)', borderRadius: '50%' }} />

          <div style={{ textAlign: 'center', zIndex: 10, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '25px', opacity: 0.8 }}>
              <div style={{ background: '#10B981', padding: '6px', borderRadius: '10px', display: 'flex' }}>
                <Calculator size={18} color="white" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#10B981' }}>
                Konvierte
              </span>
            </div>

            <div style={{ marginBottom: '45px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(16, 185, 129, 0.2)', marginBottom: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                  {SVG_FLAGS[(lastEdited === 'USD' ? 've' : (allRates[activeSource]?.flag || 'us')).toLowerCase()]}
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'white', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.4em', display: 'block' }}>
                  {lastEdited === 'USD' ? 'Monto en Bolívares' : 'Monto en Dólares'}
                </span>
              </div>
              <h2 style={{ fontSize: '90px', fontWeight: 900, color: '#10B981', letterSpacing: '-0.04em', margin: 0, lineHeight: 0.9 }}>
                <span style={{ fontSize: '28px', opacity: 0.7, marginRight: '10px', verticalAlign: 'middle' }}>
                  {lastEdited === 'USD' ? 'Bs.' : (allRates[activeSource]?.flag === 'eu' ? '€' : '$')}
                </span>
                {lastEdited === 'USD' ? (inputVES || formatCurrency(activeRateValue)) : (inputUSD || '1.00')}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '20px 30px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px' }}>
              <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                  {SVG_FLAGS[(lastEdited === 'USD' ? (allRates[activeSource]?.flag || 'us') : 've').toLowerCase()]}
                </div>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 900, color: 'white', opacity: 0.6, textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.1em' }}>
                    {lastEdited === 'USD' ? 'Referencia USD' : 'Referencia VES'}
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>
                    {lastEdited === 'USD' ? (inputUSD || '1.00') : (inputVES || formatCurrency(activeRateValue))}
                    <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '4px' }}>
                      {lastEdited === 'USD' ? (allRates[activeSource]?.flag === 'eu' ? 'EUR' : 'USD') : 'Bs.'}
                    </span>
                  </p>
                </div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '9px', fontWeight: 900, color: '#10B981', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.1em' }}>
                  Tasa del día ({allRates[activeSource]?.name.split(' ')[0]})
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                    {SVG_FLAGS[(allRates[activeSource]?.flag || 'us').toLowerCase()]}
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>{formatCurrency(activeRateValue)}</p>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '9px', fontWeight: 800, color: 'white', opacity: 0.5, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '20px' }}>
              ✨ Calculado con Konvierte
            </p>
          </div>
        </div>
      </div>
    </div >
  );
}

export default App;
