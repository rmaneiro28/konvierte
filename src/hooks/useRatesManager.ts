import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchRates, type RatesState } from '../services/rateService';
import { sendRateUpdateNotification } from '../services/notificationService';
import { toast } from 'sonner';

interface CustomRate {
    id: string;
    name: string;
    formula: string;
}

export const useRatesManager = () => {
    const [rates, setRates] = useState<Partial<RatesState>>({ loading: true });
    const [isHistoricalMode, setIsHistoricalMode] = useState<string | null>(null);
    const [resolvedPrices, setResolvedPrices] = useState<Record<string, { name: string; price: number; flag: string; change24h?: number }>>({});

    // Tasa por defecto (favorito)
    const [defaultRateId, setDefaultRateId] = useState<string>(() => {
        try {
            return localStorage.getItem('konvierte_default_rate') || 'bcv_usd';
        } catch (e) { return 'bcv_usd'; }
    });

    const [activeSource, setActiveSource] = useState<string>(defaultRateId);

    // Orden de las tasas
    const [ratesOrder, setRatesOrder] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('konvierte_rates_order');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });
    const [customRates, setCustomRates] = useState<CustomRate[]>(() => {
        try {
            const saved = localStorage.getItem('konvierte_custom_rates');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) return [];

            // Validación estricta de cada tasa personalizada
            return parsed.filter((r: any): r is CustomRate => {
                const isValid = r &&
                    typeof r.id === 'string' && r.id.trim() !== '' &&
                    typeof r.name === 'string' && r.name.trim() !== '' &&
                    typeof r.formula === 'string' && r.formula.trim() !== '';

                // if (!isValid) console.warn("Tasa personalizada inválida detectada y omitida:", r);
                return isValid;
            });
        } catch (e) {
            // console.error("Error crítico cargando tasas personalizadas:", e);
            return [];
        }
    });

    const [preferFutureRate, setPreferFutureRate] = useState<boolean>(() => {
        try {
            return localStorage.getItem('konvierte_prefer_future_rate') === 'true';
        } catch (e) { return false; }
    });

    // Precios previos para detectar cambios y enviar notificaciones
    const prevPricesRef = useRef<Record<string, number>>({});

    const loadRates = useCallback(async () => {
        try {
            setRates(prev => ({ ...prev, loading: true }));
            const data = await fetchRates();
            setRates({ ...data, loading: false });

            // Guardar en caché para oflline
            localStorage.setItem('konvierte_cached_rates', JSON.stringify({
                bcv_usd: data.bcv_usd,
                bcv_eur: data.bcv_eur,
                binance_usd: data.binance_usd
            }));

            // --- Notificaciones al detectar cambio de tasa ---
            type ExchangeRateKey = 'bcv_usd' | 'bcv_eur' | 'binance_usd';
            const rateMap: Array<{ key: ExchangeRateKey; name: string }> = [
                { key: 'bcv_usd', name: 'Dólar BCV' },
                { key: 'bcv_eur', name: 'Euro BCV' },
                { key: 'binance_usd', name: 'Paralelo' },
            ];

            for (const { key, name } of rateMap) {
                const rate = data[key];
                if (!rate || typeof (rate as any).price !== 'number') continue;

                const prevPrice = prevPricesRef.current[key] ?? 0;
                const newPrice = (rate as { price: number }).price;

                // Solo notificar si ya teníamos un precio previo y cambió significativamente
                if (prevPrice > 0 && Math.abs(newPrice - prevPrice) >= 0.01) {
                    sendRateUpdateNotification({ name, price: newPrice, prevPrice });
                }

                prevPricesRef.current[key] = newPrice;
            }

            toast.info('Tasas actualizadas');
            setIsHistoricalMode(null);
        } catch (err: any) {
            setRates(prev => ({ ...prev, loading: false }));
            if (err.message === 'API_UNAVAILABLE') {
                toast.error('La API de tasas del BCV no está disponible temporalmente.');
            } else {
                toast.error('Error al actualizar tasas. Verifica tu conexión.');
            }

            // Restaurar desde caché
            const cached = localStorage.getItem('konvierte_cached_rates');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setRates({ ...parsed, loading: false });
                    toast.info('Se están mostrando las últimas tasas guardadas.');
                } catch (e) { }
            }
        }
    }, []);

    useEffect(() => {
        loadRates();
        // const interval = setInterval(loadRates, 60000); // ACTUALIZACIÓN MANUAL SOLICITADA
        // return () => clearInterval(interval);
    }, [loadRates]);

    useEffect(() => {
        localStorage.setItem('konvierte_custom_rates', JSON.stringify(customRates));

        // Sincronizar el orden cuando se añaden o eliminan tasas
        setRatesOrder(prev => {
            const systemIds = ['bcv_usd', 'bcv_eur', 'binance_usd'];
            const customIds = customRates.map(r => r.id);
            const currentIds = [...systemIds, ...customIds];

            // Mantener el orden existente pero filtrar IDs eliminados y añadir nuevos
            const filtered = prev.filter(id => currentIds.includes(id));
            const newIds = currentIds.filter(id => !filtered.includes(id));

            const nextOrder = [...filtered, ...newIds];
            // Solo actualizar si realmente cambió (evitar loops)
            if (JSON.stringify(nextOrder) !== JSON.stringify(prev)) return nextOrder;
            return prev;
        });
    }, [customRates]);

    useEffect(() => {
        localStorage.setItem('konvierte_rates_order', JSON.stringify(ratesOrder));
    }, [ratesOrder]);

    useEffect(() => {
        localStorage.setItem('konvierte_default_rate', defaultRateId);
    }, [defaultRateId]);

    useEffect(() => {
        localStorage.setItem('konvierte_prefer_future_rate', String(preferFutureRate));
    }, [preferFutureRate]);

    useEffect(() => {
        const calculateResolutions = async () => {
            const getEffPrice = (r?: any) => {
                if (!r) return 0;
                if (!preferFutureRate && r.todayPrice) return r.todayPrice;
                return r.price;
            };

            const base: Record<string, number> = {
                bcv_usd: getEffPrice(rates.bcv_usd),
                bcv_eur: getEffPrice(rates.bcv_eur),
                binance_usd: getEffPrice(rates.binance_usd),
            };

            const resolved: Record<string, { name: string; price: number; flag: string; change24h?: number }> = {
                bcv_usd: { name: 'Dólar BCV', price: base.bcv_usd, flag: 'us', change24h: rates.bcv_usd?.change24h },
                bcv_eur: { name: 'Euro BCV', price: base.bcv_eur, flag: 'eu', change24h: rates.bcv_eur?.change24h },
                binance_usd: { name: 'Binance', price: base.binance_usd, flag: 'us', change24h: rates.binance_usd?.change24h },
            };

            // Solo cargar mathjs si hay tasas personalizadas
            if (customRates.length > 0) {
                try {
                    const { evaluate } = await import('mathjs');
                    customRates.forEach(cr => {
                        try {
                            const result = evaluate(cr.formula.toLowerCase(), base);
                            const price = typeof result === 'number' && isFinite(result) ? result : 0;
                            resolved[cr.id] = {
                                name: cr.name,
                                price: Math.max(0, price),
                                flag: cr.formula.toLowerCase().includes('eur') ? 'eu' : 'us'
                            };
                        } catch (e) {
                            resolved[cr.id] = { name: cr.name, price: 0, flag: 'us' };
                        }
                    });
                } catch (e) {
                    // Fallback si mathjs falla
                    customRates.forEach(cr => {
                        resolved[cr.id] = { name: cr.name, price: 0, flag: 'us' };
                    });
                }
            }

            setResolvedPrices(resolved);
        };

        calculateResolutions();
    }, [rates, customRates, preferFutureRate]);

    const allRates = resolvedPrices;

    const addCustomRate = useCallback((name: string, formula: string) => {
        setCustomRates(prev => [...prev, { id: `custom_${Date.now()}`, name, formula }]);
        toast.success('Tasa guardada');
    }, []);

    const removeCustomRate = useCallback((id: string) => {
        setCustomRates(prev => prev.filter(r => r.id !== id));
        setActiveSource(prev => prev === id ? 'bcv_usd' : prev);
        if (defaultRateId === id) setDefaultRateId('bcv_usd');
        toast.info('Tasa eliminada');
    }, [defaultRateId]);

    const toggleDefault = useCallback((id: string) => {
        setDefaultRateId(prev => prev === id ? 'bcv_usd' : id);
        toast.success('Favorito actualizado');
    }, []);

    const updateOrder = useCallback((newOrder: string[]) => {
        setRatesOrder(newOrder);
    }, []);

    const applyHistoricalRates = useCallback((date: string, usdBCV: number, eurBCV: number, usdBinance: number) => {
        setRates({
            loading: false,
            bcv_usd: { price: usdBCV, symbol: 'USD', lastUpdate: `${date}T12:00:00Z`, change24h: 0, history: [] },
            bcv_eur: { price: eurBCV, symbol: 'EUR', lastUpdate: `${date}T12:00:00Z`, change24h: 0, history: [] },
            binance_usd: { price: usdBinance, symbol: 'USDT', lastUpdate: `${date}T12:00:00Z`, change24h: 0, history: [] },
        });
        setIsHistoricalMode(date);
        toast.info(`Tasas fijadas al ${date}`);
    }, []);

    return {
        rates,
        activeSource,
        setActiveSource,
        customRates,
        allRates,
        ratesOrder,
        defaultRateId,
        loadRates,
        addCustomRate,
        removeCustomRate,
        toggleDefault,
        updateOrder,
        applyHistoricalRates,
        isHistoricalMode,
        preferFutureRate,
        setPreferFutureRate
    };
};
