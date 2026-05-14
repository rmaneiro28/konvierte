import { supabase } from '../utils/supabase';

// Base virtual para dar hype inicial al contador
const VIRTUAL_BASE_DOWNLOADS = 847;

/**
 * Obtiene el total de descargas (real + base virtual)
 */
export const getDownloadCount = async (): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('apk_downloads')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return VIRTUAL_BASE_DOWNLOADS + (count || 0);
    } catch {
        return VIRTUAL_BASE_DOWNLOADS;
    }
};

/**
 * Registra una nueva descarga y devuelve el conteo actualizado
 */
export const registerDownload = async (version = '1.0'): Promise<number> => {
    try {
        const { error } = await supabase
            .from('apk_downloads')
            .insert([{
                platform: 'android',
                version,
                downloaded_at: new Date().toISOString()
            }]);

        if (error) throw error;

        // Obtener total actualizado
        const { count } = await supabase
            .from('apk_downloads')
            .select('*', { count: 'exact', head: true });

        return VIRTUAL_BASE_DOWNLOADS + (count || 0);
    } catch {
        return VIRTUAL_BASE_DOWNLOADS;
    }
};

