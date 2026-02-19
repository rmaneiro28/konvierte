import { useState, useEffect, useCallback } from 'react';
import { fetchRates, type RatesState } from '../services/rateService';
import { toast } from 'sonner';

interface CustomRate {
    id: string;
    name: string;
    formula: string;
}

export const useRatesManager = () => {
    const [rates, setRates] = useState<Partial<RatesState>>({ loading: true });
    const [resolvedPrices, setResolvedPrices] = useState<Record<string, { name: string; price: number; flag: string }>>({});

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

    const loadRates = useCallback(async () => {
        try {
            setRates(prev => ({ ...prev, loading: true }));
            const data = await fetchRates();
            setRates({ ...data, loading: false });
            toast.info('Tasas actualizadas');
        } catch (err) {
            setRates(prev => ({ ...prev, loading: false }));
            toast.error('Error al actualizar tasas');
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
        const calculateResolutions = async () => {
            const base: Record<string, number> = {
                bcv_usd: rates.bcv_usd?.price || 0,
                bcv_eur: rates.bcv_eur?.price || 0,
                binance_usd: rates.binance_usd?.price || 0,
            };

            const resolved: Record<string, { name: string; price: number; flag: string }> = {
                bcv_usd: { name: 'Dólar BCV', price: base.bcv_usd, flag: 'us' },
                bcv_eur: { name: 'Euro BCV', price: base.bcv_eur, flag: 'eu' },
                binance_usd: { name: 'Binance', price: base.binance_usd, flag: 'us' },
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
    }, [rates, customRates]);

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
        updateOrder
    };
};
