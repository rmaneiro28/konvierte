import { supabase } from '../utils/supabase';

export interface WaitlistEntry {
    name: string;
    whatsapp: string;
    referred_by?: string;
}

const STORAGE_KEY = 'konvierte_user_waitlist_state';

// Base de usuarios para el hype inicial (realista)
const VIRTUAL_BASE_USERS = 1240;

export const joinWaitlist = async (name: string, whatsapp: string, referred_by?: string): Promise<any> => {
    try {
        // 1. Calculamos la posición actual contando la DB
        const { count, error: countError } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;
        
        const currentCount = (count || 0);
        const position = (VIRTUAL_BASE_USERS + currentCount + 1);

        // 2. Generamos el link de referido único
        const refCode = Math.random().toString(36).substring(7);
        const referralLink = `https://konvierte.app/?ref=${refCode}`;

        // 3. Insertamos en Supabase
        const { error } = await supabase
            .from('waitlist')
            .insert([{ 
                name, 
                whatsapp, 
                position, 
                referral_code: refCode,
                referred_by: referred_by || null 
            }])
            .select()
            .single();

        if (error) {
            // Si ya existe por whatsapp, recuperamos su estado sin duplicar
            if (error.code === '23505') {
                 const { data: existingUser } = await supabase
                    .from('waitlist')
                    .select('*')
                    .eq('whatsapp', whatsapp)
                    .single();
                 
                 if (existingUser) {
                    const state = {
                        registered: true,
                        name: existingUser.name,
                        position: existingUser.position,
                        referralLink: `https://konvierte.app/?ref=${existingUser.referral_code}`
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                    return state;
                 }
            }
            throw error;
        }

        const userState = {
            registered: true,
            name,
            position,
            referralLink
        };

        // Persistimos localmente para saber que ya se registró
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userState));

        return userState;
    } catch (error) {
        console.error("Error al unirse a la lista de espera real:", error);
        return null;
    }
};

export const getUserWaitlistState = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch { return null; }
};

export const getWaitlistCount = async (): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return VIRTUAL_BASE_USERS + (count || 0); 
    } catch {
        return VIRTUAL_BASE_USERS;
    }
};
