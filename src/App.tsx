import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowRightLeft,
  Moon, Sun, Trash2, Settings2, X, Share2,
  Image as ImageIcon, Type, Calculator, Delete
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRates, type RatesState } from './services/rateService';
import { evaluate } from 'mathjs';
import html2canvas from 'html2canvas';

// --- Tipos ---
interface CustomRate {
  id: string;
  name: string;
  formula: string;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info';
}

// --- Helpers ---
const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
  if (isNaN(num)) return '0,00';
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

function App() {
  const screenshotRef = useRef<HTMLDivElement>(null);
  const shareTemplateRef = useRef<HTMLDivElement>(null);

  // --- Estados de Datos ---
  const [rates, setRates] = useState<Partial<RatesState>>({ loading: true });
  const [activeSource, setActiveSource] = useState<string>('bcv_usd');
  const [customRates, setCustomRates] = useState<CustomRate[]>(() => {
    const saved = localStorage.getItem('konvierte_custom_rates');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Estados de UI ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('konvierte_theme') as 'light' | 'dark') || 'dark';
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sharing, setSharing] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'USD' | 'VES' | null>(null);
  const [newRateName, setNewRateName] = useState('');
  const [newRateFormula, setNewRateFormula] = useState('');

  // --- Estados de Calculadora ---
  const [inputUSD, setInputUSD] = useState<string>('1');
  const [inputVES, setInputVES] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<'USD' | 'VES'>('USD');
  const [isInitialState, setIsInitialState] = useState(true);

  // --- Efectos ---
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('konvierte_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('konvierte_custom_rates', JSON.stringify(customRates));
  }, [customRates]);

  useEffect(() => {
    const loadRates = async () => {
      try {
        console.log("Cargando tasas...");
        const data = await fetchRates();
        console.log("Tasas recibidas:", data);
        setRates({ ...data, loading: false });
      } catch (err) {
        console.error("Fallo al cargar tasas:", err);
        setRates({ loading: false });
      }
    };
    loadRates();
    const interval = setInterval(loadRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- Notificaciones ---
  const addNotification = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // --- Lógica de Tasas ---
  const allRates = useMemo(() => {
    // Valores por defecto para evitar ceros si la API tarda o falla
    const base: Record<string, number> = {
      bcv_usd: rates.bcv_usd?.price || 0,
      bcv_eur: rates.bcv_eur?.price || 0,
      binance_usd: rates.binance_usd?.price || 0,
    };

    const resolved: Record<string, { name: string; price: number }> = {
      bcv_usd: { name: 'Dólar BCV', price: base.bcv_usd },
      bcv_eur: { name: 'Euro BCV', price: base.bcv_eur },
      binance_usd: { name: 'Paralelo', price: base.binance_usd },
    };

    customRates.forEach(cr => {
      try {
        const price = evaluate(cr.formula.toLowerCase(), base);
        resolved[cr.id] = { name: cr.name, price: typeof price === 'number' && !isNaN(price) ? price : 0 };
      } catch (e) {
        resolved[cr.id] = { name: cr.name, price: 0 };
      }
    });

    console.log("Calculadas todas las tasas:", resolved);
    return resolved;
  }, [rates, customRates]);

  const activeRateValue = allRates[activeSource]?.price || 0;

  // Sincronizar monto inicial VES cuando se cargan las tasas
  useEffect(() => {
    if (rates.bcv_usd?.price && inputUSD === '1' && inputVES === '') {
      const rate = allRates[activeSource]?.price || 0;
      updateCalculation('1', 'USD', rate);
    }
  }, [rates, activeSource, allRates]);

  // --- Lógica de Previsualización de Fórmula ---
  const previewRateValue = useMemo(() => {
    if (!newRateFormula) return 0;
    try {
      const base: Record<string, number> = {
        bcv_usd: rates.bcv_usd?.price || 0,
        bcv_eur: rates.bcv_eur?.price || 0,
        binance_usd: rates.binance_usd?.price || 0,
      };
      const price = evaluate(newRateFormula.toLowerCase(), base);
      return typeof price === 'number' ? price : 0;
    } catch (e) { return 0; }
  }, [newRateFormula, rates]);

  // --- Lógica de Teclado y Cálculo ---
  const handleInputFocus = (type: 'USD' | 'VES') => {
    setFocusedInput(type);
    if (isInitialState) {
      if (type === 'USD') setInputUSD('0');
      else setInputVES('0');
      setIsInitialState(false);
    }
  };

  const updateCalculation = (val: string, source: 'USD' | 'VES', rate: number) => {
    try {
      const cleanVal = val.replace(/\./g, '').replace(',', '.');
      const result = evaluate(cleanVal || '0');
      if (typeof result === 'number' && !isNaN(result)) {
        if (source === 'USD') setInputVES(formatCurrency(result * rate));
        else setInputUSD(formatCurrency(result / rate));
      }
    } catch { }
  };

  const onKeyPress = (key: string) => {
    if (!focusedInput) return;
    const currentVal = focusedInput === 'USD' ? inputUSD : inputVES;
    let newVal = currentVal;

    if (key === 'DELETE') {
      newVal = currentVal.length <= 1 ? '0' : currentVal.slice(0, -1);
    } else if (key === ',' || key === '.') {
      if (!currentVal.includes(',') && !currentVal.includes('.')) newVal = currentVal + ',';
    } else {
      if (currentVal === '0' || isInitialState) {
        newVal = key;
        setIsInitialState(false);
      } else {
        newVal = currentVal + key;
      }
    }

    if (focusedInput === 'USD') {
      setInputUSD(newVal);
      setLastEdited('USD');
      updateCalculation(newVal, 'USD', activeRateValue);
    } else {
      setInputVES(newVal);
      setLastEdited('VES');
      updateCalculation(newVal, 'VES', activeRateValue);
    }
  };

  const selectRate = (id: string) => {
    setActiveSource(id);
    const rate = allRates[id]?.price || 0;
    // Auto-recalc based on last edited field
    if (lastEdited === 'USD') updateCalculation(inputUSD, 'USD', rate);
    else updateCalculation(inputVES, 'VES', rate);
  };

  // --- Compartir ---
  const shareAsText = async () => {
    try {
      const rateLabel = allRates[activeSource]?.name || 'Tasa';
      const rateVal = formatCurrency(activeRateValue);
      const amountUSD = inputUSD || '1';
      const amountVES = inputVES || formatCurrency(activeRateValue);

      const text = `📊 Konvierte\n🏦 ${rateLabel}: Bs. ${rateVal}\n🧮 ${amountUSD} USD = Bs. ${amountVES}\n✨ Calculado con Konvierte`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        addNotification('Reporte copiado');
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          addNotification('Copiado (Alt)');
        } catch (err) {
          addNotification('Error al copiar', 'info');
        }
        document.body.removeChild(textArea);
      }
      setIsShareOpen(false);
    } catch (e) {
      addNotification('Error al compartir', 'info');
    }
  };

  const shareAsImage = async () => {
    if (!shareTemplateRef.current) {
      addNotification('Error: Plantilla no lista', 'info');
      return;
    }

    setSharing(true);
    addNotification('Generando widget...', 'info');

    try {
      // Forzar un pequeño delay para asegurar que los datos estén renderizados en el template
      await new Promise(r => setTimeout(r, 100));

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
          const file = new File([blob], `konvierte-${Date.now()}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Konvierte',
              text: 'Tipo de cambio actualizado'
            });
            addNotification('Compartido con éxito');
          } else {
            throw new Error('No se puede compartir archivos');
          }
        } catch (err) {
          // Fallback manual si share falla
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `konvierte-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          addNotification('Imagen descargada (Share falló)');
        }
      } else {
        // Fallback para desktop o HTTP
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `konvierte-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

        if (!window.isSecureContext) {
          addNotification('Cargado vía HTTP: Descargando en su lugar', 'info');
        } else {
          addNotification('Imagen descargada');
        }
      }
      setIsShareOpen(false);
    } catch (e) {
      console.error(e);
      addNotification('Error al procesar imagen', 'info');
    } finally {
      setSharing(false);
    }
  };

  const addCustomRate = (name: string, formula: string) => {
    setCustomRates([...customRates, { id: `custom_${Date.now()}`, name, formula }]);
    addNotification('Tasa guardada');
  };

  const removeCustomRate = (id: string) => {
    setCustomRates(customRates.filter(r => r.id !== id));
    if (activeSource === id) setActiveSource('bcv_usd');
    addNotification('Tasa eliminada');
  };

  // Outside click logic
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.calculator-input') && !target.closest('.virtual-keyboard')) setFocusedInput(null);
    };
    if (focusedInput) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [focusedInput]);

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 pt-16 ${focusedInput ? 'pb-80' : ''}`}>
      {/* Notificaciones */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] space-y-2 pointer-events-none w-full max-w-xs">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div key={n.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={`p-3 px-6 rounded-full shadow-2xl border text-center ${n.type === 'success' ? 'bg-primary text-white border-primary/20' : 'bg-surface text-main border-border'}`}>
              <span className="text-[10px] font-black uppercase tracking-widest">{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Zen Fijo */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border h-16 flex items-center">
        <div className="max-w-2xl mx-auto px-6 w-full flex items-center justify-between">
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
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setIsShareOpen(true)} className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center"><Share2 size={16} /></button>
            <button onClick={() => setIsConfigOpen(true)} className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center"><Settings2 size={16} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 pt-8 space-y-8">

        <div ref={screenshotRef} data-screenshot-area="true" className="rounded-[2.5rem] bg-transparent p-1">
          {/* Hero: Resalta el resultado opuesto a la entrada (Zen Logic) */}
          <section className="text-center mb-8 py-6">
            <span className="label-zen text-center text-primary !opacity-60 !tracking-[0.6em]">
              {lastEdited === 'USD' ? 'Monto Calculado (VES)' : 'Equivalente en Divisa (USD)'}
            </span>
            <div className="flex flex-col items-center">
              {(() => {
                const isUSDHero = lastEdited === 'VES';
                const mainValue = isUSDHero ? (inputUSD || '1.00') : (inputVES || formatCurrency(activeRateValue));
                const numericValue = parseFloat(mainValue.replace(/\./g, '').replace(',', '.'));

                const fontSizeClass = numericValue >= 100000 ? 'text-5xl' : numericValue >= 10000 ? 'text-6xl' : 'text-8xl';
                const extraSizeClass = numericValue >= 100000 ? 'text-lg' : numericValue >= 10000 ? 'text-xl' : 'text-3xl';

                return (
                  <motion.span
                    key={lastEdited + mainValue + activeSource}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`${fontSizeClass} font-black tracking-tighter text-primary truncate max-w-full transition-all duration-300`}
                  >
                    <span className="text-2xl font-bold opacity-30 mr-1">{isUSDHero ? '$' : 'Bs.'}</span>
                    {mainValue.split(',')[0]}
                    <span className={`${extraSizeClass} opacity-40`}>,{mainValue.split(',')[1] || '00'}</span>
                  </motion.span>
                );
              })()}
              <div className="mt-2 flex items-center gap-2 opacity-30">
                <span className="text-[10px] font-black uppercase tracking-widest">{allRates[activeSource]?.name} @ {formatCurrency(activeRateValue)}</span>
              </div>
            </div>
          </section>
          {/* Selector de Tasas */}
          <section className="flex gap-3 overflow-x-auto no-scrollbar py-2 mb-4">
            {Object.entries(allRates).map(([id, data]) => (
              <button key={id} onClick={() => selectRate(id)}
                className={`flex-shrink-0 px-5 py-3 rounded-2xl border transition-all duration-300 ${activeSource === id ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border-transparent opacity-30 hover:opacity-100'}`}>
                <span className={`block text-[8px] font-black uppercase tracking-widest mb-0.5 ${activeSource === id ? 'opacity-70' : 'opacity-60'}`}>{data.name}</span>
                <span className="text-sm font-black">{formatCurrency(data.price)}</span>
              </button>
            ))}
          </section>

          {/* Calculadora Zen (Inputs Secundarios) */}
          <section className="glass-card p-8 space-y-10 border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Calculator size={60} /></div>

            <div className="relative cursor-pointer calculator-input" onClick={() => handleInputFocus('USD')}>
              <div className="flex items-center justify-between mb-2">
                <span className={`label-zen !mb-0 transition-opacity ${focusedInput === 'USD' ? 'opacity-100' : 'opacity-30'}`}>Importe Divisa (USD)</span>
                {focusedInput === 'USD' && <motion.div layoutId="focus-pill" className="w-1.5 h-1.5 bg-primary rounded-full" />}
              </div>
              <div className={`input-zen !text-4xl transition-opacity ${focusedInput === 'USD' ? 'opacity-100' : 'opacity-60'}`}>
                {inputUSD || <span className="opacity-30">0,00</span>}
                {focusedInput === 'USD' && <span className="inline-block w-1 h-8 bg-primary/50 ml-1 animate-pulse" />}
              </div>
              <div className="flex gap-2 mt-4">
                {[1, 5, 20, 100].map(v => (
                  <button key={v} onClick={(e) => { e.stopPropagation(); setInputUSD(v.toString()); setFocusedInput('USD'); updateCalculation(v.toString(), 'USD', activeRateValue); setLastEdited('USD'); setIsInitialState(false); }}
                    className="text-[10px] font-black px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-border rounded-lg hover:bg-primary/20 transition-all">
                    {v}$
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center opacity-10"><ArrowRightLeft size={20} /></div>

            <div className="relative cursor-pointer calculator-input" onClick={() => handleInputFocus('VES')}>
              <div className="flex items-center justify-between mb-2">
                <span className={`label-zen !mb-0 transition-opacity ${focusedInput === 'VES' ? 'opacity-100' : 'opacity-30'}`}>Ajustar Bolívares (VES)</span>
                {focusedInput === 'VES' && <motion.div layoutId="focus-pill" className="w-1.5 h-1.5 bg-primary rounded-full" />}
              </div>
              <div className={`input-zen !text-4xl transition-opacity ${focusedInput === 'VES' ? 'opacity-100' : 'opacity-60'}`}>
                {inputVES || <span className="opacity-30">0,00</span>}
                {focusedInput === 'VES' && <span className="inline-block w-1 h-8 bg-primary/50 ml-1 animate-pulse" />}
              </div>
            </div>
          </section>
        </div>

        <footer className="text-center opacity-10 py-10">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Konvierte Digital • 2026</p>
        </footer>
      </main>

      {/* Teclado Virtual Zen */}
      <AnimatePresence>
        {focusedInput && (
          <motion.section initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-3xl border-t border-border p-6 pt-4 safe-bottom virtual-keyboard shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
            <div className="max-w-xl mx-auto">
              <div className="flex justify-center mb-2 pb-2"><button onClick={() => setFocusedInput(null)} className="w-12 h-1 bg-border rounded-full hover:bg-primary/30 transition-colors" /></div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0, 'DELETE'].map((k) => (
                  <button key={k} onClick={() => onKeyPress(k.toString())} className="key-cap">{k === 'DELETE' ? <Delete size={20} /> : k}</button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] p-6 flex items-center justify-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card max-w-md w-full p-8 max-h-[80vh] overflow-y-auto space-y-8 bg-surface dark:bg-surface border-white/10">
              <div className="flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-widest">Ajustes</h3><button onClick={() => setIsConfigOpen(false)}><X size={18} /></button></div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <span className="label-zen text-[9px]">Nueva Tasa</span>
                  <div className="flex flex-col gap-3">
                    <input value={newRateName} onChange={(e) => setNewRateName(e.target.value)} placeholder="Nombre" className="bg-white/5 p-4 rounded-2xl text-[11px] font-bold outline-none border border-black/5 dark:border-white/5 focus:border-primary/50 placeholder:opacity-20 transition-all" />
                    <input value={newRateFormula} onChange={(e) => setNewRateFormula(e.target.value)} placeholder="Fórmula (Ej: bcv_usd * 1.1)" className="bg-white/5 p-4 rounded-2xl text-[11px] font-bold outline-none border border-black/5 dark:border-white/5 focus:border-primary/50 placeholder:opacity-20 transition-all" />
                    {newRateFormula && (<div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-center justify-between"><span className="text-[10px] font-black uppercase opacity-40">Resultado:</span><span className="text-sm font-black text-primary">Bs. {formatCurrency(previewRateValue)}</span></div>)}
                    <button onClick={() => { if (newRateName && newRateFormula && previewRateValue > 0) { addCustomRate(newRateName, newRateFormula); setNewRateName(''); setNewRateFormula(''); } }} disabled={!newRateName || !newRateFormula || previewRateValue <= 0} className="bg-primary hover:bg-primary/80 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50">Añadir Tasa</button>
                  </div>
                </div>
                <div className="pt-6 border-t border-black/5 dark:border-white/5">
                  <span className="label-zen text-[9px]">Mis Tasas</span>
                  <div className="space-y-2">
                    {customRates.map(r => (
                      <div key={r.id} className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between group">
                        <div className="overflow-hidden"><p className="text-[11px] font-black uppercase truncate">{r.name}</p></div>
                        <button onClick={() => removeCustomRate(r.id)} className="text-red-500/40 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
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

          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5em', color: '#10B981', opacity: 0.8, display: 'block', marginBottom: '10px' }}>
              📊 Konvierte
            </span>

            <div style={{ marginBottom: '40px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'white', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.4em', display: 'block', marginBottom: '8px' }}>
                {lastEdited === 'USD' ? 'Monto en Bolívares' : 'Monto en Dólares'}
              </span>
              <h2 style={{ fontSize: '85px', fontWeight: 900, color: '#10B981', letterSpacing: '-0.04em', margin: 0, lineHeight: 0.9 }}>
                <span style={{ fontSize: '28px', opacity: 0.4, marginRight: '10px', verticalAlign: 'middle' }}>
                  {lastEdited === 'USD' ? 'Bs.' : '$'}
                </span>
                {lastEdited === 'USD' ? (inputVES || formatCurrency(activeRateValue)) : (inputUSD || '1.00')}
              </h2>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'white', opacity: 0.3, marginTop: '15px' }}>
                {allRates[activeSource]?.name} @ Bs. {formatCurrency(activeRateValue)}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '18px 35px', background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '9px', fontWeight: 900, color: 'white', opacity: 0.3, textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.1em' }}>
                  {lastEdited === 'USD' ? 'Referencia USD' : 'Referencia VES'}
                </p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: 0 }}>
                  {lastEdited === 'USD' ? (inputUSD || '1.00') : (inputVES || formatCurrency(activeRateValue))}
                  <span style={{ fontSize: '12px', opacity: 0.5, marginLeft: '4px' }}>
                    {lastEdited === 'USD' ? 'USD' : 'Bs.'}
                  </span>
                </p>
              </div>
              <div style={{ width: '1px', height: '35px', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '9px', fontWeight: 900, color: '#10B981', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '0.1em' }}>Tasa del día</p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: 0 }}>{formatCurrency(activeRateValue)}</p>
              </div>
            </div>

            <p style={{ fontSize: '9px', fontWeight: 800, color: 'white', opacity: 0.2, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              ✨ Calculado con Konvierte
            </p>
          </div>
        </div>
      </div>
    </div >
  );
}

export default App;
