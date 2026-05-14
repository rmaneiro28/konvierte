const DOWNLOAD_API = '/api/download';

// Base virtual para dar hype inicial al contador
const VIRTUAL_BASE_DOWNLOADS = 847;

/**
 * Obtiene el total de descargas (real + base virtual)
 */
export const getDownloadCount = async (): Promise<number> => {
    try {
        const res = await fetch(DOWNLOAD_API, { cache: 'no-store' });
        if (!res.ok) return VIRTUAL_BASE_DOWNLOADS;
        const data = await res.json();
        return VIRTUAL_BASE_DOWNLOADS + (data.downloads || 0);
    } catch {
        return VIRTUAL_BASE_DOWNLOADS;
    }
};

/**
 * Registra una descarga y devuelve el conteo actualizado
 */
export const registerDownload = async (version = '1.0'): Promise<number> => {
    try {
        const res = await fetch(DOWNLOAD_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform: 'android', version }),
        });
        if (!res.ok) return VIRTUAL_BASE_DOWNLOADS;
        const data = await res.json();
        return VIRTUAL_BASE_DOWNLOADS + (data.total || 0);
    } catch {
        return VIRTUAL_BASE_DOWNLOADS;
    }
};
