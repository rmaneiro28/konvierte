import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { VENEZUELA_BANKS } from '../data/banks';

export interface PaymentMethod {
    id: string;
    alias: string;
    bank: string;
    idNumber: string;
    phoneNumber: string;
    bankCode?: string;
    bankLogo?: string;
    bankColor?: string;
}

const STORAGE_KEY = 'konvierte_payment_methods';

export const usePaymentMethods = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setMethods(JSON.parse(stored));
            } catch (e) {
                console.error("Error loading payment methods", e);
            }
        }
    }, []);

    const saveMethods = (newMethods: PaymentMethod[]) => {
        setMethods(newMethods);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMethods));
    };

    const addMethod = (method: Omit<PaymentMethod, 'id'>) => {
        const bankData = VENEZUELA_BANKS.find(b => b.name === method.bank);
        const newMethod = {
            ...method,
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            bankCode: bankData?.code,
            bankLogo: bankData?.logo,
            bankColor: bankData?.color
        };
        saveMethods([...methods, newMethod]);
        toast.success('Ficha guardada');
    };

    const removeMethod = (id: string) => {
        saveMethods(methods.filter(m => m.id !== id));
        toast.success('Ficha eliminada');
    };

    const validatePhone = (phone: string) => {
        const clean = phone.replace(/\D/g, '');
        let num = clean;

        if (num.startsWith('58')) num = num.substring(2);
        if (num.startsWith('0')) num = num.substring(1);

        const validPrefixes = ['412', '414', '424', '416', '426', '422'];

        if (num.length !== 10) return false;
        if (!validPrefixes.includes(num.substring(0, 3))) return false;

        return true;
    };

    const formatPhoneNumber = (phone: string) => {
        const clean = phone.replace(/\D/g, '');
        let num = clean;

        if (num.startsWith('58')) num = num.substring(2);
        if (num.startsWith('0')) num = num.substring(1);

        if (num.length !== 10) return phone;

        return `0${num.substring(0, 3)}-${num.substring(3)}`;
    };

    const formatToInternational = (phone: string) => {
        const clean = phone.replace(/\D/g, '');
        let num = clean;

        if (num.startsWith('58')) num = num.substring(2);
        if (num.startsWith('0')) num = num.substring(1);

        if (num.length !== 10) return phone;

        return `+58-${num.substring(0, 3)}-${num.substring(3, 6)}-${num.substring(6)}`;
    };

    return {
        methods,
        addMethod,
        removeMethod,
        validatePhone,
        formatPhoneNumber,
        formatToInternational
    };
};
