// --- api/status.ts ---
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Configuración de Respuesta Segura 🔌🛡️
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    const health = {
        status: "operational",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        engine: "Konvierte v1.1.0-STABLE",
        services: {
            bcv_scraper: "active",
            binance_p2p_average: "active",
            supabase_connection: "operational"
        }
    };

    return res.status(200).json(health);
}
