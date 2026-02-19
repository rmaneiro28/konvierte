import { useState, useCallback } from 'react';
import { formatCurrency } from '../utils/formatters';

export const useCalculator = (activeRateValue: number) => {
    const [inputUSD, setInputUSD] = useState('1');
    const [inputVES, setInputVES] = useState('');
    const [focusedInput, setFocusedInput] = useState<'USD' | 'VES' | null>(null);
    const [lastEdited, setLastEdited] = useState<'USD' | 'VES'>('USD');
    const [isInitialState, setIsInitialState] = useState(true);
    const [isInverse, setIsInverse] = useState(false);

    const updateCalculation = useCallback(async (val: string, source: 'USD' | 'VES', rate: number) => {
        try {
            if (rate <= 0) return false;
            const cleanVal = val.replace(/\./g, '').replace(',', '.');

            // Importación dinámica de mathjs para optimizar bundle
            const { evaluate } = await import('mathjs');
            const result = evaluate(cleanVal || '0');

            if (typeof result === 'number' && isFinite(result)) {
                if (source === 'USD') setInputVES(formatCurrency(Math.max(0, result * rate)));
                else setInputUSD(formatCurrency(Math.max(0, result / rate)));
                return true;
            }
        } catch (e) {
            // console.error("Error en cálculo:", e);
        }
        return false;
    }, []);

    const onKeyPress = useCallback((key: string) => {
        if (!focusedInput) return;

        let currentVal = focusedInput === 'USD' ? inputUSD : inputVES;
        const setter = focusedInput === 'USD' ? setInputUSD : setInputVES;

        let newVal = currentVal;

        if (isInitialState) {
            if (key === 'DELETE') {
                newVal = '';
            } else if (key === ',' || key === '.') {
                newVal = '0,';
            } else {
                newVal = key;
            }
            setIsInitialState(false);
        } else {
            if (key === 'DELETE') {
                newVal = currentVal.length <= 1 ? '' : currentVal.slice(0, -1);
            } else if (key === ',' || key === '.') {
                if (!currentVal.includes(',') && !currentVal.includes('.')) {
                    newVal = (currentVal === '' ? '0' : currentVal) + ',';
                }
            } else {
                newVal = currentVal + key;
            }
        }

        setter(newVal);
        updateCalculation(newVal, focusedInput, activeRateValue);

    }, [focusedInput, inputUSD, inputVES, activeRateValue, isInitialState, updateCalculation]);

    const handleInputFocus = useCallback((type: 'USD' | 'VES') => {
        setFocusedInput(type);
        setLastEdited(type);
        setIsInitialState(true);
    }, []);

    const handleReset = useCallback(() => {
        setInputUSD('1');

        // Recalcular VES para 1 USD
        if (activeRateValue > 0) {
            setInputVES(formatCurrency(activeRateValue));
        } else {
            setInputVES('');
        }

        setLastEdited('USD');
        setIsInitialState(true);
        setFocusedInput('USD');
    }, [activeRateValue]);

    const handleSwapCurrencies = useCallback(() => {
        setIsInverse(prev => !prev);
    }, []);

    const setFixedAmount = useCallback((val: string, type: 'USD' | 'VES') => {
        const cleanVal = val.replace(/\./g, '').replace(',', '.');
        if (type === 'USD') setInputUSD(val);
        else setInputVES(val);

        setFocusedInput(null);
        setLastEdited(type);
        updateCalculation(cleanVal, type, activeRateValue);
    }, [activeRateValue, updateCalculation]);

    return {
        inputUSD,
        setInputUSD,
        inputVES,
        setInputVES,
        focusedInput,
        setFocusedInput,
        lastEdited,
        setLastEdited,
        isInitialState,
        setIsInitialState,
        isInverse,
        setIsInverse,
        onKeyPress,
        handleInputFocus,
        handleReset,
        handleSwapCurrencies,
        updateCalculation,
        setFixedAmount
    };
};
