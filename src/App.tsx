import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { LazyMotion, domAnimation, AnimatePresence, useMotionValue, useTransform, motion, animate } from 'framer-motion';
import { RotateCw } from 'lucide-react';

import { useCalculator } from './hooks/useCalculator';
import { useRatesManager } from './hooks/useRatesManager';
import { formatCurrency } from './utils/formatters';

import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ActionButtons } from './components/ActionButtons';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { ShareModal } from './components/ShareModal';
import { ShareTemplate } from './components/ShareTemplate';
import { PaymentMethodsModal } from './components/PaymentMethodsModal';
import { usePaymentMethods } from './hooks/usePaymentMethods';
import { RateItem } from './components/RateItem';
import { RateSelector } from './components/RateSelector';


// Carga perezosa del componente pesado de Ajustes
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));

function App() {

  const shareTemplateRef = useRef<HTMLDivElement>(null);

  // Payment Methods
  const {
    methods: paymentMethods,
    addMethod,
    removeMethod,
    validatePhone,
    formatPhoneNumber
  } = usePaymentMethods();
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);

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
    handleSwapCurrencies, updateCalculation, isInverse, setFixedAmount
  } = useCalculator(activeRateValue);

  // --- Estados de UI locales ---
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [newRateName, setNewRateName] = useState('');
  const [newRateFormula, setNewRateFormula] = useState('');
  const [previewRateValue, setPreviewRateValue] = useState(0);  // --- Pull to Refresh Logic ---
  // --- Pull to Refresh Logic ---
  const [pullProgress, setPullProgress] = useState(0);
  const pullThreshold = 80;
  const pullY = useMotionValue(0);
  const pullOpacity = useTransform(pullY, [0, pullThreshold], [0, 1]);
  const pullRotate = useTransform(pullY, [0, pullThreshold], [0, 360]);

  const handlePan = (_: any, info: any) => {
    // Solo permitir pull-to-refresh si el scroll está arriba
    if (window.scrollY <= 10 && info.offset.y > 0) {
      // Efecto de resistencia (bungee)
      const dampedOffset = info.offset.y * 0.5;
      pullY.set(Math.min(dampedOffset, pullThreshold + 20));
      setPullProgress(Math.min(dampedOffset / pullThreshold, 1));
    } else {
      // Si el usuario sube mientras hace pull, permitir que baje el valor
      if (pullY.get() > 0) {
        pullY.set(Math.max(0, pullY.get() + info.delta.y));
      } else {
        pullY.set(0);
      }
      setPullProgress(0);
    }
  };

  const handlePanEnd = () => {
    if (pullProgress >= 1) {
      loadRates();
      // Mantener el spinner visible mientras carga
      animate(pullY, pullThreshold, { type: "spring", stiffness: 300, damping: 30 });
    } else {
      // Restaurar suavemente si no se activó
      animate(pullY, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
    setPullProgress(0);
  };

  // Efecto para ocultar el spinner cuando termina de cargar
  useEffect(() => {
    if (!rates.loading && pullY.get() > 0) {
      animate(pullY, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  }, [rates.loading, pullY]);

  // --- Refs para Scroll ---
  const usdInputRef = useRef<HTMLButtonElement>(null);
  const vesInputRef = useRef<HTMLButtonElement>(null);

  // Sincronizar monto inicial VES cuando se cargan las tasas
  useEffect(() => {
    if (rates.bcv_usd?.price && inputUSD === '1' && inputVES === '') {
      updateCalculation('1', 'USD', activeRateValue);
    }
  }, [rates.bcv_usd, activeSource, activeRateValue, updateCalculation, inputUSD, inputVES]);

  // Force default focus on USD on mount
  useEffect(() => {
    setFocusedInput('USD');
  }, []);

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
      let text = `📊 *Konvierte - Reporte*\n\n` +
        `💵 ${inputUSD} USD = ${inputVES} VES\n` +
        `📈 Ref: ${allRates[activeSource]?.name} @ ${formatCurrency(activeRateValue)}`;

      if (selectedPaymentMethodId) {
        const pm = paymentMethods.find((m) => m.id === selectedPaymentMethodId);
        if (pm) {
          text += `\n\n💳 *Pago Móvil*\n` +
            `Banco: ${pm.bank}\n` +
            `Cédula: ${pm.idNumber}\n` +
            `Teléfono: ${pm.phoneNumber}`;
        }
      }

      text += `\n\n✨ Calculado con Konvierte`;

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

  const shareAsImage = async (mode: 'share' | 'download' = 'share') => {
    if (!shareTemplateRef.current) {
      toast.error('Error: Plantilla no lista');
      return;
    }

    setSharing(true);
    const toastId = toast.loading('Generando imagen...');

    try {
      // Pequeña pausa para asegurar renderizado
      await new Promise(r => setTimeout(r, 200));

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(shareTemplateRef.current, {
        backgroundColor: '#050505',
        scale: 2, // Escala reducida para asegurar estabilidad en móviles
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Error al generar archivo de imagen');

        if (mode === 'download') {
          triggerDownload(canvas);
          toast.success('Imagen guardada', { id: toastId });
          setIsShareOpen(false);
          return;
        }

        const file = new File([blob], 'konvierte-capture.png', { type: 'image/png' });

        if (navigator.share) {
          try {
            await navigator.share({
              files: [file],
              title: 'Konvierte',
              text: ` 💵 ${inputUSD || '1'} USD = ${inputVES || formatCurrency(activeRateValue)} Bs.`
            });
            toast.success('¡Compartido!', { id: toastId });
          } catch (error: any) {
            if (error.name === 'AbortError') {
              toast.dismiss(toastId);
            } else {
              console.error('Error al compartir:', error);
              triggerDownload(canvas);
              toast.info('Imagen descargada (No se pudo abrir el menú compartir)', { id: toastId });
            }
          }
        } else {
          // Fallback descarga explícito
          triggerDownload(canvas);

          if (!window.isSecureContext) {
            toast.info('Imagen descargada. (Compartir requiere HTTPS)', { id: toastId });
          } else {
            toast.info('Imagen descargada. (Tu dispositivo no soporta compartir nativo)', { id: toastId });
          }
        }
      }, 'image/png');

      setIsShareOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Error al generar imagen', { id: toastId });
    } finally {
      setSharing(false);
    }
  };

  const triggerDownload = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = `konvierte-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  // REMOVED: Click outside logic to keep keyboard fixed
  /*
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.calculator-input') && !target.closest('.virtual-keyboard')) setFocusedInput(null);
    };
    if (focusedInput) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [focusedInput, setFocusedInput]);
  */


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
    <LazyMotion features={domAnimation}>
      <div className={`h-screen w-full overflow-hidden flex flex-col relative bg-background`}>
        {/* Notificaciones Sonner */}
        <Toaster
          position="top-right"
          expand={false}
          richColors
          theme={theme}
          toastOptions={{
            style: {
              background: 'var(--surface-color)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '12px',
              padding: '12px',
              width: 'auto',
              minWidth: '200px',
              maxWidth: '300px',
            }
          }}
        />

        {/* Header Zen Fijo */}
        <Header
          theme={theme}
          setTheme={setTheme}
          setIsShareOpen={setIsShareOpen}
          setIsConfigOpen={setIsConfigOpen}
          setIsPaymentMethodsOpen={setIsPaymentMethodsOpen}
        />

        <main className="relative z-10 w-full overflow-hidden">
          {/* Pull to Refresh Indicator */}
          <motion.div
            style={{ y: pullY, opacity: pullOpacity, rotate: pullRotate }}
            className="fixed top-20 left-1/2 -ml-4 w-9 h-9 flex items-center justify-center z-[60] bg-surface border border-primary/20 rounded-full shadow-lg text-primary pointer-events-none"
          >
            <RotateCw size={16} className={rates.loading ? 'animate-spin' : ''} />
          </motion.div>

          <motion.div
            onPan={handlePan}
            onPanEnd={handlePanEnd}
            className={`flex-1 flex flex-col w-full max-w-xl mx-auto px-6 pt-12 h-full justify-center gap-1 transition-all duration-300`}
          >

            {/* Calculadora Zen (Inputs Secundarios) - Ahora Hero Section Interactiva */}
            <HeroSection
              focusedInput={focusedInput}
              inputUSD={inputUSD}
              inputVES={inputVES}
              handleInputFocus={handleInputFocus}
              handleSwapCurrencies={handleSwapCurrencies}
              setFixedAmount={setFixedAmount}
              usdInputRef={usdInputRef}
              vesInputRef={vesInputRef}
              activeRateValue={activeRateValue}
              allRates={allRates}
              activeSource={activeSource}
              isInverse={isInverse}
              lastEdited={lastEdited}
            />

            {/* Botones de Acción (Reset/Actualizar) */}
            <ActionButtons
              handleReset={handleReset}
              loadRates={loadRates}
              isLoading={!!rates.loading}
            />

            {/* Selector de Tasas */}
            <RateSelector
              ratesOrder={ratesOrder}
              allRates={allRates}
              activeSource={activeSource}
              selectRate={selectRate}
            />
            {/* Fecha de Actualización */}
            <div className="text-center pt-4 opacity-40">
              <p className="text-[10px] font-medium">
                Actualizado: {(() => {
                  const rate = (rates as any)[activeSource];
                  if (rate?.lastUpdate) {
                    try {
                      return new Date(rate.lastUpdate).toLocaleString('es-VE', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      });
                    } catch (e) { return '---'; }
                  }
                  return new Date().toLocaleDateString();
                })()}
              </p>
            </div>


            {/* Footer Removed / Minimized */}
          </motion.div>
        </main>

        {/* Teclado Virtual Zen - SIEMPRE DISPONIBLE */}
        <VirtualKeyboard
          isOpen={true}
          onKeyPress={onKeyPress}
          onClose={() => { }} // Disabled close
        />

        {/* Modals */}
        <AnimatePresence>
          <ShareModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            shareAsText={shareAsText}
            shareAsImage={shareAsImage}
            sharing={sharing}
            paymentMethods={paymentMethods}
            selectedPaymentMethodId={selectedPaymentMethodId}
            onSelectPaymentMethod={setSelectedPaymentMethodId}
          />
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

        <PaymentMethodsModal
          isOpen={isPaymentMethodsOpen}
          onClose={() => setIsPaymentMethodsOpen(false)}
          methods={paymentMethods}
          addMethod={addMethod}
          removeMethod={removeMethod}
          validatePhone={validatePhone}
          formatPhoneNumber={formatPhoneNumber}
        />

        {/* 🖼️ Plantilla de Captura (Oculta del Usuario) */}
        <ShareTemplate
          lastEdited={lastEdited}
          inputUSD={inputUSD}
          inputVES={inputVES}
          activeRateValue={activeRateValue}
          allRates={allRates}
          activeSource={activeSource}
          templateRef={shareTemplateRef}
          paymentMethod={paymentMethods.find(m => m.id === selectedPaymentMethodId)}
        />
      </div>
    </LazyMotion >
  );
}

export default App;
