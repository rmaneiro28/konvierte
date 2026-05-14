import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, useMotionValue, useTransform, motion, animate } from 'framer-motion';
import { RotateCw, ArrowLeftRight } from 'lucide-react';

import { useCalculator } from '../hooks/useCalculator';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';
import { useRatesManager } from '../hooks/useRatesManager';
import { formatCurrency } from '../utils/formatters';
import { requestNotificationPermission } from '../services/notificationService';

import { Header } from '../components/Header';
import { Flag } from '../components/ui/Flag';
import { ActionButtons } from '../components/ActionButtons';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { ShareModal } from '../components/ShareModal';
import { ShareTemplate } from '../components/ShareTemplate';
import { PaymentMethodsModal } from '../components/PaymentMethodsModal';
import { KambioModal } from '../components/KambioModal';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { RateItem } from '../components/RateItem';
import { RateSelector } from '../components/RateSelector';
import { HistoricalRatesModal } from '../components/HistoricalRatesModal';
import { AppIconTemplate } from '../components/AppIconTemplate';

// Carga perezosa del componente pesado de Ajustes
const SettingsModal = React.lazy(() => import('../components/SettingsModal'));

interface CalculatorPageProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const CalculatorPage: React.FC<CalculatorPageProps> = ({ theme, setTheme }) => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('og') === 'true') {
        return <AppIconTemplate isOg ref={null} />;
    }

    const shareTemplateRef = useRef<HTMLDivElement>(null);

    // Payment Methods
    const {
        methods: paymentMethods,
        addMethod,
        removeMethod,
        editMethod,
        validatePhone,
        formatCI
    } = usePaymentMethods();
    const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
    const [isKambioOpen, setIsKambioOpen] = useState(false);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);


    // --- Hooks de Lógica ---
    const {
        rates, activeSource, setActiveSource, allRates,
        loadRates, addCustomRate, removeCustomRate,
        ratesOrder, updateOrder, defaultRateId, toggleDefault,
        applyHistoricalRates, isHistoricalMode,
        preferFutureRate, setPreferFutureRate
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
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [newRateName, setNewRateName] = useState('');
    const [newRateFormula, setNewRateFormula] = useState('');
    const [previewRateValue, setPreviewRateValue] = useState(0);

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

    // Solicitar permisos de notificación en plataforma nativa
    useEffect(() => {
        requestNotificationPermission();
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
            let text = ``;

            if (selectedPaymentMethodId) {
                const pm = paymentMethods.find((m) => m.id === selectedPaymentMethodId);
                if (pm) {
                    const bankCodeStr = pm.bankCode ? `${pm.bankCode} - ` : '';

                    let formattedPhone = pm.phoneNumber;
                    const cleanPhone = pm.phoneNumber.replace(/\D/g, '');
                    if (cleanPhone.length === 12 && cleanPhone.startsWith('58')) {
                        formattedPhone = `+58-${cleanPhone.substring(2, 5)}-${cleanPhone.substring(5, 8)}-${cleanPhone.substring(8)}`;
                    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
                        formattedPhone = `+58-${cleanPhone.substring(1, 4)}-${cleanPhone.substring(4, 7)}-${cleanPhone.substring(7)}`;
                    }

                    text = `Banco: ${bankCodeStr}${pm.bank}\n` +
                        `Telefono: ${formattedPhone}\n` +
                        `CI: ${pm.documentType || 'V'}- ${formatCI(pm.idNumber)}\n` +
                        `Monto: ${inputVES || '0,00'} Bs.`;
                }
            } else {
                // Fallback si no hay método de pago
                text = `📊 *Konvierte - Reporte*\n\n` +
                    `💵 ${inputUSD} USD = ${inputVES} VES\n` +
                    `📈 Ref: ${allRates[activeSource]?.name} @ ${formatCurrency(activeRateValue)}` +
                    `\n\n✨ Calculado con Konvierte\n🔗 https://konvierte.vercel.app/`;
            }

            if (Capacitor.isNativePlatform()) {
                await Share.share({
                    title: 'Konvierte',
                    text: text,
                    dialogTitle: 'Compartir reporte'
                });
            } else if (navigator.share && window.isSecureContext) {
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
            console.error(e);
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
            await new Promise(r => setTimeout(r, 200));

            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(shareTemplateRef.current, {
                backgroundColor: '#050505',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                windowWidth: 500,
                logging: false,
            });

            canvas.toBlob(async (blob) => {
                if (!blob) throw new Error('Error al generar archivo de imagen');

                if (Capacitor.isNativePlatform()) {
                    try {
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = async () => {
                            const base64data = (reader.result as string).split(',')[1];
                            const fileName = `konvierte-${Date.now()}.png`;

                            const savedFile = await Filesystem.writeFile({
                                path: fileName,
                                data: base64data,
                                directory: Directory.Cache
                            });

                            if (mode === 'download') {
                                toast.info('Toca "Guardar Imagen" en el menú', { id: toastId });
                            } else {
                                toast.success('¡Listo!', { id: toastId });
                            }

                            try {
                                await Share.share({
                                    title: 'Konvierte Capture',
                                    files: [savedFile.uri],
                                    dialogTitle: mode === 'download' ? 'Guardar imagen' : 'Compartir imagen'
                                });
                                setIsShareOpen(false);
                            } catch (shareErr) {
                                console.warn('Share falló, intentando copiar...', shareErr);
                                try {
                                    await Clipboard.write({ image: `data:image/png;base64,${base64data}` });
                                    toast.success('Copiada al portapapeles', { id: toastId });
                                    setIsShareOpen(false);
                                } catch (clipErr) {
                                    console.warn('Clipboard falló, descargando...', clipErr);
                                    triggerDownload(canvas);
                                    toast.info('Imagen descargada', { id: toastId });
                                    setIsShareOpen(false);
                                }
                            }
                        };
                        return;
                    } catch (err) {
                        console.error('Error en native file/share:', err);
                        try {
                            await Clipboard.write({ image: canvas.toDataURL('image/png') });
                            toast.success('Copiada al portapapeles', { id: toastId });
                        } catch (fallbackErr) {
                            toast.error('Ocurrió un error. Revisa el almacenamiento.', { id: toastId });
                        }
                    }
                } else {
                    if (mode === 'download') {
                        triggerDownload(canvas);
                        toast.success('Imagen guardada', { id: toastId });
                        setIsShareOpen(false);
                        return;
                    }

                    if (navigator.share) {
                        const file = new File([blob], 'konvierte-capture.png', { type: 'image/png' });
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'Konvierte'
                            });
                            toast.success('¡Compartido!', { id: toastId });
                        } catch (error: any) {
                            if (error.name === 'AbortError') {
                                toast.dismiss(toastId);
                            } else {
                                triggerDownload(canvas);
                                toast.info('Imagen descargada', { id: toastId });
                            }
                        }
                    } else {
                        triggerDownload(canvas);
                        toast.info('Imagen descargada', { id: toastId });
                    }
                }
                setIsShareOpen(false);
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
            if (isConfigOpen || isShareOpen || isPaymentMethodsOpen) return;

            const key = e.key;
            if (/^[0-9]$/.test(key)) onKeyPress(key);
            else if (key === ',' || key === '.') onKeyPress(',');
            else if (key === 'Backspace') onKeyPress('DELETE');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedInput, isConfigOpen, isShareOpen, isPaymentMethodsOpen, onKeyPress]);

    return (
        <div className={`h-screen w-full overflow-hidden flex flex-col relative bg-background`}>
            {/* Header Zen Fijo */}
            <Header
                setIsShareOpen={setIsShareOpen}
                setIsConfigOpen={setIsConfigOpen}
                setIsPaymentMethodsOpen={setIsPaymentMethodsOpen}
                setIsKambioOpen={setIsKambioOpen}
            />

            <main className="relative z-10 w-full flex-1 overflow-hidden flex flex-col items-center justify-start max-w-md mx-auto">
                {isHistoricalMode && (
                    <div className="absolute top-2 w-full max-w-sm left-1/2 -translate-x-1/2 z-[100] px-4">
                        <div className="bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-4 py-2 flex items-center justify-between shadow-xl backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <RotateCw size={14} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Histórico: {isHistoricalMode}</span>
                            </div>
                            <button
                                onClick={() => loadRates()}
                                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-colors whitespace-nowrap"
                            >
                                Volver a Hoy
                            </button>
                        </div>
                    </div>
                )}

                {/* Pull to Refresh Indicator */}
                <motion.div
                    style={{ y: pullY, opacity: pullOpacity, rotate: pullRotate }}
                    className="fixed top-20 left-1/2 -ml-4 w-9 h-9 flex items-center justify-center z-[60] bg-surface border border-primary/20 rounded-full shadow-lg text-primary pointer-events-none md:hidden"
                >
                    <RotateCw size={16} className={rates.loading ? 'animate-spin' : ''} />
                </motion.div>

                <motion.div
                    onPan={handlePan}
                    onPanEnd={handlePanEnd}
                    className={`flex-1 flex flex-col w-full px-6 pt-12 pb-[350px] overflow-y-auto h-full justify-start gap-1 transition-all duration-300 no-scrollbar`}
                >
                    <div className="flex flex-col w-full gap-2 items-center">
                        {[isInverse ? 'VES' : 'USD', 'QUICK', isInverse ? 'USD' : 'VES'].map((type) => {
                            if (type === 'QUICK') {
                                return (
                                    <div key="quick-amounts" className="w-full flex flex-col items-center my-1">
                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Montos Rápidos (USD)</span>
                                        <div className="flex items-center gap-1.5 justify-center">
                                            {[1, 5, 10].map(v => (
                                                <button key={v} onClick={() => setFixedAmount(v.toString(), 'USD')} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black hover:bg-primary/10 transition-colors active:scale-95">${v}</button>
                                            ))}
                                            <button onClick={handleSwapCurrencies} className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 hover:bg-primary/20 transition-all active:scale-90">
                                                <ArrowLeftRight size={14} className="rotate-90" />
                                            </button>
                                            {[20, 50, 100].map(v => (
                                                <button key={v} onClick={() => setFixedAmount(v.toString(), 'USD')} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black hover:bg-primary/10 transition-colors active:scale-95">${v}</button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            const isUSD = type === 'USD';
                            const ref = isUSD ? usdInputRef : vesInputRef;
                            const value = isUSD ? inputUSD : inputVES;
                            const isFocused = focusedInput === type;
                            const currencyCode = isUSD ? (allRates[activeSource]?.flag === 'eu' ? 'EUR' : 'USD') : 'VES';
                            const currencySymbol = isUSD ? (allRates[activeSource]?.flag === 'eu' ? '€' : '$') : 'Bs.';
                            const flagCode = isUSD ? (allRates[activeSource]?.flag || 'us') : 've';

                            return (
                                <button
                                    key={type}
                                    ref={ref}
                                    onClick={() => handleInputFocus(type as 'USD' | 'VES')}
                                    className={`w-full max-w-sm flex flex-col items-center justify-center p-5 rounded-[2rem] transition-all duration-300 outline-none
                  ${isFocused ? 'bg-primary/5 border border-primary/20 scale-[1.01]' : 'bg-transparent border border-transparent opacity-60 hover:opacity-100'}
              `}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Flag code={flagCode} className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{currencyCode}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className={`text-lg font-bold ${isFocused ? 'text-primary' : 'opacity-20'}`}>{currencySymbol}</span>
                                        <span className={`text-4xl md:text-5xl font-black tracking-tighter ${isFocused ? 'text-primary' : 'text-main'}`}>
                                            {value || '0,00'}
                                        </span>
                                        {isFocused && <span className="w-0.5 h-8 bg-primary animate-pulse ml-1 rounded-full opacity-50" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-full flex flex-col gap-4">
                        <ActionButtons
                            handleReset={handleReset}
                            loadRates={loadRates}
                            isLoading={!!rates.loading}
                            setIsHistoryOpen={setIsHistoryOpen}
                        />

                        <RateSelector
                            ratesOrder={ratesOrder}
                            allRates={allRates}
                            activeSource={activeSource}
                            selectRate={selectRate}
                        />

                        <div className="text-center pt-2 opacity-40">
                            <p className="text-[9px] font-bold tracking-widest uppercase">
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
                    </div>
                </motion.div>

            {/* Teclado Virtual Mobile - Funciona en web también */}
            </main>
            <div className="w-full">
                <VirtualKeyboard
                    isOpen={true}
                    onKeyPress={onKeyPress}
                    variant="fixed"
                />
            </div>

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
                            theme={theme}
                            setTheme={setTheme}
                            preferFutureRate={preferFutureRate}
                            setPreferFutureRate={setPreferFutureRate}
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
                editMethod={editMethod}
                validatePhone={validatePhone}
                formatCI={formatCI}
            />

            <KambioModal
                isOpen={isKambioOpen}
                onClose={() => setIsKambioOpen(false)}
                currentRate={activeRateValue}
                rateName={allRates[activeSource]?.name || ''}
            />

            <HistoricalRatesModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                applyHistoricalRates={applyHistoricalRates}
            />

            {/* 🖼️ Plantilla de Captura (Oculta del Usuario) */}
            <ShareTemplate
                lastEdited={lastEdited}
                inputUSD={inputUSD}
                inputVES={inputVES}
                activeRateValue={activeRateValue}
                paymentMethod={paymentMethods.find(m => m.id === selectedPaymentMethodId) || paymentMethods[0]}
                templateRef={shareTemplateRef}
            />
        </div>
    );
};

export default CalculatorPage;
